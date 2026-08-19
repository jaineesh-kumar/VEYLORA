import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add these optimizations
  server: {
    hmr: true,
    watch: {
      usePolling: false
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tabler/icons-react']
  }
})