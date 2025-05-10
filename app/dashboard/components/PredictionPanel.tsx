import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Prediction {
  id: number;
  aptGroup: string;
  attackMethod: string;
  targetType: string;
  confidence: number;
  timestamp: string;
  description: string;
}

interface PredictionPanelProps {
  predictions: Prediction[];
}

export default function PredictionPanel({ predictions }: PredictionPanelProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (!predictions || predictions.length === 0) {
    return (
      <div className="p-4 text-center text-cyber-green-dim">
        NO PREDICTION DATA AVAILABLE
      </div>
    );
  }

  // Get the selected prediction
  const prediction = predictions[selectedIndex];
  
  // Function to view detailed intel
  const viewIntel = () => {
    router.push(`/intel?apt=${prediction.aptGroup}`);
  };
  
  // Function to get confidence level text and color
  const getConfidenceInfo = (confidence: number) => {
    let text = 'LOW';
    let colorClass = 'text-cyber-green';
    
    if (confidence > 85) {
      text = 'CRITICAL';
      colorClass = 'text-cyber-red';
    } else if (confidence > 70) {
      text = 'HIGH';
      colorClass = 'text-cyber-yellow';
    } else if (confidence > 50) {
      text = 'MEDIUM';
      colorClass = 'text-cyber-blue';
    }
    
    return { text, colorClass };
  };
  
  const confidenceInfo = getConfidenceInfo(prediction.confidence);

  return (
    <div className="p-4">
      {/* Prediction selector */}
      <div className="flex mb-4 overflow-x-auto">
        {predictions.map((p, index) => (
          <button
            key={p.id}
            onClick={() => setSelectedIndex(index)}
            className={`mr-2 px-3 py-1 text-sm border ${
              index === selectedIndex 
                ? 'border-cyber-green bg-cyber-green bg-opacity-20' 
                : 'border-cyber-green-dim'
            }`}
          >
            {p.aptGroup}
          </button>
        ))}
      </div>
    
      {/* Selected prediction details */}
      <div className="border border-cyber-green-dim p-4 bg-cyber-dark bg-opacity-30">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl text-cyber-green font-bold">
            {prediction.aptGroup}
          </h3>
          <div className={`px-2 py-1 text-xs ${confidenceInfo.colorClass} border border-current`}>
            {confidenceInfo.text} THREAT ({prediction.confidence}%)
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <p><span className="text-cyber-green-dim">ATTACK VECTOR:</span> {prediction.attackMethod}</p>
          <p><span className="text-cyber-green-dim">TARGET TYPE:</span> {prediction.targetType}</p>
          <p><span className="text-cyber-green-dim">PREDICTION TIMESTAMP:</span> {new Date(prediction.timestamp).toLocaleString()}</p>
        </div>
        
        <div className="mb-4">
          <h4 className="text-cyber-green-dim mb-2">ANALYSIS:</h4>
          <p className="text-cyber-green whitespace-pre-wrap">
            {prediction.description}
          </p>
        </div>
        
        {/* Confidence meter */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-cyber-green-dim mb-1">
            <span>CONFIDENCE LEVEL</span>
            <span>{prediction.confidence}%</span>
          </div>
          <div className="w-full bg-cyber-dark h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                prediction.confidence > 75 
                  ? 'bg-cyber-red' 
                  : prediction.confidence > 50 
                    ? 'bg-cyber-yellow' 
                    : 'bg-cyber-green'
              }`}
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>
        
        <button
          onClick={viewIntel}
          className="w-full cyber-button bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-black transition"
        >
          VIEW DETAILED INTEL
        </button>
      </div>
    </div>
  );
}