/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // If you want to use `border-border`, define it here:
        border: "#e5e7eb", // example gray border color
      },
    },
  },
  plugins: [],
};
