import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Defines process.env.API_KEY globally so the browser code can read it.
    // Falls back to "OFFLINE_MODE" string to prevent "process is not defined" or undefined key errors.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || "OFFLINE_MODE")
  }
})