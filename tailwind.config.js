/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'Arial', 'system-ui', 'sans-serif'],
      },
      colors: {
        earth: {
          50: '#faf6ef',
          100: '#f5ecdb',
          200: '#ebd9bc',
          300: '#dcc091',
          400: '#c9a062',
          500: '#b88547',
          600: '#a06d3a',
          700: '#825532',
          800: '#704c12',
          900: '#5d432c',
          950: '#3d2a18',
        },
        paper: {
          50: '#fdfbf6',
          100: '#f8f3e9',
          200: '#f1e9d6',
          300: '#ebdbc6',
          400: '#dcc8a6',
          500: '#c9b088',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e8e8e6',
          200: '#d1d1cd',
          300: '#a8a8a2',
          400: '#7a7a72',
          500: '#5d5d54',
          600: '#494942',
          700: '#3a3a34',
          800: '#2a2a25',
          900: '#1c1c19',
          950: '#0f0f0d',
        },
        accent: {
          ok: '#3f7d5e',
          warn: '#c08a3e',
          err: '#b54848',
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
