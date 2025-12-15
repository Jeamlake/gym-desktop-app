/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        kronnos: {
          dark: "#0B0F14",
          sidebar: "#111827",
          surface: "#1F2937",
          gold: "#FACC15",
          goldHover: "#EAB308",
          text: "#FFFFFF",
          muted: "#9CA3AF",
          danger: "#DC2626",
        },
      },
    },
  },
  plugins: [],
};

