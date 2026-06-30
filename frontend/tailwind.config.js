/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f46",
          600: "#8f0000",
          700: "#be1230",
          800: "#9f1230",
          900: "#881337",
          950: "#4c0519",
        },
      },
    },
  },
  plugins: [],
};
