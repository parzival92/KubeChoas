export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0f172a', // slate-900
          light: '#f8fafc',   // slate-50
        },
        foreground: {
          DEFAULT: '#f1f5f9', // slate-100
          dark: '#0f172a',    // slate-900
        },
        accent: {
          DEFAULT: '#34d399', // emerald-400
          dark: '#059669',    // emerald-600
        },
        card: {
          DEFAULT: '#1e293b', // slate-800
          dark: '#0f172a',    // slate-900
        },
        border: {
          DEFAULT: '#334155', // slate-700
        },
        muted: {
          DEFAULT: '#64748b', // slate-500
        },
        error: {
          DEFAULT: '#ef4444', // red-500
        },
        warning: {
          DEFAULT: '#f59e42', // orange-400
        },
        info: {
          DEFAULT: '#38bdf8', // sky-400
        },
        success: {
          DEFAULT: '#22d3ee', // cyan-400
        },
      },
      borderRadius: {
        lg: '1rem',
        xl: '1.5rem',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['Fira Mono', 'ui-monospace', 'SFMono-Regular'],
      },
    },
  },
  plugins: [],
}; 