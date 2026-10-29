/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#090a0d',
        surface: {
          DEFAULT: '#111318',
          subtle: '#181b22',
          card: '#15171f',
          elevated: '#1e222d',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-hover': 'rgba(255, 255, 255, 0.16)',
        },
        brand: {
          accent: '#e63946',
          gold: '#d4af37',
          cyan: '#38bdf8',
          zinc: '#94a3b8',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'ui-monospace',
          'SFMono-Regular',
          'monospace',
        ],
      },
      letterSpacing: {
        widest: '0.2em',
        ultra: '0.28em',
      }
    },
  },
  plugins: [],
}

