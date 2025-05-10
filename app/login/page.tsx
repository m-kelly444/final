'use client';

export const runtime = 'nodejs';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HolographicInterface from '../components/ui/HolographicInterface';
import CyberButton from '../components/ui/CyberButton';
import GlitchText from '../components/ui/GlitchText';
import BiometricScan from '../components/ui/BiometricScan';
import { signIn } from '../../lib/auth';
import { motion } from 'framer-motion';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authStage, setAuthStage] = useState<'credentials' | 'biometric' | 'complete'>('credentials');
  const [credentialsValid, setCredentialsValid] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);
  const [connectionLag, setConnectionLag] = useState(0);

  // Create audio elements for UI sounds
  useEffect(() => {
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/cyberui.mp3');
      audioRef.current.volume = 0.3;
    }
    
    // Simulate network connection lag
    setConnectionLag(Math.floor(Math.random() * 150) + 50);
    
    // Simulated security alerts
    const alertInterval = setInterval(() => {
      if (securityAlerts.length < 3 && Math.random() > 0.7) {
        const newAlerts = [
          "PERIMETER DEFENSE ACTIVATED",
          "QUANTUM ENCRYPTION ENABLED",
          "NEURAL FIREWALL ONLINE",
          "IP ORIGIN: SCRAMBLED",
          "ANTI-TRACKING PROTOCOL ACTIVE",
          "BIOMETRIC VERIFICATION READY"
        ];
        const randomAlert = newAlerts[Math.floor(Math.random() * newAlerts.length)];
        setSecurityAlerts(prev => [...prev, randomAlert]);
      }
    }, 2000);
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      clearInterval(alertInterval);
    };
  }, [securityAlerts.length]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Play UI sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.log('Audio playback prevented by browser'));
    }
    
    setLoading(true);
    setError('');
    setLoginAttempts(prev => prev + 1);

    try {
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, connectionLag));
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Add glitch effect on error
        setError(`AUTHENTICATION FAILED: INVALID CREDENTIALS [CODE:${Math.floor(Math.random() * 1000) + 1000}]`);
        setLoading(false);
        
        // Add security alert on multiple failed attempts
        if (loginAttempts >= 2) {
          setSecurityAlerts(prev => [...prev, "INTRUSION ATTEMPT DETECTED"]);
        }
        
        return;
      }

      // Show success message and proceed to biometric scan
      setCredentialsValid(true);
      setLoading(false);
      setAuthStage('biometric');
      
      // Add security alert for successful credential verification
      setSecurityAlerts(prev => [...prev, "CREDENTIALS VERIFIED"]);
      
    } catch (error) {
      setError('SYSTEM ERROR: AUTHENTICATION PROCESS FAILURE');
      setLoading(false);
    }
  };
  
  const handleBiometricComplete = () => {
    setAuthStage('complete');
    
    // Add security alert for successful biometric verification
    setSecurityAlerts(prev => [...prev, "BIOMETRIC MATCH CONFIRMED"]);
    
    // Navigate to dashboard after a short delay
    setTimeout(() => {
      router.push(callbackUrl);
    }, 1000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-cyber-black p-4">
      {/* Background grid effect */}
      <div className="absolute inset-0 cyber-grid opacity-30"></div>
      <div className="absolute inset-0 scan-line"></div>
      
      {/* Security alerts panel */}
      <motion.div 
        className="fixed top-6 right-6 w-64 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <HolographicInterface title="SECURITY STATUS" securityLevel="beta" glitchIntensity="low">
          <div className="p-3 space-y-2">
            {securityAlerts.length > 0 ? (
              securityAlerts.map((alert, index) => (
                <motion.div 
                  key={`alert-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-xs text-cyber-green"
                >
                  <span className="inline-block w-2 h-2 bg-cyber-green mr-2"></span>
                  {alert}
                </motion.div>
              ))
            ) : (
              <div className="text-xs text-cyber-green-dim">NO ACTIVE ALERTS</div>
            )}
            
            <div className="text-xs text-cyber-green-dim flex justify-between mt-2 pt-2 border-t border-cyber-green border-opacity-30">
              <span>CONNECTION:</span>
              <span>{connectionLag}ms</span>
            </div>
          </div>
        </HolographicInterface>
      </motion.div>
      
      <Link href="/" className="absolute top-6 left-6 text-cyber-green hover:text-cyber-blue transition z-10">
        &lt; RETURN
      </Link>
      
      <motion.div 
        className="mb-8 text-center z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <GlitchText intensity="medium">ECHELON ACCESS</GlitchText>
        </h1>
        <p className="text-cyber-green-dim">
          QUANTUM-SECURED AUTHENTICATION PROTOCOL
        </p>
      </motion.div>
      
      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {authStage === 'credentials' && (
          <HolographicInterface title="IDENTITY VERIFICATION" securityLevel="alpha">
            <form onSubmit={handleCredentialsSubmit} className="space-y-6 p-4">
              <div>
                <label htmlFor="email" className="block text-cyber-green mb-2 uppercase tracking-wider text-sm">
                  OPERATOR ID
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-green p-3 text-cyber-green font-terminal"
                  placeholder="agent.id@echelon.gov"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-cyber-green mb-2 uppercase tracking-wider text-sm">
                  ACCESS CODE
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cyber-dark border border-cyber-green p-3 text-cyber-green font-terminal"
                  placeholder="******************"
                  required
                />
              </div>

              {error && (
                <motion.div 
                  className="p-3 bg-cyber-red bg-opacity-10 border border-cyber-red text-cyber-red"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}

              <CyberButton type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">VERIFYING</span>
                    <span className="blink">...</span>
                  </span>
                ) : (
                  'VERIFY CREDENTIALS'
                )}
              </CyberButton>
              
              <div className="text-cyber-green-dim text-center text-xs">
                <p>AUTHORIZED PERSONNEL ONLY</p>
                <p>ALL ACCESS ATTEMPTS ARE LOGGED AND MONITORED</p>
                
                {/* For demo purposes */}
                <p className="mt-4 text-cyber-green">DEMO CREDENTIALS: demo@echelon.gov / demo123</p>
              </div>
            </form>
          </HolographicInterface>
        )}
        
        {authStage === 'biometric' && (
          <HolographicInterface title="BIOMETRIC VERIFICATION" securityLevel="alpha">
            <div className="p-4 space-y-4">
              <p className="text-cyber-green">
                CREDENTIALS ACCEPTED. SECONDARY AUTHENTICATION REQUIRED.
              </p>
              
              <BiometricScan 
                onComplete={handleBiometricComplete}
                type="retina"
                duration={3000}
              />
              
              <div className="text-cyber-green-dim text-center text-xs mt-4">
                <p>RETINAL SCAN IN PROGRESS</p>
                <p>PLEASE MAINTAIN VISUAL CONTACT</p>
              </div>
            </div>
          </HolographicInterface>
        )}
        
        {authStage === 'complete' && (
          <HolographicInterface title="ACCESS GRANTED" securityLevel="beta">
            <div className="p-4 space-y-4 text-center">
              <div className="text-cyber-green text-xl">
                <GlitchText intensity="low">AUTHENTICATION COMPLETE</GlitchText>
              </div>
              
              <div className="typing text-cyber-green mb-4">
                &gt; INITIALIZING SECURE SESSION...
                <br />
                &gt; ESTABLISHING ENCRYPTED CHANNEL...
                <br />
                &gt; ACCESSING ECHELON MAINFRAME...
              </div>
              
              <div className="flex justify-center">
                <div className="cyber-spinner"></div>
              </div>
              
              <p className="text-cyber-green-dim text-sm">
                REDIRECTING TO SECURE TERMINAL...
              </p>
            </div>
          </HolographicInterface>
        )}
      </motion.div>
      
      {/* Connection status */}
      <motion.div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center text-cyber-green-dim text-xs space-x-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
        <span>SECURE CONNECTION ESTABLISHED • {new Date().toISOString()}</span>
      </motion.div>
    </div>
  );
}