import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ insertTypesEntry: true })],
  build: {
    minify: false,
    sourcemap: true,
    target: 'esnext',
    lib: {
      name: 'core',
      entry: [
        'src/index.ts',
        'src/client.ts',
        'src/server.ts'
      ]
    },
    rollupOptions: {
      external: ['node:crypto']
    }
  }
})
