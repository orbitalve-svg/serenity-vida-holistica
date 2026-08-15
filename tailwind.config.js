import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [join(__dirname, 'index.html'), join(__dirname, 'src/**/*.{js,ts,jsx,tsx}')],
  theme: {
    extend: {
      colors: {
        serenity: {
          void: '#0F0A1C',
          'purple-deep': '#2D1547',
          purple: '#5B2C82',
          gold: '#C9A84C',
          'gold-light': '#E8A93C',
          cream: '#FBF6EC',
          ink: '#241830',
          mist: '#CBB8DC',
          veil: '#ECE6F4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        playfair: ['"Playfair Display"', 'serif'],
        cinzel: ['Cinzel', 'serif'],
      },
      keyframes: {
        heroReveal: {
          '0%': { opacity: '0', transform: 'translateY(28px)', filter: 'blur(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        heroFadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        heroZoom: {
          '0%': { transform: 'scale(1.12)' },
          '100%': { transform: 'scale(1)' },
        },
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(37,211,102,0.45)' },
          '70%': { boxShadow: '0 0 0 22px rgba(37,211,102,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37,211,102,0)' },
        },
        floatY: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 2.2s cubic-bezier(0.16,1,0.3,1) infinite',
        'float-y': 'floatY 6s ease-in-out infinite',
        'spin-slow': 'spinSlow 60s linear infinite',
      },
    },
  },
  plugins: [],
}
