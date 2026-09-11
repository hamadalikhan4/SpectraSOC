import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/SpectraSOC/",

  plugins: [react()],

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-is",
      "prop-types",
      "react-simple-maps",
    ],
  },
});