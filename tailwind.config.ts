import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./server/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#FFFFFF",
        ink: "#161616",
        pink: {
          DEFAULT: "#FF2E93",
          hover: "#E01B7C",
        },
        blue: {
          DEFAULT: "#2F6FFF",
          hover: "#1E58DC",
        },
        jet: {
          DEFAULT: "#161616",
          hover: "#2A2A2A",
        },
        lime: {
          DEFAULT: "#B6FF3C",
          hover: "#A3ED26",
        },
        sunshine: {
          DEFAULT: "#FFD23C",
          hover: "#E6BC24",
        },
        tomato: {
          DEFAULT: "#FF4D3C",
          hover: "#E63A2A",
        },
      },
      fontFamily: {
        bungee: ["var(--font-bungee)", "sans-serif"],
        inter: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        neo: "4px 4px 0px #161616",
        "neo-sm": "2px 2px 0px #161616",
        "neo-lg": "6px 6px 0px #161616",
        "neo-xl": "8px 8px 0px #161616",
        "neo-hover": "2px 2px 0px #161616",
        "neo-lime": "4px 4px 0px #B6FF3C",
        "neo-pink": "4px 4px 0px #FF2E93",
        "neo-blue": "4px 4px 0px #2F6FFF",
      },
      borderWidth: {
        DEFAULT: "2px",
        3: "3px",
        4: "4px",
      },
    },
  },
  plugins: [],
};

export default config;
