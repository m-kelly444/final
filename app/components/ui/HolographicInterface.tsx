'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HolographicInterfaceProps {
  children: React.ReactNode;
  title?: string;
  active?: boolean;
  securityLevel?: 'alpha' | 'beta' | 'gamma' | 'omega';
  className?: string;
  interactive?: boolean;
  glitchIntensity?: 'low' | 'medium' | 'high';
  showScanlines?: boolean;
}

/**
 * Holographic Interface Component
 * 
 * A futuristic holographic container that makes content appear to float
 * in 3D space with parallax effects, glitches, and interactive elements
 */
export default function HolographicInterface({
  children,
  title = 'HOLOGRAPHIC TERMINAL',
  active = true,
  securityLevel = 'beta',
  className = '',
  interactive = true,
  glitchIntensity = 'medium',
  showScanlines = true,
}: HolographicInterfaceProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const glitchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get security level color
  const getSecurityColor = () => {
    switch (securityLevel) {
      case 'alpha': return 'rgb(255, 0, 85)'; // Cyber red
      case 'beta': return 'rgb(0, 255, 65)';  // Cyber green
      case 'gamma': return 'rgb(0, 179, 255)'; // Cyber blue
      case 'omega': return 'rgb(153, 51, 255)'; // Cyber purple
      default: return 'rgb(0, 255, 65)';
    }
  };
  
  // Set glitch frequency based on intensity
  const getGlitchFrequency = () => {
    switch (glitchIntensity) {
      case 'low': return { min: 3000, max: 10000 };
      case 'high': return { min: 500, max: 3000 };
      case 'medium':
      default: return { min: 1500, max: 5000 };
    }
  };
  
  // Initialize with boot sequence
  useEffect(() => {
    initialTimeoutRef.current = setTimeout(() => {
      setIsInitializing(false);
    }, 1500);
    
    return () => {
      if (initialTimeoutRef.current) {
        clearTimeout(initialTimeoutRef.current);
      }
    };
  }, []);
  
  // Set up random glitch effects
  useEffect(() => {
    if (!active) return;
    
    const { min, max } = getGlitchFrequency();
    
    const triggerGlitch = () => {
      setGlitchActive(true);
      setTimeout(() => {
        setGlitchActive(false);
      }, 150);
      
      const nextGlitchDelay = Math.random() * (max - min) + min;
      glitchIntervalRef.current = setTimeout(triggerGlitch, nextGlitchDelay);
    };
    
    glitchIntervalRef.current = setTimeout(triggerGlitch, 2000);
    
    return () => {
      if (glitchIntervalRef.current) {
        clearTimeout(glitchIntervalRef.current);
      }
    };
  }, [active, glitchIntensity]);
  
  // Track mouse movement for parallax effect
  useEffect(() => {
    if (!interactive) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Calculate mouse position relative to container center
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      
      setMousePosition({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);
  
  // Calculate tilt and parallax based on mouse position
  const getTiltStyle = () => {
    if (!interactive) return {};
    
    // Subtle rotation based on mouse position
    const rotateX = mousePosition.y * -5; // Inverse Y for natural tilt
    const rotateY = mousePosition.x * 5;
    
    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
    };
  };
  
  // Get parallax effect for content
  const getContentStyle = () => {
    if (!interactive) return {};
    
    // Parallax effect for content, moving slightly opposite to container tilt
    const translateX = mousePosition.x * -10;
    const translateY = mousePosition.y * -10;
    
    return {
      transform: `translate3d(${translateX}px, ${translateY}px, 20px)`,
    };
  };
  
  // Get security level display
  const getSecurityText = () => {
    return `SECURITY: ${securityLevel.toUpperCase()}`;
  };
  
  // Define border color based on security level
  const borderColor = getSecurityColor();

  return (
    <div 
      ref={containerRef}
      className={`holographic-interface relative ${className}`}
      style={{
        transition: 'box-shadow 0.3s ease',
        boxShadow: `0 0 15px ${borderColor}88, inset 0 0 5px ${borderColor}88`,
      }}
    >
      <AnimatePresence>
        {isInitializing ? (
          <motion.div
            className="absolute inset-0 bg-cyber-black flex flex-col items-center justify-center overflow-hidden p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="typing text-cyber-green mb-4">
              &gt; INITIALIZING HOLOGRAPHIC INTERFACE...
              <br />
              &gt; QUANTUM RENDERING SYSTEM ONLINE...
              <br />
              &gt; SECURITY PROTOCOLS ACTIVE...
            </div>
            <div className="cyber-spinner"></div>
          </motion.div>
        ) : (
          <motion.div
            className="h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={getTiltStyle()}
          >
            {/* Interface header */}
            <div className="terminal-header flex items-center justify-between p-2 border-b border-cyber-green">
              <div className="flex items-center space-x-2">
                <div className="terminal-dots flex">
                  <div className="terminal-dot bg-cyber-red"></div>
                  <div className="terminal-dot bg-cyber-yellow"></div>
                  <div className="terminal-dot bg-cyber-green"></div>
                </div>
                <div className="terminal-title text-xs tracking-wider" style={{ color: borderColor }}>
                  {title}
                </div>
              </div>
              <div 
                className="text-xs tracking-wider" 
                style={{ color: borderColor }}
              >
                {getSecurityText()}
              </div>
            </div>
            
            {/* Content container with parallax effect */}
            <div 
              className="relative z-10 p-4"
              style={getContentStyle()}
            >
              {children}
            </div>
            
            {/* Interactive elements */}
            {interactive && (
              <>
                {/* Corner brackets for holographic look */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor }}></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor }}></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor }}></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor }}></div>
              </>
            )}
            
            {/* Glitch overlay */}
            {glitchActive && (
              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-cyber-green opacity-5"></div>
                <div className="absolute inset-0 bg-cyber-red opacity-5 transform translate-x-1"></div>
                <div className="absolute inset-0 bg-cyber-blue opacity-5 transform -translate-x-1"></div>
              </div>
            )}
            
            {/* Scanlines overlay */}
            {showScanlines && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
                <div className="scan-line absolute inset-0"></div>
              </div>
            )}
            
            {/* Status indicators */}
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${active ? 'bg-cyber-green animate-pulse' : 'bg-cyber-red'}`}></div>
              <div className="text-xs" style={{ color: borderColor }}>
                {active ? 'ONLINE' : 'STANDBY'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}