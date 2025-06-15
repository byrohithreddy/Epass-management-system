import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
 base: '/Epass-management-system/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
