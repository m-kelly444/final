'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface BiometricScanProps {
  onComplete: () => void;
  duration?: number; // Duration in milliseconds
  type?: 'retina' | 'fingerprint' | 'facial';
  className?: string;
}

/**
 * BiometricScan Component
 * 
 * A futuristic biometric scanning animation
 */
export default function BiometricScan({
  onComplete,
  duration = 3500,
  type = 'retina',
  className = '',
}: BiometricScanProps) {
  const [scanProgress, setScanProgress] = useState(0);
  const [scanComplete, setScanComplete] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessages, setSuccessMessages] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const completeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect for running the scan
  useEffect(() => {
    // Setup audio
    if (typeof Audio !== 'undefined') {
      audioRef.current = new Audio('/sounds/scan.mp3');
      audioRef.current.volume = 0.4;
      audioRef.current.play().catch(e => console.log('Audio playback prevented by browser'));
    }
    
    // Setup error and success messages
    const errorMessagesOptions = [
      'ANALYZING BIOMETRIC SIGNATURE...',
      'MATCHING AGAINST DATABASE...',
      'VERIFYING NEURAL PATTERNS...',
      'CHECKING QUANTUM SIGNATURE...',
    ];
    
    const successMessagesOptions = [
      'MATCH FOUND',
      'IDENTITY CONFIRMED',
      'ACCESS GRANTED'
    ];
    
    // Add random error messages during scan
    const addErrorMessage = (index: number) => {
      if (index < errorMessagesOptions.length) {
        setErrorMessages(prev => [...prev, errorMessagesOptions[index]]);
        
        // Schedule next message if not at the end
        if (index + 1 < errorMessagesOptions.length) {
          setTimeout(() => {
            addErrorMessage(index + 1);
          }, duration / (errorMessagesOptions.length + 1));
        }
      }
    };
    
    // Start error messages
    addErrorMessage(0);
    
    // Simulate scan progress
    let startTime = Date.now();
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setScanProgress(progress);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      } else {
        // Complete scan
        setScanComplete(true);
        setMatchFound(true);
        
        // Add success messages with delays
        successMessagesOptions.forEach((msg, idx) => {
          setTimeout(() => {
            setSuccessMessages(prev => [...prev, msg]);
          }, 400 * idx);
        });
        
        // Call onComplete with a slight delay
        completeTimeoutRef.current = setTimeout(() => {
          onComplete();
        }, 1500);
      }
    };
    
    // Start the progress update
    animationFrameRef.current = requestAnimationFrame(updateProgress);
    
    // Draw on canvas based on scan type
    initializeCanvas();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (completeTimeoutRef.current) {
        clearTimeout(completeTimeoutRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [duration, onComplete, type]);
  
  // Effect to update the canvas animation
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const updateCanvas = () => {
      if (type === 'retina') {
        drawRetinaScanner();
      } else if (type === 'fingerprint') {
        drawFingerprintScanner();
      } else if (type === 'facial') {
        drawFacialScanner();
      }
      
      animationFrameRef.current = requestAnimationFrame(updateCanvas);
    };
    
    animationFrameRef.current = requestAnimationFrame(updateCanvas);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [type, scanProgress, scanComplete]);
  
  // Initialize canvas
  const initializeCanvas = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  };
  
  // Draw retina scanner animation
  const drawRetinaScanner = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw iris
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = Math.min(canvas.width, canvas.height) * 0.4;
    
    // Background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fill();
    
    // Outer iris ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.strokeStyle = scanComplete 
      ? (matchFound ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 85, 0.8)') 
      : 'rgba(0, 179, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Iris texture - radial lines
    const segments = 36;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const innerRadius = outerRadius * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(angle) * innerRadius,
        centerY + Math.sin(angle) * innerRadius
      );
      ctx.lineTo(
        centerX + Math.cos(angle) * outerRadius * 0.9,
        centerY + Math.sin(angle) * outerRadius * 0.9
      );
      ctx.strokeStyle = scanComplete 
        ? (matchFound ? 'rgba(0, 255, 65, 0.5)' : 'rgba(255, 0, 85, 0.5)') 
        : 'rgba(0, 179, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    
    // Pupil
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();
    
    // Scanning line
    if (!scanComplete) {
      const scanY = centerY - outerRadius + scanProgress * outerRadius * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX - outerRadius, scanY);
      ctx.lineTo(centerX + outerRadius, scanY);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Add glow effect
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerX - outerRadius, scanY);
      ctx.lineTo(centerX + outerRadius, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Data points when scanning is complete
    if (scanComplete) {
      const dataPoints = 12;
      for (let i = 0; i < dataPoints; i++) {
        const angle = (i / dataPoints) * Math.PI * 2;
        const radius = outerRadius * (0.5 + Math.random() * 0.4);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = matchFound ? 'rgba(0, 255, 65, 0.9)' : 'rgba(255, 0, 85, 0.9)';
        ctx.fill();
        
        // Connect to center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = matchFound ? 'rgba(0, 255, 65, 0.5)' : 'rgba(255, 0, 85, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  };
  
  // Draw fingerprint scanner animation
  const drawFingerprintScanner = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw fingerprint container
    const margin = 20;
    const width = canvas.width - margin * 2;
    const height = canvas.height - margin * 2;
    
    // Background rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(margin, margin, width, height);
    
    // Border
    ctx.strokeStyle = scanComplete 
      ? (matchFound ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 85, 0.8)') 
      : 'rgba(0, 179, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width, height);
    
    // Scanning effect
    if (!scanComplete) {
      const scanHeight = height * scanProgress;
      ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
      ctx.fillRect(margin, margin + height - scanHeight, width, scanHeight);
      
      // Scanning line
      ctx.beginPath();
      ctx.moveTo(margin, margin + height - scanHeight);
      ctx.lineTo(margin + width, margin + height - scanHeight);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(margin, margin + height - scanHeight);
      ctx.lineTo(margin + width, margin + height - scanHeight);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Draw fingerprint pattern
    const centerX = margin + width / 2;
    const centerY = margin + height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    
    // Generate fingerprint-like arcs
    const arcCount = 15;
    for (let i = 0; i < arcCount; i++) {
      const radius = (i / arcCount) * maxRadius;
      const startAngle = Math.PI * 0.5 + (i * Math.PI * 0.1);
      const endAngle = Math.PI * 1.5 - (i * Math.PI * 0.1);
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = scanComplete 
        ? (matchFound ? `rgba(0, 255, 65, ${0.3 + (i / arcCount) * 0.5})` : `rgba(255, 0, 85, ${0.3 + (i / arcCount) * 0.5})`) 
        : `rgba(0, 179, 255, ${0.3 + (i / arcCount) * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    
    // Add some random short arcs for detail
    if (scanComplete) {
      const detailCount = 30;
      for (let i = 0; i < detailCount; i++) {
        const radius = Math.random() * maxRadius;
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + (Math.random() * Math.PI * 0.5);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.strokeStyle = matchFound ? 'rgba(0, 255, 65, 0.7)' : 'rgba(255, 0, 85, 0.7)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      // Add match points
      const pointCount = 10;
      for (let i = 0; i < pointCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * maxRadius;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = matchFound ? 'rgba(0, 255, 65, 0.9)' : 'rgba(255, 0, 85, 0.9)';
        ctx.fill();
      }
    }
  };
  
  // Draw facial scanner animation
  const drawFacialScanner = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw facial outline
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const faceWidth = canvas.width * 0.6;
    const faceHeight = canvas.height * 0.8;
    
    // Face outline
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, faceWidth / 2, faceHeight / 2, 0, 0, Math.PI * 2);
    ctx.strokeStyle = scanComplete 
      ? (matchFound ? 'rgba(0, 255, 65, 0.8)' : 'rgba(255, 0, 85, 0.8)') 
      : 'rgba(0, 179, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Eyes
    const eyeDistance = faceWidth * 0.25;
    const eyeY = centerY - faceHeight * 0.1;
    const eyeWidth = faceWidth * 0.15;
    const eyeHeight = faceHeight * 0.08;
    
    // Left eye
    ctx.beginPath();
    ctx.ellipse(centerX - eyeDistance, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Right eye
    ctx.beginPath();
    ctx.ellipse(centerX + eyeDistance, eyeY, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
    ctx.stroke();
    
    // Nose
    ctx.beginPath();
    ctx.moveTo(centerX, eyeY + eyeHeight * 2);
    ctx.lineTo(centerX - faceWidth * 0.05, centerY + faceHeight * 0.1);
    ctx.lineTo(centerX + faceWidth * 0.05, centerY + faceHeight * 0.1);
    ctx.stroke();
    
    // Mouth
    const mouthY = centerY + faceHeight * 0.2;
    const mouthWidth = faceWidth * 0.3;
    
    ctx.beginPath();
    ctx.moveTo(centerX - mouthWidth, mouthY);
    ctx.quadraticCurveTo(centerX, mouthY + faceHeight * 0.05, centerX + mouthWidth, mouthY);
    ctx.stroke();
    
    // Scanning effect
    if (!scanComplete) {
      const scanY = centerY - faceHeight / 2 + scanProgress * faceHeight;
      
      ctx.beginPath();
      ctx.moveTo(centerX - faceWidth / 2, scanY);
      ctx.lineTo(centerX + faceWidth / 2, scanY);
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Glow effect
      ctx.shadowColor = 'rgba(0, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(centerX - faceWidth / 2, scanY);
      ctx.lineTo(centerX + faceWidth / 2, scanY);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    
    // Feature points when scan is complete
    if (scanComplete) {
      const featurePoints = [
        // Eyes
        [centerX - eyeDistance - eyeWidth * 0.5, eyeY - eyeHeight * 0.5],
        [centerX - eyeDistance + eyeWidth * 0.5, eyeY - eyeHeight * 0.5],
        [centerX - eyeDistance - eyeWidth * 0.5, eyeY + eyeHeight * 0.5],
        [centerX - eyeDistance + eyeWidth * 0.5, eyeY + eyeHeight * 0.5],
        [centerX + eyeDistance - eyeWidth * 0.5, eyeY - eyeHeight * 0.5],
        [centerX + eyeDistance + eyeWidth * 0.5, eyeY - eyeHeight * 0.5],
        [centerX + eyeDistance - eyeWidth * 0.5, eyeY + eyeHeight * 0.5],
        [centerX + eyeDistance + eyeWidth * 0.5, eyeY + eyeHeight * 0.5],
        // Nose
        [centerX, eyeY + eyeHeight * 2],
        [centerX - faceWidth * 0.05, centerY + faceHeight * 0.1],
        [centerX + faceWidth * 0.05, centerY + faceHeight * 0.1],
        // Mouth
        [centerX - mouthWidth, mouthY],
        [centerX, mouthY + faceHeight * 0.05],
        [centerX + mouthWidth, mouthY],
        // Chin and forehead
        [centerX, centerY + faceHeight * 0.4],
        [centerX, centerY - faceHeight * 0.4],
        // Cheeks
        [centerX - faceWidth * 0.4, centerY],
        [centerX + faceWidth * 0.4, centerY]
      ];
      
      featurePoints.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = matchFound ? 'rgba(0, 255, 65, 0.9)' : 'rgba(255, 0, 85, 0.9)';
        ctx.fill();
      });
      
      // Connect some points to show mesh
      for (let i = 0; i < featurePoints.length; i++) {
        for (let j = i + 1; j < featurePoints.length; j++) {
          // Only connect points that are close enough
          const dist = Math.sqrt(
            Math.pow(featurePoints[i][0] - featurePoints[j][0], 2) +
            Math.pow(featurePoints[i][1] - featurePoints[j][1], 2)
          );
          
          if (dist < faceWidth * 0.3) {
            ctx.beginPath();
            ctx.moveTo(featurePoints[i][0], featurePoints[i][1]);
            ctx.lineTo(featurePoints[j][0], featurePoints[j][1]);
            ctx.strokeStyle = matchFound ? 'rgba(0, 255, 65, 0.2)' : 'rgba(255, 0, 85, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }
  };

  return (
    <div className={`biometric-scan ${className}`}>
      <div className="relative w-full">
        {/* Main canvas for the scan visualization */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-64 bg-cyber-black bg-opacity-50"
        />
        
        {/* Progress bar */}
        <div className="mt-4 bg-cyber-dark h-2 w-full">
          <motion.div 
            className="h-full bg-cyber-blue"
            initial={{ width: '0%' }}
            animate={{ width: `${scanProgress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        {/* Status messages */}
        <div className="mt-4 space-y-2 text-sm text-cyber-green-dim">
          {errorMessages.map((msg, index) => (
            <motion.div 
              key={`error-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              &gt; {msg}
            </motion.div>
          ))}
          
          {successMessages.map((msg, index) => (
            <motion.div 
              key={`success-${index}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-cyber-green font-bold"
              transition={{ duration: 0.3 }}
            >
              &gt; {msg}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}