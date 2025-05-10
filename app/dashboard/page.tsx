'use client';

export const runtime = 'nodejs';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TerminalWindow from '../components/ui/TerminalWindow';
import HolographicInterface from '../components/ui/HolographicInterface';
import NeuralInterface from '../components/ui/NeuralInterface';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import ThreatFeed from './components/ThreatFeed';
import ThreatMap from './components/ThreatMap';
import PredictionPanel from './components/PredictionPanel';
import AptFilter from './components/AptFilter';
import { signOut } from '../../lib/auth';
import GlitchText from '../components/ui/GlitchText';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [threats, setThreats] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAptGroup, setSelectedAptGroup] = useState('all');
  const [error, setError] = useState('');
  const [neuralNetworkActive, setNeuralNetworkActive] = useState(false);
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [realtimeCounters, setRealtimeCounters] = useState({
    threats: 0,
    attempts: 0,
    blockedAttacks: 0,
  });

  // Create audio elements for UI sounds
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/interface-startup.mp3');
      audioRef.current.volume = 0.5;
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
        const [threatResponse, predictionResponse, modelStatusResponse] = await Promise.all([
          fetch('/api/threats'),
          fetch('/api/predictions'),
          fetch('/api/ml/status')
        ]);
        
        if (!threatResponse.ok || !predictionResponse.ok) {
          throw new Error('Failed to fetch data');
        }
        
        const threatData = await threatResponse.json();
        const predictionData = await predictionResponse.json();
        const modelStatusData = modelStatusResponse.ok ? await modelStatusResponse.json() : null;
        
        setThreats(threatData);
        setPredictions(predictionData);
        setModelStatus(modelStatusData);
        
        // Simulate increasing counters
        startCounters(threatData.length);
        
        // Activate neural network visualization after data loads
        setTimeout(() => {
          setNeuralNetworkActive(true);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('DATA RETRIEVAL FAILURE');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    
    // Set up periodic data refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Start the animated counters
  const startCounters = (threatCount: number) => {
    setRealtimeCounters({
      threats: threatCount,
      attempts: Math.floor(Math.random() * 1000) + 500,
      blockedAttacks: Math.floor(Math.random() * 300) + 100,
    });
    
    // Simulate real-time counter increments
    const counterInterval = setInterval(() => {
      setRealtimeCounters(prev => ({
        ...prev,
        attempts: prev.attempts + Math.floor(Math.random() * 3),
        blockedAttacks: prev.blockedAttacks + (Math.random() > 0.7 ? 1 : 0),
      }));
    }, 2000);
    
    return () => clearInterval(counterInterval);
  };

  // Filter threats based on selected APT group
  const filteredThreats = selectedAptGroup === 'all' 
    ? threats 
    : threats.filter((threat: any) => threat.aptGroup === selectedAptGroup);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cyber-black">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TerminalWindow title="SYSTEM STARTUP">
              <div className="p-8 space-y-4">
                <div className="typing text-cyber-green mb-6">
                  &gt; INITIALIZING ECHELON SYSTEM...<br />
                  &gt; ESTABLISHING SECURE CONNECTION...<br />
                  &gt; AUTHENTICATING CREDENTIALS...<br />
                  &gt; ACCESSING THREAT DATABASE...<br />
                  &gt; LOADING NEURAL NETWORK MODEL...<br />
                </div>
                <LoadingIndicator size="lg" text="INITIALIZING THREAT DASHBOARD" />
              </div>
            </TerminalWindow>
          </motion.div>
        </div>
      </div>
    );
  }

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
            <GlitchText intensity="medium">ECHELON DASHBOARD</GlitchText>
          </h1>
          <p className="text-cyber-green-dim">
            LIVE THREAT INTELLIGENCE & PREDICTION
          </p>
        </div>
        
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link href="/intel" className="cyber-button bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-black">
            INTEL ANALYSIS
          </Link>
          <Link href="/train" className="cyber-button bg-transparent text-cyber-blue border border-cyber-blue hover:bg-cyber-blue hover:text-cyber-black">
            TRAIN MODEL
          </Link>
          <button 
            onClick={handleLogout} 
            className="cyber-button bg-transparent text-cyber-red border border-cyber-red hover:bg-cyber-red hover:text-cyber-black"
          >
            LOGOUT
          </button>
        </div>
      </motion.header>
      
      {error && (
        <div className="mb-6 p-4 bg-cyber-red bg-opacity-10 border border-cyber-red text-cyber-red">
          {error}
        </div>
      )}
      
      {/* Live Activity Counters */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-cyber-dark border border-cyber-green p-3 flex flex-col">
          <span className="text-cyber-green-dim text-xs mb-1">ACTIVE THREATS</span>
          <span className="text-cyber-green text-2xl font-bold">{realtimeCounters.threats}</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-green p-3 flex flex-col">
          <span className="text-cyber-green-dim text-xs mb-1">INTRUSION ATTEMPTS</span>
          <span className="text-cyber-green text-2xl font-bold">{realtimeCounters.attempts}</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-green p-3 flex flex-col">
          <span className="text-cyber-green-dim text-xs mb-1">ATTACKS BLOCKED</span>
          <span className="text-cyber-green text-2xl font-bold">{realtimeCounters.blockedAttacks}</span>
        </div>
        <div className="bg-cyber-dark border border-cyber-green p-3 flex flex-col">
          <span className="text-cyber-green-dim text-xs mb-1">ML MODEL STATUS</span>
          <span className="text-cyber-green text-2xl font-bold flex items-center">
            <span className={`w-3 h-3 rounded-full mr-2 ${modelStatus?.modelExists ? 'bg-cyber-green animate-pulse' : 'bg-cyber-red'}`}></span>
            {modelStatus?.modelExists ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
      </motion.div>
      
      {/* Main dashboard grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Neural Network Visualization - Takes 2/3 of width on large screens */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <HolographicInterface 
            title="NEURAL NETWORK VISUALIZATION" 
            securityLevel="beta"
            glitchIntensity="low"
            className="h-[400px]"
          >
            <div className="h-full w-full relative">
              <NeuralInterface 
                active={neuralNetworkActive}
                complexity="high"
                color="#00ff41"
                pulseRate={1.2}
                showDataStreams={true}
              />
              
              {/* Overlay for threat information */}
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <ThreatMap threats={filteredThreats} />
              </div>
            </div>
          </HolographicInterface>
        </motion.div>
        
        {/* Prediction Panel - Takes 1/3 of width */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <HolographicInterface 
            title="ML PREDICTION ENGINE" 
            securityLevel="gamma"
            className="h-full mb-6"
          >
            <PredictionPanel predictions={predictions} />
          </HolographicInterface>
          
          {/* APT Group Filter */}
          <HolographicInterface 
            title="APT GROUP FILTER" 
            securityLevel="beta"
            glitchIntensity="low"
          >
            <AptFilter 
              selected={selectedAptGroup} 
              onChange={setSelectedAptGroup} 
            />
          </HolographicInterface>
        </motion.div>
        
        {/* Threat Feed - Full width */}
        <motion.div 
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <HolographicInterface 
            title="LIVE THREAT INTELLIGENCE" 
            securityLevel="alpha"
            glitchIntensity="medium"
            className="h-full"
          >
            <ThreatFeed threats={filteredThreats} />
          </HolographicInterface>
        </motion.div>
      </div>
      
      {/* Model status panel */}
      {modelStatus && (
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <HolographicInterface 
            title="ML MODEL STATUS" 
            securityLevel="omega"
            glitchIntensity="low"
            className="h-full"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-cyber-dark bg-opacity-50 p-3">
                <div className="text-cyber-purple-dim text-xs mb-1">MODEL STATUS</div>
                <div className="text-cyber-purple text-lg">{modelStatus.modelExists ? 'OPERATIONAL' : 'NOT FOUND'}</div>
              </div>
              <div className="bg-cyber-dark bg-opacity-50 p-3">
                <div className="text-cyber-purple-dim text-xs mb-1">MODEL SIZE</div>
                <div className="text-cyber-purple text-lg">{modelStatus.modelSize || 'N/A'}</div>
              </div>
              <div className="bg-cyber-dark bg-opacity-50 p-3">
                <div className="text-cyber-purple-dim text-xs mb-1">LAST TRAINED</div>
                <div className="text-cyber-purple text-lg">
                  {modelStatus.lastTrained 
                    ? new Date(modelStatus.lastTrained).toLocaleString() 
                    : 'NEVER'}
                </div>
              </div>
              <div className="bg-cyber-dark bg-opacity-50 p-3">
                <div className="text-cyber-purple-dim text-xs mb-1">PREDICTIONS MADE</div>
                <div className="text-cyber-purple text-lg">{modelStatus.predictionCount || 0}</div>
              </div>
            </div>
          </HolographicInterface>
        </motion.div>
      )}
      
      {/* Footer */}
      <motion.footer 
        className="mt-8 text-center text-cyber-green-dim text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <p className="flex items-center justify-center">
          <span className="mr-2">ECHELON SYSTEM v3.7.2</span>
          <span className="mx-2 w-2 h-2 rounded-full bg-cyber-green"></span>
          <span className="mx-2">CLASSIFIED</span>
          <span className="mx-2 w-2 h-2 rounded-full bg-cyber-green"></span>
          <span className="ml-2">TOP SECRET</span>
        </p>
        <p className="mt-1">QUANTUM-SECURED CONNECTION ACTIVE // {new Date().toISOString()}</p>
      </motion.footer>
    </div>
  );
}