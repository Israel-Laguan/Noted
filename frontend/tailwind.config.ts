import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
      },
      animation: { shimmer: "shimmer 1.2s infinite" },
    },
  },
  plugins: [],
};

export default config;
