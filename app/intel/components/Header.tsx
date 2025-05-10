'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlitchText from './ui/GlitchText';
import { signOut } from '../../lib/auth';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Don't show the header on the login page
  if (pathname === '/login') {
    return null;
  }
  
  const isHomePage = pathname === '/';
  const isDashboard = pathname === '/dashboard';
  const isIntel = pathname === '/intel';
  
  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <header className="border-b border-cyber-green border-opacity-30 py-4 px-6">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 mr-2 border border-cyber-green flex items-center justify-center">
              <span className="text-cyber-green font-bold">E</span>
            </div>
            <h1 className="text-2xl font-bold text-cyber-green">
              <GlitchText intensity="low">ECHELON</GlitchText>
            </h1>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          {!isHomePage && (
            <>
              <Link 
                href="/dashboard" 
                className={`px-3 py-2 transition ${
                  isDashboard 
                    ? 'text-cyber-green border-b-2 border-cyber-green' 
                    : 'text-cyber-green-dim hover:text-cyber-green'
                }`}
              >
                DASHBOARD
              </Link>
              <Link 
                href="/intel" 
                className={`px-3 py-2 transition ${
                  isIntel 
                    ? 'text-cyber-green border-b-2 border-cyber-green' 
                    : 'text-cyber-green-dim hover:text-cyber-green'
                }`}
              >
                INTEL
              </Link>
              <button 
                onClick={handleLogout} 
                className="cyber-button bg-transparent text-cyber-red border border-cyber-red hover:bg-cyber-red hover:text-cyber-black ml-4"
              >
                LOGOUT
              </button>
            </>
          )}
          
          {isHomePage && (
            <>
              <Link 
                href="/login" 
                className="cyber-button bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-black"
              >
                LOGIN
              </Link>
              <Link 
                href="/dashboard" 
                className="cyber-button bg-cyber-green text-cyber-black border border-cyber-green"
              >
                DEMO
              </Link>
            </>
          )}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-cyber-green border border-cyber-green p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? 'CLOSE' : 'MENU'}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden mt-4 border-t border-cyber-green border-opacity-30 pt-4">
          <div className="container mx-auto flex flex-col space-y-3">
            {!isHomePage && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`px-3 py-2 transition ${
                    isDashboard 
                      ? 'text-cyber-green border-l-2 border-cyber-green' 
                      : 'text-cyber-green-dim hover:text-cyber-green'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DASHBOARD
                </Link>
                <Link 
                  href="/intel" 
                  className={`px-3 py-2 transition ${
                    isIntel 
                      ? 'text-cyber-green border-l-2 border-cyber-green' 
                      : 'text-cyber-green-dim hover:text-cyber-green'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  INTEL
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="cyber-button bg-transparent text-cyber-red border border-cyber-red hover:bg-cyber-red hover:text-cyber-black w-full mt-4"
                >
                  LOGOUT
                </button>
              </>
            )}
            
            {isHomePage && (
              <>
                <Link 
                  href="/login" 
                  className="cyber-button bg-transparent text-cyber-green border border-cyber-green hover:bg-cyber-green hover:text-cyber-black w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  LOGIN
                </Link>
                <Link 
                  href="/dashboard" 
                  className="cyber-button bg-cyber-green text-cyber-black border border-cyber-green w-full"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  DEMO
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}