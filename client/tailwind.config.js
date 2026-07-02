/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#07111f',
          secondary: '#0b172a',
        },
        card: 'rgba(17, 34, 57, 0.72)',
        primary: {
          DEFAULT: '#13b5ea',
          soft: '#38bdf8',
        },
        secondary: {
          DEFAULT: '#2864dc',
        },
        accent: {
          DEFAULT: '#e3ad25',
        },
        muted: '#94a3b8',
        success: '#22c55e',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(19, 181, 234, 0.35)',
        'glow-lg': '0 0 48px rgba(19, 181, 234, 0.4)',
        'glow-accent': '0 0 24px rgba(227, 173, 37, 0.35)',
        card: '0 8px 32px rgba(2, 8, 20, 0.5)',
      },
      backgroundImage: {
        'grid-scientific':
          'linear-gradient(rgba(56,189,248,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.06) 1px, transparent 1px)',
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(40,100,220,0.25), transparent 60%)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        orbit: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'orbit-slow': 'orbit 18s linear infinite',
        'orbit-fast': 'orbit 9s linear infinite',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [],
};
