import { useState, useEffect } from 'react';
import TerminalWindow from '../../components/ui/TerminalWindow';

interface Threat {
  id: string;
  aptGroup: string;
  attackMethod: string;
  target: string;
  location: string;
  confidence: number;
  timestamp: string;
  details?: any;
  source: string;
  sourceUrl?: string;
  ioc?: string;
  verified: boolean;
}

interface ThreatAnalysisProps {
  threats: Threat[];
  aptGroup: string;
}

// Generate countermeasures based on threat
function generateCountermeasures(threat: Threat): string[] {
  const { attackMethod, target } = threat;
  const countermeasures = [];
  
  // Generic countermeasures
  countermeasures.push('Implement real-time threat monitoring for early detection.');
  
  // Attack method specific countermeasures
  if (attackMethod.toLowerCase().includes('phishing')) {
    countermeasures.push('Deploy advanced email filtering and anti-phishing solutions.');
    countermeasures.push('Conduct regular phishing awareness training for all staff.');
  } else if (attackMethod.toLowerCase().includes('malware')) {
    countermeasures.push('Update all endpoint protection systems with latest signatures.');
    countermeasures.push('Implement application whitelisting on critical systems.');
  } else if (attackMethod.toLowerCase().includes('supply chain')) {
    countermeasures.push('Audit all third-party software and vendor security practices.');
    countermeasures.push('Implement strict software supply chain verification protocols.');
  } else if (attackMethod.toLowerCase().includes('zero-day') || attackMethod.toLowerCase().includes('exploit')) {
    countermeasures.push('Ensure all systems are patched with the latest security updates.');
    countermeasures.push('Deploy behavioral-based exploit prevention systems.');
  } else if (attackMethod.toLowerCase().includes('ransomware')) {
    countermeasures.push('Establish robust, air-gapped backup systems with regular testing.');
    countermeasures.push('Segment networks to limit lateral movement capabilities.');
  } else if (attackMethod.toLowerCase().includes('ddos')) {
    countermeasures.push('Implement DDoS mitigation services and traffic filtering.');
    countermeasures.push('Increase bandwidth capacity or use cloud-based protections.');
  } else if (attackMethod.toLowerCase().includes('brute force')) {
    countermeasures.push('Enforce complex password policies and account lockouts.');
    countermeasures.push('Implement multi-factor authentication for all access points.');
  }
  
  // Target specific countermeasures
  if (target.toLowerCase().includes('government')) {
    countermeasures.push('Enhance security clearance protocols for sensitive systems.');
  } else if (target.toLowerCase().includes('financial')) {
    countermeasures.push('Implement additional fraud detection and transaction monitoring.');
  } else if (target.toLowerCase().includes('healthcare')) {
    countermeasures.push('Ensure all patient data is encrypted both at rest and in transit.');
  } else if (target.toLowerCase().includes('energy')) {
    countermeasures.push('Isolate critical infrastructure control systems from external networks.');
  } else if (target.toLowerCase().includes('technology')) {
    countermeasures.push('Review code repositories for unauthorized access or modifications.');
  }
  
  // Add a generic countermeasure if we don't have enough specific ones
  if (countermeasures.length < 3) {
    countermeasures.push('Conduct a comprehensive security assessment focused on this threat profile.');
  }
  
  return countermeasures;
}

