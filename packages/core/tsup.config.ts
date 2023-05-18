import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['./src/index.ts'],
  dts: true,
  minify: false,
  clean: true,
  sourcemap: true,
  format: ['cjs', 'esm']
})
