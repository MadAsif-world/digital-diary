/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "#111111",
        "bg-deep": "#0C0C0C",
        card: "#1E1E1E",
        elevated: "#2A2A2A",
        border: "#333333",
        // Text
        ink: "#FFFFFF",
        "ink-muted": "#A8A8A8",
        "ink-faint": "#6E6E6E",
        // Accents
        gold: "#D9C84E",
        "gold-soft": "#E7DC8C",
        love: "#D7263D",
        "love-soft": "#F06A78",
        success: "#4ECB9A",
        warning: "#E0A458",
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      letterSpacing: {
        luxe: "3px",
        wide2: "1.5px",
      },
    },
  },
  plugins: [],
};
