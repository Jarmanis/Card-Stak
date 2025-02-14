import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['77348dac-e223-436e-a868-fb97b4acfb58-00-2swqdgk0l80qr.riker.replit.dev']
  }
})
