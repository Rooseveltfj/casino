import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: {
          base: "#0A0E1A",
          surface: "#131826",
          elevated: "#1A2236",
        },
        accent: {
          cyan: "#00D4FF",
          gold: "#FFB800",
        },
        success: "#00F5A0",
        error: "#FF3D71",
        warning: "#FFAA00",
      },
      fontFamily: {
        heading: ["Satoshi", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "12px",
        lg: "20px",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px color-mix(in srgb, #00D4FF 40%, transparent)",
        "glow-gold": "0 0 20px color-mix(in srgb, #FFB800 40%, transparent)",
      },
    },
  },
};

export default config;
