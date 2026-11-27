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
        bangla: {
          green: '#006a4e', // Bangladesh flag green
          'green-light': '#0a8764',
          'green-dark': '#004c38',
          red: '#f42a41', // Bangladesh flag red
          gold: '#f59e0b',
        },
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Hind Siliguri', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
