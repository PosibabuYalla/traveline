/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FFF9E6',
          100: '#FFF0CE',
          200: '#FFE199',
          300: '#FFD166',
          400: '#FFC233',
          500: '#D99A19',
          600: '#A96908',
          700: '#7A4A00',
          800: '#4D2E00',
          900: '#1A0F00',
        },
        navy: {
          50: '#E8ECF3',
          100: '#C5CFE0',
          200: '#8B9FC1',
          300: '#5270A2',
          400: '#2D4A83',
          500: '#14213D',
          600: '#0F1A30',
          700: '#0A1223',
          800: '#050B16',
          900: '#020408',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(20, 33, 61, 0.08)',
        'glass-hover': '0 12px 40px rgba(20, 33, 61, 0.14)',
        'gold': '0 4px 24px rgba(217, 154, 25, 0.25)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
