/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        solara: {
          brown: '#5C3317',
          dark:  '#3B1F0A',
          gold:  '#B8860B',
          cream: '#F5E6C8',
          light: '#FAF3E0',
        }
      },
      fontFamily: {
        georgia: ['Georgia', 'serif'],
        arial: ['Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}