export default function ThreatAnalysis({ threats, aptGroup }: ThreatAnalysisProps) {
  const [groupedByAttackMethod, setGroupedByAttackMethod] = useState<Record<string, Threat[]>>({});
  const [attackMethods, setAttackMethods] = useState<string[]>([]);
  const [targetDistribution, setTargetDistribution] = useState<Record<string, number>>({});
  const [locationDistribution, setLocationDistribution] = useState<Record<string, number>>({});
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  
  useEffect(() => {
    if (!threats.length) return;
    
    // Group threats by attack method
    const grouped = threats.reduce((acc: Record<string, Threat[]>, threat) => {
      const method = threat.attackMethod;
      if (!acc[method]) acc[method] = [];
      acc[method].push(threat);
      return acc;
    }, {});
    setGroupedByAttackMethod(grouped);
    setAttackMethods(Object.keys(grouped));
    
    // Calculate target distribution
    const targetCount = threats.reduce((acc: Record<string, number>, threat) => {
      const target = threat.target;
      acc[target] = (acc[target] || 0) + 1;
      return acc;
    }, {});
    setTargetDistribution(targetCount);
    
    // Calculate location distribution
    const locationCount = threats.reduce((acc: Record<string, number>, threat) => {
      const location = threat.location;
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});
    setLocationDistribution(locationCount);
  }, [threats]);
  
  if (!threats.length) {
    return (
      <TerminalWindow title="THREAT ANALYSIS">
        <div className="p-6 text-center text-cyber-green-dim">
          NO THREAT DATA AVAILABLE FOR {aptGroup === 'all' ? 'ANY APT GROUP' : aptGroup}
        </div>
      </TerminalWindow>
    );
  }
  
  // Calculate average confidence
  const avgConfidence = Math.round(
    threats.reduce((sum, threat) => sum + threat.confidence, 0) / threats.length
  );
  
  // Get the most recent threat
  const mostRecent = [...threats].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
  
  // Get the highest confidence threat
  const highestConfidence = [...threats].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Modal for detailed threat view */}
      {selectedThreat && (
        <div className="fixed inset-0 bg-cyber-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="terminal-window max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="terminal-header flex justify-between items-center">
              <div className="terminal-dots">
                <div className="terminal-dot bg-cyber-red"></div>
                <div className="terminal-dot bg-cyber-yellow"></div>
                <div className="terminal-dot bg-cyber-green"></div>
              </div>
              <div className="terminal-title">THREAT DETAILS</div>
              <button 
                onClick={() => setSelectedThreat(null)}
                className="text-cyber-green hover:text-cyber-red transition"
              >
                [CLOSE]
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl text-cyber-green font-bold">
                  {selectedThreat.aptGroup}
                </h3>
                <div className="px-2 py-1 text-xs bg-cyber-green bg-opacity-10 border border-cyber-green">
                  {selectedThreat.confidence}% CONFIDENCE
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-cyber-green-dim mb-1">ATTACK METHOD:</p>
                    <p className="text-cyber-green">{selectedThreat.attackMethod}</p>
                  </div>
                  
                  <div>
                    <p className="text-cyber-green-dim mb-1">TARGET:</p>
                    <p className="text-cyber-green">{selectedThreat.target}</p>
                  </div>
                  
                  <div>
                    <p className="text-cyber-green-dim mb-1">LOCATION:</p>
                    <p className="text-cyber-green">{selectedThreat.location}</p>
                  </div>
                  
                  <div>
                    <p className="text-cyber-green-dim mb-1">TIMESTAMP:</p>
                    <p className="text-cyber-green">{new Date(selectedThreat.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-cyber-green-dim mb-1">SOURCE:</p>
                    <p className="text-cyber-green">{selectedThreat.source}</p>
                  </div>
                  
                  {selectedThreat.sourceUrl && (
                    <div>
                      <p className="text-cyber-green-dim mb-1">SOURCE URL:</p>
                      <a 
                        href={selectedThreat.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyber-blue hover:underline"
                      >
                        {selectedThreat.sourceUrl}
                      </a>
                    </div>
                  )}
                  
                  {selectedThreat.ioc && (
                    <div>
                      <p className="text-cyber-green-dim mb-1">INDICATOR OF COMPROMISE:</p>
                      <p className="text-cyber-green font-mono">{selectedThreat.ioc}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-cyber-green-dim mb-1">VERIFICATION STATUS:</p>
                    <p className={selectedThreat.verified ? "text-cyber-green" : "text-cyber-red"}>
                      {selectedThreat.verified ? 'VERIFIED' : 'UNVERIFIED'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedThreat.details && selectedThreat.details.description && (
                <div className="pt-4 border-t border-cyber-green-dim">
                  <p className="text-cyber-green-dim mb-2">DETAILED DESCRIPTION:</p>
                  <p className="text-cyber-green whitespace-pre-wrap">
                    {selectedThreat.details.description}
                  </p>
                </div>
              )}
              
              {selectedThreat.details && selectedThreat.details.references && selectedThreat.details.references.length > 0 && (
                <div className="pt-4 border-t border-cyber-green-dim">
                  <p className="text-cyber-green-dim mb-2">REFERENCES:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    {selectedThreat.details.references.map((ref: string, index: number) => (
                      <li key={index}>
                        <a 
                          href={ref} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyber-blue hover:underline break-all"
                        >
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Suggested countermeasures */}
              <div className="pt-4 border-t border-cyber-green-dim">
                <p className="text-cyber-yellow mb-2">RECOMMENDED COUNTERMEASURES:</p>
                <ul className="list-disc pl-6 space-y-1">
                  {generateCountermeasures(selectedThreat).map((measure, index) => (
                    <li key={index} className="text-cyber-green">
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    
      {/* Overview statistics */}
      <div className="lg:col-span-3">
        <TerminalWindow title="THREAT INTELLIGENCE SUMMARY">
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">TOTAL THREATS</h4>
              <p className="text-4xl text-cyber-green font-bold">{threats.length}</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">ATTACK METHODS</h4>
              <p className="text-4xl text-cyber-green font-bold">{attackMethods.length}</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">AVG CONFIDENCE</h4>
              <p className="text-4xl text-cyber-green font-bold">{avgConfidence}%</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">TARGET TYPES</h4>
              <p className="text-4xl text-cyber-green font-bold">{Object.keys(targetDistribution).length}</p>
            </div>
          </div>
        </TerminalWindow>
      </div>
      
      {/* Attack methods breakdown */}
      <div className="lg:col-span-2">
        <TerminalWindow title="ATTACK METHODS ANALYSIS">
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
              {attackMethods.map(method => {
                const methodThreats = groupedByAttackMethod[method];
                const methodPercentage = Math.round((methodThreats.length / threats.length) * 100);
                
                return (
                  <div 
                    key={method} 
                    className="border border-cyber-green-dim p-3 cursor-pointer hover:bg-cyber-green hover:bg-opacity-10 transition"
                    onClick={() => setSelectedThreat(methodThreats[0])}
                  >
                    <h4 className="text-cyber-green font-bold mb-2">{method}</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cyber-green-dim">Frequency</span>
                      <span>{methodThreats.length} threats ({methodPercentage}%)</span>
                    </div>
                    <div className="w-full bg-cyber-dark h-2 rounded-full mb-3">
                      <div 
                        className="bg-cyber-green h-2 rounded-full"
                        style={{ width: `${methodPercentage}%` }}
                      />
                    </div>
                    <div className="text-sm">
                      <p>
                        <span className="text-cyber-green-dim">Common Targets: </span>
                        {Array.from(new Set(methodThreats.map(t => t.target))).slice(0, 3).join(', ')}
                      </p>
                      <p>
                        <span className="text-cyber-green-dim">Avg. Confidence: </span>
                        {Math.round(methodThreats.reduce((sum, t) => sum + t.confidence, 0) / methodThreats.length)}%
                      </p>
                      <p className="text-xs text-cyber-blue mt-1">[CLICK FOR DETAILS]</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TerminalWindow>
      </div>
      
      {/* Target distribution */}
      <div className="lg:col-span-1">
        <TerminalWindow title="TARGET DISTRIBUTION">
          <div className="p-4 max-h-96 overflow-y-auto">
            {Object.entries(targetDistribution)
              .sort(([, countA], [, countB]) => countB - countA)
              .map(([target, count]) => {
                const percentage = Math.round((count / threats.length) * 100);
                return (
                  <div key={target} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cyber-green truncate max-w-[70%]">{target}</span>
                      <span className="text-cyber-green-dim">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-cyber-dark h-2 rounded-full">
                      <div 
                        className="bg-cyber-blue h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </TerminalWindow>
      </div>
      
      {/* Location distribution */}
      <div className="lg:col-span-3">
        <TerminalWindow title="GEOGRAPHIC DISTRIBUTION">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(locationDistribution)
              .sort(([, countA], [, countB]) => countB - countA)
              .slice(0, 9) // Show top 9 locations
              .map(([location, count]) => {
                const percentage = Math.round((count / threats.length) * 100);
                return (
                  <div key={location} className="border border-cyber-green-dim border-opacity-50 p-3">
                    <h4 className="text-cyber-green font-bold mb-2">{location}</h4>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cyber-green-dim">Threats</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-cyber-dark h-2 rounded-full">
                      <div 
                        className="bg-cyber-purple h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </TerminalWindow>
      </div>
      
      {/* Recent threat details */}
      <div className="lg:col-span-3">
        <TerminalWindow title="NOTABLE THREATS">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most recent threat */}
            <div 
              className="border border-cyber-green-dim p-4 cursor-pointer hover:bg-cyber-green hover:bg-opacity-10 transition"
              onClick={() => setSelectedThreat(mostRecent)}
            >
              <h4 className="text-cyber-yellow font-bold mb-3">MOST RECENT THREAT</h4>
              <div className="space-y-2">
                <p><span className="text-cyber-green-dim">APT Group:</span> {mostRecent.aptGroup}</p>
                <p><span className="text-cyber-green-dim">Attack Method:</span> {mostRecent.attackMethod}</p>
                <p><span className="text-cyber-green-dim">Target:</span> {mostRecent.target}</p>
                <p><span className="text-cyber-green-dim">Location:</span> {mostRecent.location}</p>
                <p><span className="text-cyber-green-dim">Confidence:</span> {mostRecent.confidence}%</p>
                <p><span className="text-cyber-green-dim">Timestamp:</span> {new Date(mostRecent.timestamp).toLocaleString()}</p>
                <p><span className="text-cyber-green-dim">Source:</span> {mostRecent.source}</p>
                {mostRecent.details?.description && (
                  <div className="mt-3 pt-3 border-t border-cyber-green-dim">
                    <p className="text-cyber-green-dim mb-1">Details:</p>
                    <p className="text-sm">{mostRecent.details.description.substring(0, 150)}...</p>
                  </div>
                )}
                <p className="text-xs text-cyber-blue mt-1">[CLICK FOR FULL DETAILS]</p>
              </div>
            </div>
            
            {/* Highest confidence threat */}
            <div 
              className="border border-cyber-green-dim p-4 cursor-pointer hover:bg-cyber-green hover:bg-opacity-10 transition"
              onClick={() => setSelectedThreat(highestConfidence)}
            >
              <h4 className="text-cyber-red font-bold mb-3">HIGHEST CONFIDENCE THREAT</h4>
              <div className="space-y-2">
                <p><span className="text-cyber-green-dim">APT Group:</span> {highestConfidence.aptGroup}</p>
                <p><span className="text-cyber-green-dim">Attack Method:</span> {highestConfidence.attackMethod}</p>
                <p><span className="text-cyber-green-dim">Target:</span> {highestConfidence.target}</p>
                <p><span className="text-cyber-green-dim">Location:</span> {highestConfidence.location}</p>
                <p><span className="text-cyber-green-dim">Confidence:</span> {highestConfidence.confidence}%</p>
                <p><span className="text-cyber-green-dim">Timestamp:</span> {new Date(highestConfidence.timestamp).toLocaleString()}</p>
                <p><span className="text-cyber-green-dim">Source:</span> {highestConfidence.source}</p>
                {highestConfidence.details?.description && (
                  <div className="mt-3 pt-3 border-t border-cyber-green-dim">
                    <p className="text-cyber-green-dim mb-1">Details:</p>
                    <p className="text-sm">{highestConfidence.details.description.substring(0, 150)}...</p>
                  </div>
                )}
                <p className="text-xs text-cyber-blue mt-1">[CLICK FOR FULL DETAILS]</p>
              </div>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}