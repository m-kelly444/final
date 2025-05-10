import axios from 'axios';

const API_KEY = process.env.OTX_API_KEY;
const BASE_URL = 'https://otx.alienvault.com/api/v1';

// Map OTX pulse to normalized structure
const mapPulseToThreat = (pulse: any) => {
  // Map APT group names from tags
  const aptGroup = extractAptGroup(pulse.tags);
  
  // Extract attack methods from tags or description
  const attackMethod = extractAttackMethod(pulse.tags, pulse.description);
  
  // Determine target based on industries or targeted countries
  const target = pulse.targeted_countries?.length 
    ? `${pulse.targeted_countries.join(', ')} Organizations`
    : pulse.industries?.join(', ') || 'Unknown';
  
  // Get location data
  const location = pulse.targeted_countries?.join(', ') || 'Global';
  
  // Calculate confidence based on validator count and references
  const validatorCount = pulse.validator_count || 0;
  const refCount = (pulse.references || []).length;
  const confidence = Math.min(Math.floor((validatorCount + refCount) * 10), 100);
  
  // Get IOCs
  const iocs = extractIocs(pulse.indicators);
  
  return {
    id: pulse.id,
    aptGroup,
    attackMethod,
    target,
    location,
    confidence,
    timestamp: pulse.created,
    details: {
      description: pulse.description,
      author: pulse.author_name,
      references: pulse.references,
      tags: pulse.tags,
    },
    source: 'AlienVault OTX',
    sourceUrl: `https://otx.alienvault.com/pulse/${pulse.id}`,
    ioc: iocs,
    verified: pulse.validator_count > 0,
  };
};

// Extract APT group from tags
const extractAptGroup = (tags: string[]) => {
  // Common APT group naming patterns
  const aptPatterns = [
    /APT\d+/i,               // APT1, APT28, APT29, etc.
    /Lazarus/i,
    /Cozy\s*Bear/i,
    /Fancy\s*Bear/i,
    /Sandworm/i,
    /Kimsuky/i,
    /Conti/i,
    /Winnti/i,
    /Equation\s*Group/i,
    /Turla/i,
  ];
  
  // Check if any tag matches an APT pattern
  for (const tag of tags) {
    for (const pattern of aptPatterns) {
      if (pattern.test(tag)) {
        return tag;
      }
    }
  }
  
  // Default APT group if none found
  return 'Unknown Threat Actor';
};

// Extract attack methods from tags or description
const extractAttackMethod = (tags: string[], description: string) => {
  // Common attack methods
  const attackPatterns = [
    /phishing/i,
    /malware/i,
    /ransomware/i,
    /zero-day/i,
    /exploit/i,
    /backdoor/i,
    /supply\s*chain/i,
    /watering\s*hole/i,
    /DDoS/i,
    /brute\s*force/i,
  ];
  
  // Check tags first
  for (const tag of tags) {
    for (const pattern of attackPatterns) {
      if (pattern.test(tag)) {
        return tag;
      }
    }
  }
  
  // Check description if no match in tags
  for (const pattern of attackPatterns) {
    if (pattern.test(description)) {
      const match = description.match(pattern);
      if (match) {
        return match[0];
      }
    }
  }
  
  // Default attack method if none found
  return 'Unknown Attack Method';
};

// Extract IOCs from indicators
const extractIocs = (indicators: any[]) => {
  if (!indicators || !indicators.length) {
    return '';
  }
  
  // Prioritize IP, domain, and hash indicators
  const iocTypes = ['IPv4', 'domain', 'hostname', 'FileHash-MD5', 'FileHash-SHA1', 'FileHash-SHA256'];
  
  for (const type of iocTypes) {
    const ioc = indicators.find(i => i.type === type);
    if (ioc) {
      return ioc.indicator;
    }
  }
  
  // If no priority IOC found, return the first available
  return indicators[0]?.indicator || '';
};

// Fetch recent pulses from OTX
export async function fetchOtxPulses(limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/pulses/subscribed`, {
      headers: {
        'X-OTX-API-KEY': API_KEY,
      },
      params: {
        limit,
      },
    });
    
    // Map pulses to threat format
    return response.data.results.map(mapPulseToThreat);
  } catch (error) {
    console.error('Error fetching from OTX:', error);
    throw new Error('Failed to fetch threat data from OTX');
  }
}