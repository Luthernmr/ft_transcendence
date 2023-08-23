import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { 
	port: import.meta.VITE_FRONTEND_PORT,
	host : false,
},
})
