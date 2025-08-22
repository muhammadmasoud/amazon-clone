import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      // This tells Vite: "Any request to /media, forward it to the Django server"
      //NOTE: This is for testing purposes and not very good security wise.
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
