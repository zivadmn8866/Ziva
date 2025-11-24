import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  root: ".", // project root (inside /frontend)

  build: {
    outDir: "dist",       // Vercel expects this
    emptyOutDir: true,    // clear
