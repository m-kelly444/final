import { NextResponse } from 'next/server';
import { fetchOtxPulses } from '../../../../lib/api/otx';
import { fetchAbuseReports } from '../../../../lib/api/abuseipdb';
import { db } from '../../../../lib/db';
import { threats } from '../../../../lib/db/schema';
import { trainModel } from '../../../../lib/ml/train';
import { desc } from 'drizzle-orm';

// This is a protected endpoint that should only be called by Vercel Cron
export async function GET(request: Request) {
  // Verify that this is a legitimate cron job from Vercel
  // In production, you should use a proper auth mechanism
  const authHeader = request.headers.get('authorization');
  
  // This is just a simple example - in production use a proper secret
  const isAuthorized = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  // For Vercel Cron Jobs specifically
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
  
  if (!isVercelCron && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[CRON] Starting automated model training...');
    
    // Fetch real-time threat data for training
    const [otxData, abuseData] = await Promise.all([
      fetchOtxPulses(30),
      fetchAbuseReports(30)
    ]);
    
    // Combine and normalize the data
    const allThreats = [...otxData, ...abuseData];
    console.log(`[CRON] Fetched ${allThreats.length} real threat data points`);
    
    // Get existing threat data from the database to supplement the training
    const storedThreats = await db.select().from(threats)
      .orderBy(desc(threats.timestamp))
      .limit(150);
      
    console.log(`[CRON] Added ${storedThreats.length} stored threats to training data`);
    
    // Combine all available data for training
    const trainingData = [...allThreats, ...storedThreats];
    
    // Train the model with real data
    console.log('[CRON] Starting model training with real-time threat data...');
    const model = await trainModel(trainingData);
    
    console.log('[CRON] Model training complete');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Automated model training completed successfully',
      timestamp: new Date().toISOString(),
      dataPoints: trainingData.length
    });
    
  } catch (error) {
    console.error('[CRON] Error in automated model training:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to complete automated model training',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}