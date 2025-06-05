import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./",
  css: {
    postcss: "./postcss.config.js"
  },
  server: {
    watch: {
      usePolling: true, // ✅ thêm dòng này
    }
  }
});
