import { NextResponse } from 'next/server';
import { fetchOtxPulses } from '../../../../lib/api/otx';
import { fetchAbuseReports } from '../../../../lib/api/abuseipdb';
import { db } from '../../../../lib/db';
import { threats } from '../../../../lib/db/schema';
import { trainModel } from '../../../../lib/ml/train';
import { desc } from 'drizzle-orm';

export async function POST() {
  try {
    // Fetch a larger dataset of real threat data for training
    console.log('Fetching real-time threat data for model training...');
    
    const [otxData, abuseData] = await Promise.all([
      fetchOtxPulses(50),  // Get more data for training
      fetchAbuseReports(50)
    ]);
    
    // Combine and normalize the data
    const allThreats = [...otxData, ...abuseData];
    console.log(`Fetched ${allThreats.length} real threat data points for training`);
    
    // Get existing threat data from the database to supplement the training
    const storedThreats = await db.select().from(threats)
      .orderBy(desc(threats.timestamp))
      .limit(200);
      
    console.log(`Added ${storedThreats.length} stored threats to training data`);
    
    // Combine all available data for training
    const trainingData = [...allThreats, ...storedThreats];
    
    // Train the model with real data
    console.log('Starting model training with real-time threat data...');
    const model = await trainModel(trainingData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Model trained successfully with real-time threat data',
      dataPoints: trainingData.length
    });
    
  } catch (error) {
    console.error('Error training model:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to train model with real-time data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}