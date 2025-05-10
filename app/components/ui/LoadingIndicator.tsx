import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export default function LoadingIndicator({
  size = 'md',
  className = '',
  text = 'LOADING...',
}: LoadingIndicatorProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`cyber-spinner ${sizeClasses[size]}`}></div>
      {text && (
        <div className="mt-3 text-cyber-green-dim text-sm tracking-wider font-terminal">
          {text}
        </div>
      )}
    </div>
  );
}