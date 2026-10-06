/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0B0F',
          surface: '#111116',
          card: '#15151B',
          border: '#23232D',
          hover: '#1B1B24'
        },
        accent: {
          DEFAULT: '#00E676',
          hover: '#00C853',
          glow: 'rgba(0, 230, 118, 0.25)',
          muted: 'rgba(0, 230, 118, 0.1)'
        },
        content: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'emerald-glow': '0 0 25px -5px rgba(0, 230, 118, 0.3)',
        'emerald-sm': '0 0 12px -2px rgba(0, 230, 118, 0.25)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
