/**
 * Preprocess threat data for ML model input
 */
export function preprocessThreatData(threats: any[]) {
    if (!threats || !threats.length) {
      return { features: [], metadata: { inputFeatures: [] } };
    }
    
    // Features we'll extract from threat data
    const processedFeatures = [];
    const featureMetadata = [];
    
    // Process each threat
    for (const threat of threats) {
      // Extract numerical features
      const features = extractFeatures(threat);
      processedFeatures.push(features);
      
      // Store metadata for interpretability
      featureMetadata.push({
        id: threat.id,
        aptGroup: threat.aptGroup,
        attackMethod: threat.attackMethod,
        target: threat.target,
        timestamp: threat.timestamp,
      });
    }
    
    // Aggregate features for model input
    const aggregatedFeatures = aggregateFeatures(processedFeatures);
    
    return {
      features: [aggregatedFeatures], // Model expects a batch
      metadata: {
        inputFeatures: featureMetadata,
        threatCount: threats.length,
        processedAt: new Date().toISOString(),
      },
    };
  }
  
  /**
   * Extract numerical features from a threat
   */
  function extractFeatures(threat: any) {
    // Feature vector for this threat
    const features = [];
    
    // 1. APT group encoding
    const aptGroupEncoding = encodeAptGroup(threat.aptGroup);
    features.push(...aptGroupEncoding);
    
    // 2. Attack method encoding
    const attackMethodEncoding = encodeAttackMethod(threat.attackMethod);
    features.push(...attackMethodEncoding);
    
    // 3. Target encoding
    const targetEncoding = encodeTarget(threat.target);
    features.push(...targetEncoding);
    
    // 4. Location encoding
    const locationEncoding = encodeLocation(threat.location);
    features.push(...locationEncoding);
    
    // 5. Confidence score (normalized)
    const confidenceNormalized = threat.confidence ? threat.confidence / 100 : 0.5;
    features.push(confidenceNormalized);
    
    // 6. Recency feature (how recent is the threat)
    const recencyFeature = calculateRecency(threat.timestamp);
    features.push(recencyFeature);
    
    // 7. Verification status
    const verificationFeature = threat.verified ? 1.0 : 0.0;
    features.push(verificationFeature);
    
    return features;
  }
  
  /**
   * Encode APT group as a one-hot vector
   */
  function encodeAptGroup(aptGroup: string) {
    // List of known APT groups
    const knownGroups = [
      'APT28', 'APT29', 'APT33', 'APT41', 
      'Lazarus Group', 'Sandworm', 'Kimsuky',
      // Add more groups as needed
    ];
    
    // One-hot encoding
    const encoding = new Array(knownGroups.length).fill(0);
    
    // Find the index of the APT group
    const index = knownGroups.findIndex(
      group => aptGroup && aptGroup.toLowerCase().includes(group.toLowerCase())
    );
    
    // Set the value to 1 if found, otherwise leave all zeros (unknown group)
    if (index !== -1) {
      encoding[index] = 1;
    }
    
    return encoding;
  }
  
  /**
   * Encode attack method as a one-hot vector
   */
  function encodeAttackMethod(attackMethod: string) {
    // List of known attack methods
    const knownMethods = [
      'phishing', 'malware', 'ransomware', 'zero-day', 'exploit',
      'supply chain', 'ddos', 'brute force', 'web application',
      // Add more methods as needed
    ];
    
    // One-hot encoding
    const encoding = new Array(knownMethods.length).fill(0);
    
    // Check if the attack method contains any of the known methods
    if (attackMethod) {
      knownMethods.forEach((method, index) => {
        if (attackMethod.toLowerCase().includes(method)) {
          encoding[index] = 1;
        }
      });
    }
    
    return encoding;
  }
  
  /**
   * Encode target as a one-hot vector
   */
  function encodeTarget(target: string) {
    // List of known targets
    const knownTargets = [
      'government', 'financial', 'energy', 'healthcare', 'technology',
      'defense', 'infrastructure', 'research',
      // Add more targets as needed
    ];
    
    // One-hot encoding
    const encoding = new Array(knownTargets.length).fill(0);
    
    // Check if the target contains any of the known targets
    if (target) {
      knownTargets.forEach((known, index) => {
        if (target.toLowerCase().includes(known)) {
          encoding[index] = 1;
        }
      });
    }
    
    return encoding;
  }
  
  /**
   * Encode location as a regional feature vector
   */
  function encodeLocation(location: string) {
    // List of regions
    const regions = [
      'north america', 'south america', 'europe', 'asia',
      'africa', 'middle east', 'australia', 'global',
      // Add more regions as needed
    ];
    
    // Initialize encoding
    const encoding = new Array(regions.length).fill(0);
    
    // Set 'global' by default if no location specified
    if (!location) {
      const globalIndex = regions.indexOf('global');
      if (globalIndex !== -1) {
        encoding[globalIndex] = 1;
      }
      return encoding;
    }
    
    // Check if the location matches any region
    regions.forEach((region, index) => {
      if (location.toLowerCase().includes(region)) {
        encoding[index] = 1;
      }
    });
    
    // If specific countries are mentioned, map them to regions
    if (location.toLowerCase().includes('usa') || location.toLowerCase().includes('canada')) {
      const naIndex = regions.indexOf('north america');
      if (naIndex !== -1) {
        encoding[naIndex] = 1;
      }
    }
    
    // Add more country-to-region mappings as needed
    
    return encoding;
  }
  
  /**
   * Calculate recency feature (how recent the threat is)
   */
  function calculateRecency(timestamp: string) {
    if (!timestamp) return 0.5; // Default if no timestamp
    
    const threatDate = new Date(timestamp);
    const now = new Date();
    
    // Calculate days difference
    const differenceMs = now.getTime() - threatDate.getTime();
    const daysDifference = differenceMs / (1000 * 60 * 60 * 24);
    
    // Normalize: 0 = old (30+ days), 1 = very recent (today)
    return Math.max(0, 1 - daysDifference / 30);
  }
  
  /**
   * Aggregate features from multiple threats
   */
  function aggregateFeatures(featuresList: number[][]) {
    // If no features, return empty array
    if (!featuresList.length) {
      return [];
    }
    
    // Get the length of each feature vector
    const featureLength = featuresList[0].length;
    
    // Initialize the aggregated features
    const aggregated = new Array(featureLength).fill(0);
    
    // Sum up all features
    featuresList.forEach(features => {
      features.forEach((value, index) => {
        aggregated[index] += value;
      });
    });
    
    // Average the features
    return aggregated.map(sum => sum / featuresList.length);
  }