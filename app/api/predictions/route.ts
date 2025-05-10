import { NextResponse } from 'next/server';
import { loadModel, runPrediction } from '../../../lib/ml/model';
import { preprocessThreatData } from '../../../lib/ml/preprocess';
import { db } from '../../../lib/db';
import { threats, predictions } from '../../../lib/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get recent threat data for input features
    const recentThreats = await db.select().from(threats)
      .orderBy(desc(threats.timestamp))
      .limit(50);
    
    // If no threats are found in the database, return an empty array
    if (!recentThreats.length) {
      return NextResponse.json([]);
    }
    
    // Preprocess the data for the model
    const processedData = preprocessThreatData(recentThreats);
    
    // Load the ML model
    const model = await loadModel();
    
    // Generate predictions
    const predictionResults = await runPrediction(model, processedData);
    
    // Store predictions in the database
    await storePredictions(predictionResults);
    
    return NextResponse.json(predictionResults);
  } catch (error) {
    console.error('Error generating predictions:', error);
    
    // Fallback to existing predictions if available
    try {
      const existingPredictions = await db.select().from(predictions)
        .orderBy(desc(predictions.timestamp))
        .limit(5);
      
      if (existingPredictions.length) {
        return NextResponse.json(existingPredictions);
      }
    } catch (dbError) {
      console.error('Error fetching existing predictions:', dbError);
    }
    
    return NextResponse.json(
      { error: 'Failed to generate predictions' },
      { status: 500 }
    );
  }
}

/**
 * Store predictions in the database
 */
async function storePredictions(predictionData: any[]) {
  try {
    // Extract the data we want to store
    const predictionRecords = predictionData.map(pred => ({
      aptGroup: pred.aptGroup,
      attackMethod: pred.attackMethod,
      targetType: pred.targetType,
      confidence: pred.confidence,
      timestamp: new Date(),
      features: pred.features || {},
      description: pred.description,
    }));
    
    // Insert the predictions
    await db.insert(predictions).values(predictionRecords);
  } catch (error) {
    console.error('Error storing predictions:', error);
    // Continue execution even if storage fails
  }
}