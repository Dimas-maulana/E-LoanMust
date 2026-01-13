/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'secondary': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        'gold': {
          light: '#FFD700',
          DEFAULT: '#D4AF37',
          dark: '#B8860B',
        },
        'eloan': {
          blue: '#2196F3',
          'blue-light': '#64B5F6',
          'blue-dark': '#1565C0',
          gold: '#FFD700',
          'gold-light': '#FFF176',
          'gold-dark': '#FFC107',
        }
      },
      backgroundImage: {
        'gradient-eloan': 'linear-gradient(135deg, #1565C0 0%, #2196F3 50%, #64B5F6 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFC107 0%, #FFD700 50%, #FFF176 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(33, 150, 243, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(33, 150, 243, 0.6)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-light': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'gold': '0 4px 24px rgba(212, 175, 55, 0.4)',
        'blue': '0 4px 24px rgba(33, 150, 243, 0.4)',
      },
    },
  },
  plugins: [],
}
