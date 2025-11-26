export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#050a14', // Deep space blue/black
          light: '#0f172a',
        },
        foreground: {
          DEFAULT: '#e2e8f0',
          dark: '#050a14',
        },
        cyber: {
          blue: '#00f3ff',
          pink: '#ff00ff',
          purple: '#bd00ff',
          yellow: '#fcee0a',
        },
        card: {
          DEFAULT: 'rgba(15, 23, 42, 0.6)',
          dark: '#050a14',
        },
        border: {
          DEFAULT: 'rgba(0, 243, 255, 0.2)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-fira-code)', 'Fira Mono', 'monospace'],
        cyber: ['var(--font-orbitron)', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 243, 255, 0.5), 0 0 20px rgba(0, 243, 255, 0.3)',
        'neon-pink': '0 0 10px rgba(255, 0, 255, 0.5), 0 0 20px rgba(255, 0, 255, 0.3)',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 10s linear infinite',
      },
    },
  },
  plugins: [],
}; 