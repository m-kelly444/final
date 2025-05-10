import { NextResponse } from 'next/server';
import { fetchOtxPulses } from '../../../lib/api/otx';
import { fetchAbuseReports } from '../../../lib/api/abuseipdb';
import { db } from '../../../lib/db';
import { threats } from '../../../lib/db/schema';
import { incrementalTraining } from '../../../lib/ml/continuous-learning';

export async function GET() {
  try {
    // Fetch real threat data from multiple sources
    const [otxData, abuseData] = await Promise.all([
      fetchOtxPulses(10),
      fetchAbuseReports(10)
    ]);
    
    // Combine the data
    const allThreats = [...otxData, ...abuseData];
    
    // Sort by timestamp (most recent first)
    allThreats.sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Store new threats in the database
    await storeThreats(allThreats);
    
    // Perform incremental training in the background (non-blocking)
    // Only do this occasionally to avoid too much processing
    if (Math.random() < 0.1) { // 10% chance on each API call
      // Don't await this - let it run in the background
      incrementalTraining(allThreats, 5).catch(err => {
        console.error('Background incremental training error:', err);
      });
    }
    
    return NextResponse.json(allThreats);
  } catch (error) {
    console.error('Error fetching threat data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch threat data' },
      { status: 500 }
    );
  }
}

/**
 * Store threats in the database
 */
async function storeThreats(threatData: any[]) {
  try {
    // Get existing threat IDs to avoid duplicates
    const existingThreats = await db.select({ id: threats.id }).from(threats);
    const existingIds = existingThreats.map(t => t.id);
    
    // Filter out threats that already exist in the database
    const newThreats = threatData.filter(threat => !existingIds.includes(threat.id));
    
    // If there are new threats, insert them
    if (newThreats.length > 0) {
      const threatRecords = newThreats.map(threat => ({
        id: threat.id,
        aptGroup: threat.aptGroup,
        attackMethod: threat.attackMethod,
        target: threat.target,
        location: threat.location,
        confidence: threat.confidence,
        timestamp: new Date(threat.timestamp),
        details: threat.details,
        source: threat.source,
        sourceUrl: threat.sourceUrl,
        ioc: threat.ioc,
        verified: threat.verified,
      }));
      
      await db.insert(threats).values(threatRecords);
    }
  } catch (error) {
    console.error('Error storing threats:', error);
    // Continue execution even if storage fails
  }
}