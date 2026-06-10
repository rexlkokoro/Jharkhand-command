import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#080c10",
          2: "#0d1117",
          3: "#111820",
        },
        panel: "#0a0f16",
        border: {
          DEFAULT: "#1a2535",
          2: "#1f3048",
        },
        accent: {
          DEFAULT: "#00d4ff",
          2: "#0088cc",
          dim: "rgba(0,212,255,0.12)",
          glow: "rgba(0,212,255,0.06)",
        },
        "clr-green": "#00ff88",
        "clr-amber": "#ffaa00",
        "clr-red": "#ff3b5c",
        "clr-purple": "#9966ff",
        "text-base": "#c8d8e8",
        "text-dim": "#4a6480",
        "text-mid": "#7a9ab8",
      },
      fontFamily: {
        mono: ["Share Tech Mono", "monospace"],
        display: ["Barlow Condensed", "sans-serif"],
        body: ["Barlow", "sans-serif"],
      },
      animation: {
        "pulse-logo": "pulse-logo 3s ease-in-out infinite",
        "marker-pulse": "marker-pulse 3s ease-in-out infinite",
        "ring-expand": "ring-expand 3s ease-out infinite",
        blink: "blink 2s infinite",
        "fade-up": "fade-up 0.6s ease forwards",
      },
      keyframes: {
        "pulse-logo": {
          "0%,100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        "marker-pulse": {
          "0%,100%": { transform: "translate(-50%,-50%) scale(1)", opacity: "1" },
          "50%": { transform: "translate(-50%,-50%) scale(1.5)", opacity: "0.7" },
        },
        "ring-expand": {
          "0%": { inset: "-4px", opacity: "0.4" },
          "100%": { inset: "-16px", opacity: "0" },
        },
        blink: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.3" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
