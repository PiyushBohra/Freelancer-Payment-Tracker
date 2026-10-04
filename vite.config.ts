import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// The production build is bundled into a single dist/index.html file,
// so the finished app can be opened by double-clicking it — no server needed.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
});
