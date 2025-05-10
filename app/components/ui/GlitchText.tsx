import React from 'react';

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

export default function GlitchText({ 
  children, 
  className = '',
  intensity = 'medium'
}: GlitchTextProps) {
  const text = typeof children === 'string' ? children : '';
  
  const intensityClass = {
    low: 'animate-[glitch_3s_ease-in-out_infinite]',
    medium: 'animate-[glitch_1.5s_ease-in-out_infinite]',
    high: 'animate-[glitch_0.5s_ease-in-out_infinite]',
  }[intensity];
  
  return (
    <span 
      className={`glitch-text ${intensityClass} ${className}`} 
      data-text={text}
    >
      {children}
    </span>
  );
}