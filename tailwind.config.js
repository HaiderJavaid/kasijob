/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kasi: {
          gold: "#FFD700",
          dark: "#1A1A1A",
          gray: "#F3F4F6",
          subtle: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'], 
      },
    },
  },
  plugins: [],
};