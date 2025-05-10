import React from 'react';

interface CyberButtonProps {
  children: React.ReactNode;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export default function CyberButton({
  children,
  variant = 'filled',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: CyberButtonProps) {
  const baseClasses = 'cyber-button font-terminal relative overflow-hidden transition-all';
  
  const variantClasses = {
    filled: 'bg-cyber-green text-cyber-black',
    outlined: 'bg-transparent text-cyber-green border border-cyber-green',
  };
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-3',
    md: 'text-sm py-2 px-4',
    lg: 'text-base py-3 px-6',
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'hover:bg-cyber-green hover:text-cyber-black';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}