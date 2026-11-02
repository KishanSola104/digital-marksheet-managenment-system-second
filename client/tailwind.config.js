/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          500: '#334E68',
          700: '#1A365D',
          800: '#102A43',
          900: '#0B1D3A',
        },
        brand: {
          50: '#EBF8FF',
          100: '#BEE3F8',
          500: '#3182CE',
          600: '#2B6CB0',
          700: '#2C5282',
        },
        surface: {
          50: '#F7FAFC',
          100: '#EDF2F7',
          200: '#E2E8F0',
        }
      }
    },
  },
  plugins: [],
}
