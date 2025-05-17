import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  define: {
    global: 'window', // Thêm global để sửa lỗi `global is not defined`
  },
});
