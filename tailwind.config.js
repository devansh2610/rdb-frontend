/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        signup: "url(assets/hero_background.jpg)",
      },
      backdropContrast: {
        95: '.95',
      }
    },
  },
  plugins: [require("flowbite/plugin")],
};
