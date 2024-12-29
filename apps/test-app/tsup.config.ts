import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/main.ts'],
  sourcemap: true,
  clean: true,
  format: ['cjs']
});
