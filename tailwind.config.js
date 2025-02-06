/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Arial', 'Helvetica', 'sans-serif'], // Default sans-serif font
      },
      colors: {
        gray: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e5e5e5',
          300: '#cccccc',
          400: '#b3b3b3',
          500: '#999999',
          600: '#808080',
          700: '#666666',
          800: '#4d4d4d',
          900: '#333333',
        },
        primary: '#ff5100', // Custom "primary" color
        secondary: '#9333ea', // Custom "secondary" color
      },
    },
  },
  plugins: [],
};