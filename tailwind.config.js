/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    screens: {
      'phone': {'max': '390px'},
      'tablet': {'max': '640px'},
      'tablet-xl': {'max': '835px'},
      'laptop': {'max': '1024px'},
      'desktop': {'max': '1280px'},
    },
  },
  plugins: [],
}
