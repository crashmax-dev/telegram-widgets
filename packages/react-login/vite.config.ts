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
      entry: [
        resolve(__dirname, 'src/index.tsx'),
        resolve(__dirname, 'src/middleware.ts')
      ],
      name: 'TelegramLoginWidget',
      formats: ['es', 'cjs'],
      fileName: (format, name) => `${name}.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'next',
        'node:crypto'
      ],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          next: 'next',
          crypto: 'crypto'
        }
      }
    }
  }
})
