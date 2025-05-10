import { useState, useEffect } from 'react';
import TerminalWindow from '../../components/ui/TerminalWindow';

interface Prediction {
  id: number;
  aptGroup: string;
  attackMethod: string;
  targetType: string;
  confidence: number;
  timestamp: string;
  description: string;
  features?: any;
}

interface PredictionDetailsProps {
  predictions: Prediction[];
  aptGroup: string;
}

export default function PredictionDetails({ predictions, aptGroup }: PredictionDetailsProps) {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  
  // Select the highest confidence prediction by default
  useEffect(() => {
    if (predictions.length > 0) {
      const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
      setSelectedPrediction(sorted[0]);
    } else {
      setSelectedPrediction(null);
    }
  }, [predictions]);
  
  if (!predictions.length) {
    return (
      <TerminalWindow title="ML PREDICTIONS">
        <div className="p-6 text-center text-cyber-green-dim">
          NO PREDICTION DATA AVAILABLE FOR {aptGroup === 'all' ? 'ANY APT GROUP' : aptGroup}
        </div>
      </TerminalWindow>
    );
  }
  
  // Group predictions by attack method
  const attackMethodGroups = predictions.reduce((acc: Record<string, Prediction[]>, pred) => {
    const method = pred.attackMethod;
    if (!acc[method]) acc[method] = [];
    acc[method].push(pred);
    return acc;
  }, {});
  
  // Group predictions by target type
  const targetGroups = predictions.reduce((acc: Record<string, Prediction[]>, pred) => {
    const target = pred.targetType;
    if (!acc[target]) acc[target] = [];
    acc[target].push(pred);
    return acc;
  }, {});
  
  // Calculate average confidence
  const avgConfidence = Math.round(
    predictions.reduce((sum, pred) => sum + pred.confidence, 0) / predictions.length
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overview statistics */}
      <div className="lg:col-span-3">
        <TerminalWindow title="PREDICTION ENGINE SUMMARY">
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">TOTAL PREDICTIONS</h4>
              <p className="text-4xl text-cyber-green font-bold">{predictions.length}</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">ATTACK VECTORS</h4>
              <p className="text-4xl text-cyber-green font-bold">{Object.keys(attackMethodGroups).length}</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">TARGET TYPES</h4>
              <p className="text-4xl text-cyber-green font-bold">{Object.keys(targetGroups).length}</p>
            </div>
            <div className="border border-cyber-green-dim p-3">
              <h4 className="text-cyber-green-dim mb-2">AVG CONFIDENCE</h4>
              <p className="text-4xl text-cyber-green font-bold">{avgConfidence}%</p>
            </div>
          </div>
        </TerminalWindow>
      </div>
      
      {/* Prediction selection and detailed view */}
      <div className="lg:col-span-2">
        <TerminalWindow title="PREDICTION DETAILS">
          {selectedPrediction ? (
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl text-cyber-green font-bold">
                  {selectedPrediction.aptGroup}
                </h3>
                <div className="px-2 py-1 text-xs bg-cyber-green bg-opacity-10 border border-cyber-green">
                  {selectedPrediction.confidence}% CONFIDENCE
                </div>
              </div>
              
              <div className="space-y-4 mb-4">
                <div>
                  <h4 className="text-cyber-green-dim mb-2">ATTACK VECTOR</h4>
                  <p className="text-cyber-green">{selectedPrediction.attackMethod}</p>
                </div>
                
                <div>
                  <h4 className="text-cyber-green-dim mb-2">TARGET TYPE</h4>
                  <p className="text-cyber-green">{selectedPrediction.targetType}</p>
                </div>
                
                <div>
                  <h4 className="text-cyber-green-dim mb-2">ANALYSIS</h4>
                  <p className="text-cyber-green whitespace-pre-wrap">
                    {selectedPrediction.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-cyber-green-dim mb-2">PREDICTION TIMESTAMP</h4>
                  <p className="text-cyber-green">{new Date(selectedPrediction.timestamp).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Feature importance visualization */}
              {selectedPrediction.features && (
                <div className="mt-6">
                  <h4 className="text-cyber-green-dim mb-3">FEATURE IMPORTANCE</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedPrediction.features)
                      .filter(([key]) => !key.startsWith('_'))
                      .sort(([, valA], [, valB]) => Number(valB) - Number(valA))
                      .slice(0, 5)
                      .map(([feature, value]) => (
                        <div key={feature}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-cyber-green-dim">{formatFeatureName(feature)}</span>
                            <span>{Math.round(Number(value) * 100)}%</span>
                          </div>
                          <div className="w-full bg-cyber-dark h-2 rounded-full">
                            <div 
                              className="bg-cyber-blue h-2 rounded-full"
                              style={{ width: `${Math.round(Number(value) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {/* Countermeasures */}
              <div className="mt-6 border-t border-cyber-green-dim pt-4">
                <h4 className="text-cyber-yellow mb-3">RECOMMENDED COUNTERMEASURES</h4>
                <ul className="list-disc pl-5 space-y-2">
                  {generateCountermeasures(selectedPrediction).map((measure, index) => (
                    <li key={index} className="text-cyber-green">
                      {measure}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-cyber-green-dim">
              SELECT A PREDICTION TO VIEW DETAILS
            </div>
          )}
        </TerminalWindow>
      </div>
      
      {/* Prediction list */}
      <div className="lg:col-span-1">
        <TerminalWindow title="PREDICTION SELECTION">
          <div className="p-2">
            {predictions.map(prediction => (
              <button
                key={prediction.id}
                onClick={() => setSelectedPrediction(prediction)}
                className={`block w-full text-left p-3 mb-2 border ${
                  selectedPrediction?.id === prediction.id
                    ? 'border-cyber-green bg-cyber-green bg-opacity-20'
                    : 'border-cyber-green-dim hover:border-cyber-green hover:bg-cyber-green hover:bg-opacity-10'
                }`}
              >
                <div className="font-bold mb-1">
                  {prediction.aptGroup}
                </div>
                <div className="text-sm text-cyber-green-dim mb-1">
                  {prediction.attackMethod}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">
                    {prediction.targetType}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-cyber-dark">
                    {prediction.confidence}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </TerminalWindow>
      </div>
      
      {/* Attack Method and Target Distribution */}
      <div className="lg:col-span-3">
        <TerminalWindow title="PREDICTION DISTRIBUTION">
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attack Method Distribution */}
            <div>
              <h4 className="text-cyber-green-dim mb-4">ATTACK METHOD DISTRIBUTION</h4>
              <div className="space-y-3">
                {Object.entries(attackMethodGroups)
                  .sort(([, predsA], [, predsB]) => predsB.length - predsA.length)
                  .map(([method, methodPreds]) => {
                    const percentage = Math.round((methodPreds.length / predictions.length) * 100);
                    const avgMethodConfidence = Math.round(
                      methodPreds.reduce((sum, pred) => sum + pred.confidence, 0) / methodPreds.length
                    );
                    
                    return (
                      <div key={method}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-cyber-green">{method}</span>
                          <span>
                            {methodPreds.length} ({percentage}%) - {avgMethodConfidence}% conf
                          </span>
                        </div>
                        <div className="w-full bg-cyber-dark h-2 rounded-full">
                          <div 
                            className="bg-cyber-purple h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
            
            {/* Target Type Distribution */}
            <div>
              <h4 className="text-cyber-green-dim mb-4">TARGET TYPE DISTRIBUTION</h4>
              <div className="space-y-3">
                {Object.entries(targetGroups)
                  .sort(([, predsA], [, predsB]) => predsB.length - predsA.length)
                  .map(([target, targetPreds]) => {
                    const percentage = Math.round((targetPreds.length / predictions.length) * 100);
                    const avgTargetConfidence = Math.round(
                      targetPreds.reduce((sum, pred) => sum + pred.confidence, 0) / targetPreds.length
                    );
                    
                    return (
                      <div key={target}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-cyber-green">{target}</span>
                          <span>
                            {targetPreds.length} ({percentage}%) - {avgTargetConfidence}% conf
                          </span>
                        </div>
                        <div className="w-full bg-cyber-dark h-2 rounded-full">
                          <div 
                            className="bg-cyber-yellow h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </TerminalWindow>
      </div>
    </div>
  );
}

// Helper function to format feature names
function formatFeatureName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^./, str => str.toUpperCase());
}

// Generate countermeasures based on prediction
function generateCountermeasures(prediction: Prediction): string[] {
  const { attackMethod, targetType } = prediction;
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
  if (targetType.toLowerCase().includes('government')) {
    countermeasures.push('Enhance security clearance protocols for sensitive systems.');
  } else if (targetType.toLowerCase().includes('financial')) {
    countermeasures.push('Implement additional fraud detection and transaction monitoring.');
  } else if (targetType.toLowerCase().includes('healthcare')) {
    countermeasures.push('Ensure all patient data is encrypted both at rest and in transit.');
  } else if (targetType.toLowerCase().includes('energy')) {
    countermeasures.push('Isolate critical infrastructure control systems from external networks.');
  } else if (targetType.toLowerCase().includes('technology')) {
    countermeasures.push('Review code repositories for unauthorized access or modifications.');
  }
  
  // Add a generic countermeasure if we don't have enough specific ones
  if (countermeasures.length < 3) {
    countermeasures.push('Conduct a comprehensive security assessment focused on this threat profile.');
  }
  
  return countermeasures;
}