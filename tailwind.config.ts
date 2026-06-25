import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        paper: "#f7f9fc",
        line: "#d8e0ea",
        brand: "#2563eb",
        success: "#0f766e"
      }
    }
  },
  plugins: []
};

export default config;

