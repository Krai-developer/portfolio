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
          border: '#24242E',
          hover: '#1C1C24'
        },
        accent: {
          DEFAULT: '#F5F5F5',
          hover: '#E2E2E8',
          glow: 'rgba(245, 245, 245, 0.22)',
          muted: 'rgba(245, 245, 245, 0.08)'
        },
        content: {
          primary: '#F5F5F5',
          secondary: '#B4B4BE',
          muted: '#787884'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'emerald-glow': '0 0 28px -5px rgba(245, 245, 245, 0.22)',
        'emerald-sm': '0 0 14px -2px rgba(245, 245, 245, 0.18)',
        'card-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)'
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
