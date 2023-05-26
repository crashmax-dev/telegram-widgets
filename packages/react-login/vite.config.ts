import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'classic' }), dts({ insertTypesEntry: true })],
  build: {
    minify: false,
    sourcemap: true,
    target: 'esnext',
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'TelegramLoginWidget',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ['react'],
      output: {
        exports: 'named',
        globals: {
          react: 'React'
        }
      }
    }
  }
})
