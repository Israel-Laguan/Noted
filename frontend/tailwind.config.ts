import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      colors: {
        paper: "#fbf2e5",
        auth: "#FAF1E3",
        ink: "#362b24",
        muted: "#88642A",
        line: "#957139",
        accent: "#a8662a",
        cream: "#fffaf3",
        danger: "#a3473d",
        success: "#527a5e",
        "error-surface": "#f7d9d3",
        "error-text": "#873a32",
      },
      fontFamily: {
        sans: ["var(--font-inter)"],
        serif: ["var(--font-inria-serif)"],
      },
      keyframes: {
        shimmer: { to: { backgroundPositionX: "-200%" } },
        characterBounce: {
          "0%, 100%": { transform: "translateY(0) rotate(0)" },
          "2%": { transform: "translateY(0) rotate(0)" },
          "5%": { transform: "translateY(-20px) rotate(-5deg)" },
          "8%": { transform: "translateY(-15px) rotate(5deg)" },
          "12%": { transform: "translateY(-20px) rotate(-5deg)" },
          "15%": { transform: "translateY(0) rotate(0)" },
          "100%": { transform: "translateY(0) rotate(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.2s infinite",
        characterBounce: "characterBounce 35s infinite ease-in-out",
        waitingBounce: "characterBounce 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
