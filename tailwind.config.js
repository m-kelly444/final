/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'cyber-black': '#0a0a0a',
          'cyber-dark': '#111111',
          'cyber-green': '#00ff41',
          'cyber-green-dim': '#00cc33',
          'cyber-blue': '#00b3ff',
          'cyber-red': '#ff0055',
          'cyber-purple': '#9933ff',
          'cyber-yellow': '#ffcc00',
        },
        fontFamily: {
          'terminal': ['JetBrains Mono', 'monospace'],
          'glitch': ['Share Tech Mono', 'monospace'],
        },
        animation: {
          'glitch': 'glitch 1s linear infinite',
          'scan': 'scan 2s linear infinite',
          'blink': 'blink 1s infinite',
          'terminal-type': 'terminal-type 4s steps(40, end)',
        },
        keyframes: {
          glitch: {
            '0%': { transform: 'translate(0)' },
            '2%': { transform: 'translate(2px, 2px)' },
            '4%': { transform: 'translate(-2px, -2px)' },
            '6%': { transform: 'translate(2px, -2px)' },
            '8%': { transform: 'translate(-2px, 2px)' },
            '10%': { transform: 'translate(0)' },
          },
          scan: {
            '0%': { backgroundPosition: '0% 0%' },
            '100%': { backgroundPosition: '0% 100%' },
          },
          blink: {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0 },
          },
          'terminal-type': {
            'from': { width: '0' },
            'to': { width: '100%' },
          },
        },
        backgroundImage: {
          'grid-pattern': 'linear-gradient(to right, #00ff4133 1px, transparent 1px), linear-gradient(to bottom, #00ff4133 1px, transparent 1px)',
          'scan-line': 'linear-gradient(to bottom, transparent, rgba(0, 255, 65, 0.2), transparent 100%)',
        },
        backgroundSize: {
          'grid-size': '20px 20px',
        },
      },
    },
    plugins: [],
  };