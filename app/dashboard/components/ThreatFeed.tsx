import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

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

interface ThreatFeedProps {
  threats: Threat[];
}

export default function ThreatFeed({ threats }: ThreatFeedProps) {
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  
  if (!threats.length) {
    return (
      <div className="p-4 text-center text-cyber-green-dim">
        NO THREAT DATA AVAILABLE
      </div>
    );
  }

  return (
    <div className="relative">
      {selectedThreat && (
        <div className="absolute inset-0 bg-cyber-black bg-opacity-95 z-10 p-6 border border-cyber-green overflow-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl text-cyber-green font-bold">
              {selectedThreat.aptGroup}: {selectedThreat.attackMethod}
            </h3>
            <button 
              onClick={() => setSelectedThreat(null)}
              className="text-cyber-green hover:text-cyber-red"
            >
              [CLOSE]
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p><span className="text-cyber-green-dim">Target:</span> {selectedThreat.target}</p>
              <p><span className="text-cyber-green-dim">Location:</span> {selectedThreat.location}</p>
              <p><span className="text-cyber-green-dim">Confidence:</span> {selectedThreat.confidence}%</p>
              <p><span className="text-cyber-green-dim">Timestamp:</span> {formatDistanceToNow(new Date(selectedThreat.timestamp), { addSuffix: true })}</p>
            </div>
            <div>
              <p><span className="text-cyber-green-dim">Source:</span> {selectedThreat.source}</p>
              {selectedThreat.ioc && (
                <p><span className="text-cyber-green-dim">IOC:</span> {selectedThreat.ioc}</p>
              )}
              {selectedThreat.sourceUrl && (
                <p>
                  <span className="text-cyber-green-dim">Source URL:</span>{' '}
                  <a 
                    href={selectedThreat.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyber-blue hover:underline"
                  >
                    {selectedThreat.sourceUrl.substring(0, 40)}...
                  </a>
                </p>
              )}
              <p>
                <span className="text-cyber-green-dim">Verified:</span>{' '}
                {selectedThreat.verified ? (
                  <span className="text-cyber-green">YES</span>
                ) : (
                  <span className="text-cyber-red">NO</span>
                )}
              </p>
            </div>
          </div>
          
          {selectedThreat.details && selectedThreat.details.description && (
            <div className="mt-4">
              <h4 className="text-cyber-green-dim mb-2">DESCRIPTION:</h4>
              <p className="text-cyber-green whitespace-pre-wrap">
                {selectedThreat.details.description}
              </p>
              
              {selectedThreat.details.references && selectedThreat.details.references.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-cyber-green-dim mb-2">REFERENCES:</h4>
                  <ul className="list-disc pl-6">
                    {selectedThreat.details.references.map((ref: string, index: number) => (
                      <li key={index}>
                        <a 
                          href={ref} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-cyber-blue hover:underline"
                        >
                          {ref.substring(0, 50)}...
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-cyber-green-dim border-b border-cyber-green">
              <th className="p-3 text-left">APT GROUP</th>
              <th className="p-3 text-left">ATTACK METHOD</th>
              <th className="p-3 text-left">TARGET</th>
              <th className="p-3 text-left">LOCATION</th>
              <th className="p-3 text-left">CONFIDENCE</th>
              <th className="p-3 text-left">TIMESTAMP</th>
              <th className="p-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {threats.map((threat) => (
              <tr 
                key={threat.id} 
                className="border-b border-cyber-green border-opacity-20 hover:bg-cyber-green hover:bg-opacity-10 transition-colors"
              >
                <td className="p-3 font-bold text-cyber-green">{threat.aptGroup}</td>
                <td className="p-3">{threat.attackMethod}</td>
                <td className="p-3">{threat.target}</td>
                <td className="p-3">{threat.location}</td>
                <td className="p-3">
                  <div className="w-full bg-cyber-dark rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        threat.confidence > 75 
                          ? 'bg-cyber-red' 
                          : threat.confidence > 50 
                            ? 'bg-cyber-yellow' 
                            : 'bg-cyber-green'
                      }`}
                      style={{ width: `${threat.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs text-cyber-green-dim">{threat.confidence}%</span>
                </td>
                <td className="p-3 text-cyber-green-dim whitespace-nowrap">
                  {formatDistanceToNow(new Date(threat.timestamp), { addSuffix: true })}
                </td>
                <td className="p-3">
                  <button
                    onClick={() => setSelectedThreat(threat)}
                    className="text-cyber-blue hover:text-cyber-green transition"
                  >
                    [DETAILS]
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}