/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- Importante para o nosso toggle funcionar
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
