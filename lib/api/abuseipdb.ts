import axios from 'axios';

const API_KEY = process.env.ABUSEIPDB_API_KEY;
const BASE_URL = 'https://api.abuseipdb.com/api/v2';

// Map attack categories
const CATEGORY_MAP = {
  1: 'DNS Compromise',
  2: 'DNS Poisoning',
  3: 'Fraud Orders',
  4: 'DDoS Attack',
  5: 'FTP Brute Force',
  6: 'Ping of Death',
  7: 'Phishing',
  8: 'Fraud VoIP',
  9: 'Open Proxy',
  10: 'Web Spam',
  11: 'Email Spam',
  12: 'Blog Spam',
  13: 'VPN IP',
  14: 'Port Scan',
  15: 'Hacking',
  16: 'SQL Injection',
  17: 'Spoofing',
  18: 'Brute Force',
  19: 'Bad Web Bot',
  20: 'Exploited Host',
  21: 'Web App Attack',
  22: 'SSH',
  23: 'IoT Targeted',
};

// Map AbuseIPDB report to normalized structure
const mapReportToThreat = (report: any) => {
  // Determine attack method from categories
  const attackMethod = getAttackMethodFromCategories(report.categories);
  
  // Estimated APT group from country and attack type
  const aptGroup = estimateAptGroup(report.countryCode, attackMethod);
  
  // Target is typically network/infrastructure for IP-based attacks
  const target = 'Network Infrastructure';
  
  // Location from country code
  const location = report.countryName || 'Unknown';
  
  // Confidence from abuse score
  const confidence = report.abuseConfidenceScore || 0;
  
  return {
    id: `abuseipdb-${report.ipAddress}-${Date.now()}`,
    aptGroup,
    attackMethod,
    target,
    location,
    confidence,
    timestamp: report.lastReportedAt,
    details: {
      ipAddress: report.ipAddress,
      totalReports: report.totalReports,
      categories: report.categories.map((c: number) => CATEGORY_MAP[c as keyof typeof CATEGORY_MAP] || `Category ${c}`),
      domain: report.domain,
      hostnames: report.hostnames,
    },
    source: 'AbuseIPDB',
    sourceUrl: `https://www.abuseipdb.com/check/${report.ipAddress}`,
    ioc: report.ipAddress,
    verified: report.totalReports > 1,
  };
};

// Get attack method from categories
const getAttackMethodFromCategories = (categories: number[]) => {
  if (!categories || !categories.length) {
    return 'Unknown Attack';
  }
  
  // Map categories to more generalized attack methods
  const attackMethods = categories.map(c => {
    const category = CATEGORY_MAP[c as keyof typeof CATEGORY_MAP];
    if (!category) return null;
    
    if (category.includes('Brute Force')) return 'Brute Force';
    if (category.includes('DDoS')) return 'DDoS Attack';
    if (category.includes('Phishing')) return 'Phishing';
    if (category.includes('SQL Injection')) return 'SQL Injection';
    if (category.includes('Spam')) return 'Spam Campaign';
    if (category.includes('Scan')) return 'Port Scanning';
    if (category.includes('Hacking')) return 'Hacking';
    if (category.includes('Exploit')) return 'Exploit';
    
    return category;
  }).filter(m => m !== null);
  
  // Return the first valid attack method
  return attackMethods[0] || 'Multiple Attacks';
};

// Estimate APT group based on country and attack method
// Note: This is an educated guess since AbuseIPDB doesn't identify APT groups directly
const estimateAptGroup = (countryCode: string, attackMethod: string) => {
  // This mapping is based on known APT groups and their countries of origin
  // This is simplified and for demonstration purposes
  if (!countryCode) return 'Unknown Threat Actor';
  
  const aptMap: Record<string, string[]> = {
    'RU': ['APT28', 'APT29', 'Sandworm'],
    'CN': ['APT1', 'APT10', 'APT41'],
    'IR': ['APT33', 'APT35', 'Charming Kitten'],
    'KP': ['Lazarus Group', 'Kimsuky'],
    'IN': ['Sidewinder', 'Confucius'],
    'PK': ['Transparent Tribe'],
    'VN': ['APT32', 'OceanLotus'],
  };
  
  // Get potential APT groups for the country
  const potentialGroups = aptMap[countryCode] || ['Unknown Actor'];
  
  // Simple heuristic to pick a group based on attack method
  if (attackMethod.includes('DDoS') && countryCode === 'RU') {
    return 'Sandworm';
  } else if (attackMethod.includes('Phishing') && countryCode === 'RU') {
    return 'APT29';
  } else if ((attackMethod.includes('Brute') || attackMethod.includes('SSH')) && countryCode === 'CN') {
    return 'APT41';
  } else if (attackMethod.includes('Exploit') && countryCode === 'KP') {
    return 'Lazarus Group';
  }
  
  // Pick a random APT group from the country's known groups
  return potentialGroups[Math.floor(Math.random() * potentialGroups.length)];
};

// Fetch reports from AbuseIPDB
export async function fetchAbuseReports(limit = 10) {
  try {
    const response = await axios.get(`${BASE_URL}/blacklist`, {
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json',
      },
      params: {
        limit,
        confidenceMinimum: 90,
      },
    });
    
    // Process and enhance the data
    const reports = await Promise.all(
      response.data.data.map(async (report: any) => {
        // Get additional details for each IP
        const details = await getIpDetails(report.ipAddress);
        return { ...report, ...details };
      })
    );
    
    // Map reports to threat format
    return reports.map(mapReportToThreat);
  } catch (error) {
    console.error('Error fetching from AbuseIPDB:', error);
    throw new Error('Failed to fetch threat data from AbuseIPDB');
  }
}

// Get detailed information about an IP
async function getIpDetails(ipAddress: string) {
  try {
    const response = await axios.get(`${BASE_URL}/check`, {
      headers: {
        'Key': API_KEY,
        'Accept': 'application/json',
      },
      params: {
        ipAddress,
        maxAgeInDays: 30,
      },
    });
    
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching details for IP ${ipAddress}:`, error);
    return {};
  }
}