'use client';

import { useEffect, useState } from 'react';
import LoadingIndicator from '../../components/ui/LoadingIndicator';

interface Threat {
  id: string;
  aptGroup: string;
  attackMethod: string;
  target: string;
  location: string;
  confidence: number;
  timestamp: string;
}

interface ThreatMapProps {
  threats: Threat[];
}

// Map country or region names to coordinates
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'Global': [0, 0],
  'North America': [40, -100],
  'United States': [37, -95],
  'Canada': [56, -106],
  'South America': [-20, -60],
  'Europe': [50, 10],
  'Eastern Europe': [50, 30],
  'Western Europe': [48, 7],
  'Asia': [30, 100],
  'East Asia': [35, 115],
  'Southeast Asia': [10, 106],
  'Middle East': [30, 45],
  'Africa': [0, 20],
  'Australia': [-25, 135],
  'Russia': [62, 94],
  'China': [35, 105],
  'Iran': [32, 53],
  'North Korea': [40, 127],
  'South Korea': [37, 128],
  'Japan': [36, 138],
  'United Kingdom': [55, -3],
  'Germany': [51, 10],
  'France': [46, 2],
  'India': [20, 77],
  'Brazil': [-10, -55],
};

// Map colors based on APT groups
const APT_COLORS: Record<string, string> = {
  'APT28': '#ff0055', // cyber-red
  'APT29': '#9933ff', // cyber-purple
  'Lazarus Group': '#ffcc00', // cyber-yellow
  'Sandworm': '#00b3ff', // cyber-blue
  'APT41': '#00ff41', // cyber-green
  'Kimsuky': '#ff6e27', // orange
  'APT33': '#ff00ff', // magenta
  'default': '#00ff41', // default - cyber-green
};

export default function ThreatMap({ threats }: ThreatMapProps) {
  const [loading, setLoading] = useState(true);
  const [worldMap, setWorldMap] = useState<string>('');
  
  // Load the SVG world map
  useEffect(() => {
    fetch('/maps/world-map-simple.svg')
      .then(response => response.text())
      .then(mapData => {
        setWorldMap(mapData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading map:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <LoadingIndicator text="LOADING THREAT MAP" />
      </div>
    );
  }

  // Create threat markers
  const createMarkers = () => {
    return threats.map(threat => {
      // Get coordinates based on location
      let coordinates = LOCATION_COORDINATES['Global']; // Default
      
      const location = threat.location;
      // Try to match the location with our coordinate list
      for (const [key, coords] of Object.entries(LOCATION_COORDINATES)) {
        if (location.includes(key)) {
          coordinates = coords;
          break;
        }
      }
      
      // Get color based on APT group
      const color = APT_COLORS[threat.aptGroup] || APT_COLORS['default'];
      
      // Calculate size based on confidence
      const size = 4 + (threat.confidence / 20);
      
      // Convert geo coordinates to SVG coordinates (very simplified)
      // This assumes the SVG has a simple equirectangular projection
      const svgX = ((coordinates[1] + 180) / 360) * 100;
      const svgY = ((90 - coordinates[0]) / 180) * 100;
      
      return (
        <div 
          key={threat.id}
          className="absolute animate-pulse"
          style={{
            left: `${svgX}%`,
            top: `${svgY}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: `0 0 10px ${color}`,
          }}
          title={`${threat.aptGroup}: ${threat.attackMethod} - ${threat.location}`}
        />
      );
    });
  };

  return (
    <div className="relative h-full min-h-[400px] bg-cyber-black p-4">
      {/* Map legend */}
      <div className="absolute top-2 right-2 z-10 bg-cyber-black bg-opacity-70 p-2 border border-cyber-green text-xs">
        <h4 className="text-cyber-green-dim mb-1">APT GROUPS:</h4>
        <div className="space-y-1">
          {Object.entries(APT_COLORS).filter(([key]) => key !== 'default').map(([group, color]) => (
            <div key={group} className="flex items-center">
              <div
                className="w-3 h-3 mr-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>{group}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* World map */}
      <div 
        className="relative w-full h-full"
        dangerouslySetInnerHTML={{ 
          __html: worldMap.replace('<svg', '<svg class="w-full h-full" fill="none" stroke="#00ff4133" stroke-width="0.5"') 
        }}
      />
      
      {/* Threat markers */}
      {createMarkers()}
      
      {/* Scanline effect */}
      <div className="scan-line absolute inset-0 pointer-events-none" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid-size pointer-events-none" />
    </div>
  );
}