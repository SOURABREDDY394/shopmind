/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
      },
      colors: {
        accent: '#0066FF',
      }
    },
  },
  plugins: [],
}
