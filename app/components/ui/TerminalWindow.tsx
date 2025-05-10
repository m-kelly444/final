import React from 'react';

interface TerminalWindowProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showDots?: boolean;
}

export default function TerminalWindow({
  children,
  title = 'TERMINAL',
  className = '',
  showDots = true,
}: TerminalWindowProps) {
  return (
    <div className={`terminal-window ${className}`}>
      <div className="terminal-header">
        {showDots && (
          <div className="terminal-dots">
            <div className="terminal-dot bg-cyber-red"></div>
            <div className="terminal-dot bg-cyber-yellow"></div>
            <div className="terminal-dot bg-cyber-green"></div>
          </div>
        )}
        <div className="terminal-title">{title}</div>
      </div>
      <div className="scan-line"></div>
      {children}
    </div>
  );
}