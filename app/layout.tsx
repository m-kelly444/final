import './styles/globals.css';
import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import Header from './components/Header';
import Footer from './components/Footer';

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono', 
});

export const metadata: Metadata = {
  title: 'Echelon | Cybersecurity Intelligence',
  description: 'Advanced threat intelligence and prediction system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jetbrainsMono.variable} font-terminal flex flex-col min-h-screen`}>
        <div className="min-h-screen flex flex-col bg-cyber-black">
          <div className="cyber-grid" />
          <div className="scan-line" />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}