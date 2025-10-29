/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F47C47",
        secondary: "#FEC878",
        tertiary: "#A86FA8"
      }
    },
  },
  plugins: [],
}
