import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on the login page
  if (pathname === '/login') {
    return null;
  }
  
  return (
    <footer className="border-t border-cyber-green border-opacity-30 py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-cyber-green-dim text-sm mb-3 md:mb-0">
          ECHELON SYSTEM v3.7.2 // CLASSIFIED // TOP SECRET
        </div>
        
        <div className="text-cyber-green-dim text-xs flex flex-col md:flex-row md:space-x-6">
          <span>LAST UPDATED: {new Date().toLocaleDateString()}</span>
          <span className="animate-pulse">SYSTEM STATUS: ACTIVE</span>
        </div>
      </div>
    </footer>
  );
}