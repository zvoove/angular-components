import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['dist/components/schematics/**/*.spec.js'],
    globals: true,
  },
});
