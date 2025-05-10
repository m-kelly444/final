import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '../../../../lib/db';
import { predictions } from '../../../../lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Check if model weights file exists
    const weightsPath = path.join(process.cwd(), 'public', 'models', 'threat_prediction', 'weights.bin');
    let modelExists = false;
    let modelSize = 0;
    
    try {
      if (fs.existsSync(weightsPath)) {
        modelExists = true;
        const stats = fs.statSync(weightsPath);
        modelSize = stats.size;
      }
    } catch (error) {
      console.error('Error checking model file:', error);
    }
    
    // Get prediction stats from database
    const predictionCount = await db.select({ count: db.fn.count() }).from(predictions);
    const latestPrediction = await db.select().from(predictions)
      .orderBy(desc(predictions.timestamp))
      .limit(1);
    
    const modelStats = {
      modelExists,
      modelSize: modelSize ? Math.round(modelSize / (1024 * 1024) * 100) / 100 + ' MB' : 'N/A',
      lastTrained: modelExists ? fs.statSync(weightsPath).mtime.toISOString() : 'Never',
      predictionCount: predictionCount[0]?.count || 0,
      latestPrediction: latestPrediction[0] || null,
    };
    
    return NextResponse.json(modelStats);
  } catch (error) {
    console.error('Error checking model status:', error);
    return NextResponse.json(
      { error: 'Failed to check model status' },
      { status: 500 }
    );
  }
}