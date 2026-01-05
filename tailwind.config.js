/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      colors: {
        'brand': {
          DEFAULT: '#016766',
          light: '#018f80',
          dark: '#014f4d'
        },
        'brand-pale': '#F9F8E9',
        'brand-success': '#22c55e'
      }
    }
  },
  plugins: [],
}
