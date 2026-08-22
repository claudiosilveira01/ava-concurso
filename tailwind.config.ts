import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        disciplina: {
          portugues: "#3B82F6",
          raciocinio_logico: "#8B5CF6",
          direito_administrativo: "#10B981",
          direito_constitucional: "#EF4444",
          informatica: "#F59E0B",
          direito_previdenciario: "#EC4899",
          administracao_publica: "#06B6D4",
          legislacao: "#F97316",
          direito_penal: "#6366F1",
          processo_penal: "#FB7185",
          etica: "#14B8A6",
          arquivologia: "#64748B",
          redacao: "#84CC16",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
