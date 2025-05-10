# API Keys Guide for Echelon

To make Echelon fully functional with real threat data (not mock data), you'll need to obtain API keys from the following services:

## 1. AlienVault OTX

1. Go to [AlienVault OTX](https://otx.alienvault.com/)
2. Create a free account
3. Navigate to your profile settings
4. Find the API key section
5. Copy your API key
6. Add to your `.env.local` file as `OTX_API_KEY=your_key_here`

**Note**: The free tier allows up to 1,000 requests per day, which is sufficient for the Echelon project.

## 2. AbuseIPDB

1. Go to [AbuseIPDB](https://www.abuseipdb.com/)
2. Create a free account
3. Navigate to the API section
4. Generate a new API key
5. Copy your API key
6. Add to your `.env.local` file as `ABUSEIPDB_API_KEY=your_key_here`

**Note**: The free tier allows up to 1,000 requests per day, which should be sufficient for testing.

## 3. Optional - GreyNoise (for enhanced data)

If you want additional threat intelligence data:

1. Go to [GreyNoise](https://www.greynoise.io/)
2. Create a free community account
3. Navigate to the API section
4. Generate a new API key
5. Copy your API key
6. Add to your `.env.local` file as `GREYNOISE_API_KEY=your_key_here`

## Usage Limits

Be aware of the API usage limits for these services. To avoid excessive API calls:

1. Implement caching for API responses
2. Add rate limiting in your application
3. Consider using the database to store threat data between sessions

The current implementation in Echelon includes caching and database storage to minimize API calls.

## Testing Without API Keys

If you don't have API keys or want to test without making real API calls:

1. The application will fall back to using stored data in the database
2. You can seed the database with sample threat data (see `scripts/seed-db.js`)
3. For development purposes only, you can uncomment the mock data in the API routes