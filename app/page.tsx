import Link from 'next/link';
import GlitchText from './components/ui/GlitchText';
import CyberButton from './components/ui/CyberButton';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      {/* Header with glitch effect */}
      <h1 className="text-6xl md:text-8xl font-bold mb-6 text-cyber-green neon-glow">
        <GlitchText>ECHELON</GlitchText>
      </h1>
      
      <p className="text-xl md:text-2xl mb-12 max-w-3xl text-cyber-green-dim">
        Next-generation threat intelligence system with real-time monitoring and
        predictive analysis of APT activities across the global threatscape.
      </p>
      
      {/* Terminal window with animation */}
      <div className="terminal-window max-w-3xl w-full mb-12">
        <div className="terminal-header">
          <div className="terminal-dots">
            <div className="terminal-dot bg-cyber-red"></div>
            <div className="terminal-dot bg-cyber-yellow"></div>
            <div className="terminal-dot bg-cyber-green"></div>
          </div>
          <div className="terminal-title">SYSTEM STATUS</div>
        </div>
        
        <div className="space-y-1 py-4 typing terminal-text">
          <p>&gt; INITIATING ECHELON SYSTEM...</p>
          <p>&gt; CONNECTING TO THREAT INTELLIGENCE DATABASE...</p>
          <p>&gt; ACCESSING ML PREDICTION ENGINE...</p>
          <p>&gt; AUTHORIZED ACCESS GRANTED...</p>
          <p>&gt; WELCOME TO ECHELON v3.7.2</p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
        <Link href="/login">
          <CyberButton variant="filled" size="lg">
            ACCESS SYSTEM
          </CyberButton>
        </Link>
        <Link href="/dashboard">
          <CyberButton variant="outlined" size="lg">
            DEMO MODE
          </CyberButton>
        </Link>
      </div>
      
      {/* Footer info */}
      <div className="absolute bottom-6 text-cyber-green-dim text-sm">
        <p>CLASSIFIED // TOP SECRET // SPECIAL ACCESS REQUIRED</p>
      </div>
    </div>
  );
}