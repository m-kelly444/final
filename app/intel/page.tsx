'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HolographicInterface from '../components/ui/HolographicInterface';
import NeuralInterface from '../components/ui/NeuralInterface';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import GlitchText from '../components/ui/GlitchText';
import ThreatAnalysis from './components/ThreatAnalysis';
import PredictionDetails from './components/PredictionDetails';
import { motion } from 'framer-motion';

export default function IntelPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const aptGroup = searchParams.get('apt') || 'all';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [threats, setThreats] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analysis');
  const [error, setError] = useState('');
  const [isHologramRotating, setIsHologramRotating] = useState(false);
  const [aptGroupData, setAptGroupData] = useState<any>(null);

  // Create audio elements for UI sounds
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/hologram-activate.mp3');
      audioRef.current.volume = 0.3;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        // Play UI sound
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Audio playback prevented by browser'));
        }
        
        // Fetch real threat data and predictions
        const [threatResponse, predictionResponse] = await Promise.all([
          fetch('/api/threats'),
          fetch('/api/predictions')
        ]);
        
        if (!threatResponse.ok || !predictionResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const threatData = await threatResponse.json();
        const predictionData = await predictionResponse.json();
        
        setThreats(threatData);
        setPredictions(predictionData);
        
        // Generate APT group data for 3D visualization if specific group selected
        if (aptGroup !== 'all') {
          // Play hologram sound
          setTimeout(() => {
            setIsHologramRotating(true);
            // Get APT group details for visualization
            const selectedGroup = threatData.find((t: any) => t.aptGroup === aptGroup);
            if (selectedGroup) {
              setAptGroupData({
                name: selectedGroup.aptGroup,
                attackMethods: getUniqueAttackMethods(threatData, aptGroup),
                targets: getUniqueTargets(threatData, aptGroup),
                threatCount: threatData.filter((t: any) => t.aptGroup === aptGroup).length,
                recentActivity: threatData
                  .filter((t: any) => t.aptGroup === aptGroup)
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
              });
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('DATA RETRIEVAL FAILURE');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [aptGroup]);

  // Helper function to get unique attack methods for an APT group
  const getUniqueAttackMethods = (threats: any[], group: string) => {
    return Array.from(new Set(
      threats
        .filter(t => t.aptGroup === group)
        .map(t => t.attackMethod)
    ));
  };

  // Helper function to get unique targets for an APT group
  const getUniqueTargets = (threats: any[], group: string) => {
    return Array.from(new Set(
      threats
        .filter(t => t.aptGroup === group)
        .map(t => t.target)
    ));
  };

  // Filter threats based on selected APT group
  const filteredThreats = aptGroup === 'all' 
    ? threats 
    : threats.filter((threat: any) => threat.aptGroup === aptGroup);
  
  // Filter predictions based on selected APT group
  const filteredPredictions = aptGroup === 'all'
    ? predictions
    : predictions.filter((pred: any) => pred.aptGroup === aptGroup);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-black">
        <div className="w-full max-w-lg">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HolographicInterface title="INTELLIGENCE ANALYSIS SYSTEM" securityLevel="gamma">
              <div className="p-8 space-y-4">
                <div className="typing text-cyber-green mb-6">
                  &gt; INITIALIZING THREAT INTELLIGENCE DATABASE...<br />
                  &gt; ESTABLISHING SECURE CONNECTION...<br />
                  &gt; DECRYPTING APT GROUP PROFILES...<br />
                  &gt; ACCESSING CLASSIFIED INTELLIGENCE...<br />
                </div>
                <LoadingIndicator size="lg" text="LOADING INTELLIGENCE DATA" />
              </div>
            </HolographicInterface>
          </motion.div>
        </div>
      </div>
    );
  }
  
  // Check if we have data for the selected APT group
  const hasData = filteredThreats.length > 0 || filteredPredictions.length > 0;

  return (
    <div className="min-h-screen p-4 lg:p-6 bg-cyber-black">
      {/* Header */}
      <motion.header 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-cyber-green neon-glow mb-2">
            <GlitchText>INTEL ANALYSIS</GlitchText>
          </h1>
          <p className="text-cyber-green-dim">
            {aptGroup === 'all' 
              ? 'COMPREHENSIVE THREAT INTELLIGENCE' 
              : `${aptGroup} THREAT PROFILE`}
          </p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link 
            href="/dashboard" 
            className="cyber-button bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-black"
          >
            RETURN TO DASHBOARD
          </Link>
        </div>
      </motion.header>
      
      {error && (
        <div className="mb-6 p-4 bg-cyber-red bg-opacity-10 border border-cyber-red text-cyber-red">
          {error}
        </div>
      )}
      
      {!hasData && !error && (
        <div className="mb-6 p-4 bg-cyber-yellow bg-opacity-10 border border-cyber-yellow text-cyber-yellow">
          NO DATA AVAILABLE FOR {aptGroup === 'all' ? 'ANY APT GROUP' : aptGroup}
        </div>
      )}
      
      {/* 3D APT Group Visualization - Show if specific APT group selected */}
      {aptGroup !== 'all' && aptGroupData && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <HolographicInterface 
            title={`${aptGroup} HOLOGRAM PROJECTION`} 
            securityLevel="omega"
            glitchIntensity="medium"
            className="h-[300px]"
          >
            <div className="h-full w-full relative flex">
              <div className="w-1/3 h-full">
                <NeuralInterface 
                  active={isHologramRotating}
                  complexity="high"
                  color="#9933ff"
                  pulseRate={1.8}
                  showDataStreams={true}
                />
              </div>
              
              <div className="w-2/3 p-6 space-y-4">
                <h3 className="text-2xl text-cyber-purple font-bold">
                  {aptGroupData.name} <span className="text-sm text-cyber-purple-dim">THREAT ACTOR</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-cyber-purple-dim text-sm mb-1">ATTACK VECTORS</h4>
                    <ul className="list-disc pl-5 text-cyber-purple space-y-1">
                      {aptGroupData.attackMethods.map((method: string, idx: number) => (
                        <li key={idx}>{method}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-cyber-purple-dim text-sm mb-1">PRIMARY TARGETS</h4>
                    <ul className="list-disc pl-5 text-cyber-purple space-y-1">
                      {aptGroupData.targets.map((target: string, idx: number) => (
                        <li key={idx}>{target}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-cyber-purple-dim text-sm mb-1">THREAT COUNT</h4>
                    <p className="text-cyber-purple text-xl">{aptGroupData.threatCount}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-cyber-purple-dim text-sm mb-1">LATEST ACTIVITY</h4>
                    <p className="text-cyber-purple">
                      {aptGroupData.recentActivity?.timestamp ? 
                        new Date(aptGroupData.recentActivity.timestamp).toLocaleDateString() : 
                        'Unknown'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </HolographicInterface>
        </motion.div>
      )}
      
      {/* APT Group selector */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <HolographicInterface title="SELECT APT GROUP" securityLevel="beta">
          <div className="p-4 flex flex-wrap gap-2">
            <Link 
              href="/intel?apt=all"
              className={`px-3 py-1 border ${
                aptGroup === 'all' 
                  ? 'border-cyber-green bg-cyber-green text-cyber-black' 
                  : 'border-cyber-green-dim text-cyber-green hover:bg-cyber-green hover:bg-opacity-20'
              }`}
            >
              ALL GROUPS
            </Link>
            
            {/* Generate unique list of APT groups from both threats and predictions */}
            {Array.from(new Set([
              ...threats.map((t: any) => t.aptGroup),
              ...predictions.map((p: any) => p.aptGroup)
            ])).map((group: string) => (
              <Link 
                key={group}
                href={`/intel?apt=${encodeURIComponent(group)}`}
                className={`px-3 py-1 border ${
                  aptGroup === group 
                    ? 'border-cyber-green bg-cyber-green text-cyber-black' 
                    : 'border-cyber-green-dim text-cyber-green hover:bg-cyber-green hover:bg-opacity-20'
                }`}
              >
                {group}
              </Link>
            ))}
          </div>
        </HolographicInterface>
      </motion.div>
      
      {/* Tab navigation */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex border-b border-cyber-green">
          <button 
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 ${
              activeTab === 'analysis' 
                ? 'bg-cyber-green bg-opacity-20 border-t border-l border-r border-cyber-green' 
                : 'text-cyber-green-dim hover:text-cyber-green'
            }`}
          >
            THREAT ANALYSIS
          </button>
          <button 
            onClick={() => setActiveTab('predictions')}
            className={`px-4 py-2 ${
              activeTab === 'predictions' 
                ? 'bg-cyber-green bg-opacity-20 border-t border-l border-r border-cyber-green' 
                : 'text-cyber-green-dim hover:text-cyber-green'
            }`}
          >
            ML PREDICTIONS
          </button>
        </div>
      </motion.div>
      
      {/* Tab content */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        {activeTab === 'analysis' ? (
          <ThreatAnalysis threats={filteredThreats} aptGroup={aptGroup} />
        ) : (
          <PredictionDetails predictions={filteredPredictions} aptGroup={aptGroup} />
        )}
      </motion.div>
      
      {/* Audio controls (hidden but functional) */}
      <audio id="ui-sound" preload="auto" className="hidden" />
      
      {/* Footer */}
      <motion.footer 
        className="mt-8 text-center text-cyber-green-dim text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <div className="flex items-center justify-center">
          <div className="h-px w-16 bg-cyber-green opacity-50"></div>
          <p className="mx-4">ECHELON SYSTEM v3.7.2 // CLASSIFIED // TOP SECRET</p>
          <div className="h-px w-16 bg-cyber-green opacity-50"></div>
        </div>
        <p className="mt-2 flex items-center justify-center">
          <span className="inline-block w-2 h-2 bg-cyber-green animate-pulse rounded-full mr-2"></span>
          <span>QUANTUM-SECURED CONNECTION ACTIVE</span>
          <span className="mx-2">|</span>
          <span>{new Date().toISOString()}</span>
        </p>
      </motion.footer>
    </div>
  );
}