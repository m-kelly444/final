// Database seeding script for Echelon
// Run with: node scripts/seed-db.js

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const crypto = require('crypto');

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Sample threat data for seeding
const sampleThreats = [
  {
    aptGroup: 'APT29',
    attackMethod: 'Spear Phishing',
    target: 'Government',
    location: 'Western Europe',
    confidence: 87,
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    details: {
      description: 'APT29 actors launched a sophisticated spear phishing campaign targeting government officials with malicious documents disguised as COVID-19 vaccine information.',
      references: ['https://www.example.com/threat-report-1'],
    },
    source: 'AlienVault OTX',
    sourceUrl: 'https://otx.alienvault.com/pulse/example1',
    ioc: '185.193.38.54',
    verified: true,
  },
  {
    aptGroup: 'APT41',
    attackMethod: 'Supply Chain Attack',
    target: 'Technology Sector',
    location: 'North America',
    confidence: 92,
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    details: {
      description: 'APT41 actors compromised a software provider to deliver malicious updates to technology companies, establishing persistent backdoor access.',
      references: ['https://www.example.com/threat-report-2'],
    },
    source: 'AlienVault OTX',
    sourceUrl: 'https://otx.alienvault.com/pulse/example2',
    ioc: 'malware.example.com',
    verified: true,
  },
  {
    aptGroup: 'Lazarus Group',
    attackMethod: 'Zero-day Exploit',
    target: 'Financial',
    location: 'Global',
    confidence: 76,
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    details: {
      description: 'Lazarus Group exploited a previously unknown vulnerability in a widely-used financial software platform, targeting cryptocurrency exchanges.',
      references: ['https://www.example.com/threat-report-3'],
    },
    source: 'AbuseIPDB',
    sourceUrl: 'https://www.abuseipdb.com/check/example3',
    ioc: '91.243.45.16',
    verified: false,
  },
  {
    aptGroup: 'APT28',
    attackMethod: 'Credential Theft',
    target: 'Military',
    location: 'Eastern Europe',
    confidence: 89,
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    details: {
      description: 'APT28 actors stole credentials from military personnel using a social engineering campaign that leveraged fake military benefits announcements.',
      references: ['https://www.example.com/threat-report-4'],
    },
    source: 'AlienVault OTX',
    sourceUrl: 'https://otx.alienvault.com/pulse/example4',
    ioc: 'military-benefits.example.com',
    verified: true,
  },
  {
    aptGroup: 'Sandworm',
    attackMethod: 'DDoS Attack',
    target: 'Energy Sector',
    location: 'Ukraine',
    confidence: 84,
    timestamp: new Date(Date.now() - 18000000), // 5 hours ago
    details: {
      description: 'Sandworm launched a coordinated DDoS attack against energy infrastructure providers, temporarily disrupting operations in multiple facilities.',
      references: ['https://www.example.com/threat-report-5'],
    },
    source: 'AbuseIPDB',
    sourceUrl: 'https://www.abuseipdb.com/check/example5',
    ioc: '194.58.112.44',
    verified: true,
  },
];

// Sample prediction data
const samplePredictions = [
  {
    aptGroup: 'APT29',
    attackMethod: 'Spear Phishing',
    targetType: 'Government',
    confidence: 87,
    timestamp: new Date(),
    features: { 
      recentActivity: 0.8,
      targetValue: 0.9,
      geopoliticalTension: 0.7
    },
    description: 'Highly likely spear phishing campaign by APT29 targeting government organizations in the near future. Based on recent threat intelligence and historical attack patterns.'
  },
  {
    aptGroup: 'APT41',
    attackMethod: 'Supply Chain Attack',
    targetType: 'Technology',
    confidence: 75,
    timestamp: new Date(),
    features: { 
      recentActivity: 0.6,
      targetValue: 0.8,
      geopoliticalTension: 0.5
    },
    description: 'Likely supply chain attack by APT41 targeting technology organizations in the next 1-2 months. Based on recent threat intelligence and historical attack patterns.'
  },
  {
    aptGroup: 'Lazarus Group',
    attackMethod: 'Zero-day Exploit',
    targetType: 'Financial',
    confidence: 82,
    timestamp: new Date(),
    features: { 
      recentActivity: 0.7,
      targetValue: 0.9,
      geopoliticalTension: 0.6
    },
    description: 'Potential zero-day exploit campaign by Lazarus Group targeting financial organizations in the coming weeks. Based on recent threat intelligence and historical attack patterns.'
  }
];

// Sample user
const sampleUser = {
  id: crypto.randomUUID(),
  name: 'Demo User',
  email: 'demo@echelon.gov',
  password: '$2b$10$OQSIreKV9RFhFy1UEsXlvePzUe27UTWcvLJGcfO8r0T7LehZdP8Rq', // hashed 'demo123'
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date()
};

// Database seeding function
async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Create tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT NOT NULL UNIQUE,
        "emailVerified" TIMESTAMP,
        password TEXT,
        image TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS threats (
        id SERIAL PRIMARY KEY,
        apt_group VARCHAR(50) NOT NULL,
        attack_method VARCHAR(100) NOT NULL,
        target VARCHAR(100),
        location VARCHAR(100),
        confidence INTEGER,
        timestamp TIMESTAMP DEFAULT NOW(),
        details JSONB,
        source VARCHAR(50) NOT NULL,
        source_url VARCHAR(500),
        ioc VARCHAR(500),
        verified BOOLEAN DEFAULT FALSE
      )
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS predictions (
        id SERIAL PRIMARY KEY,
        apt_group VARCHAR(50) NOT NULL,
        attack_method VARCHAR(100) NOT NULL,
        target_type VARCHAR(100),
        confidence INTEGER NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        features JSONB,
        description TEXT
      )
    `);
    
    // Insert demo user
    await client.query(`
      INSERT INTO users (id, name, email, "emailVerified", password, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO UPDATE 
      SET name = $2, password = $5, "updatedAt" = $7
    `, [
      sampleUser.id, 
      sampleUser.name, 
      sampleUser.email, 
      sampleUser.emailVerified,
      sampleUser.password,
      sampleUser.createdAt,
      sampleUser.updatedAt
    ]);
    
    // Insert threats
    for (const threat of sampleThreats) {
      await client.query(`
        INSERT INTO threats 
        (apt_group, attack_method, target, location, confidence, timestamp, details, source, source_url, ioc, verified)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        threat.aptGroup,
        threat.attackMethod,
        threat.target,
        threat.location,
        threat.confidence,
        threat.timestamp,
        JSON.stringify(threat.details),
        threat.source,
        threat.sourceUrl,
        threat.ioc,
        threat.verified
      ]);
    }
    
    // Insert predictions
    for (const prediction of samplePredictions) {
      await client.query(`
        INSERT INTO predictions 
        (apt_group, attack_method, target_type, confidence, timestamp, features, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        prediction.aptGroup,
        prediction.attackMethod,
        prediction.targetType,
        prediction.confidence,
        prediction.timestamp,
        JSON.stringify(prediction.features),
        prediction.description
      ]);
    }
    
    await client.query('COMMIT');
    console.log('Database seeded successfully!');
    
    // Count rows
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const threatCount = await client.query('SELECT COUNT(*) FROM threats');
    const predictionCount = await client.query('SELECT COUNT(*) FROM predictions');
    
    console.log(`Users: ${userCount.rows[0].count}`);
    console.log(`Threats: ${threatCount.rows[0].count}`);
    console.log(`Predictions: ${predictionCount.rows[0].count}`);
    
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seeding
seedDatabase();