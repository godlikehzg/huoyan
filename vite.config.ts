import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Defines process.env.API_KEY globally so the browser code can read it
    // It takes the value from the Netlify Environment Variables during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})