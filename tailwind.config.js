/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          950: '#07080f',
          900: '#0b0d16',
          850: '#10131f',
          800: '#151928',
          700: '#1d2233',
          600: '#272d42',
          500: '#3a4159',
        },
        brand: {
          400: '#8b8cf9',
          500: '#6c6cf5',
          600: '#5145e5',
        },
      },
      boxShadow: {
        node: '0 1px 2px rgba(0,0,0,.5), 0 12px 32px -12px rgba(0,0,0,.75)',
        lift: '0 24px 60px -20px rgba(0,0,0,.85)',
        glow: '0 0 0 1px rgba(139,140,249,.5), 0 0 28px -4px rgba(108,108,245,.55)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'perspective(1000px) rotateX(14deg) translateY(24px) scale(.94)' },
          '100%': { opacity: '1', transform: 'perspective(1000px) rotateX(0) translateY(0) scale(1)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(3%, -4%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-3%, 3%, 0) scale(.95)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
        'spin-ring': { to: { transform: 'rotate(360deg)' } },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '.55', transform: 'scale(1.35)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up .32s cubic-bezier(.22,1,.36,1) both',
        'pop-in': 'pop-in .42s cubic-bezier(.22,1,.36,1) both',
        'drift': 'drift 22s ease-in-out infinite',
        'shimmer': 'shimmer 2.4s linear infinite',
        'spin-ring': 'spin-ring .7s linear infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'slide-in-left': 'slide-in-left .25s ease-out both',
      },
    },
  },
  plugins: [],
};
