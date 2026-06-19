/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

/** Vite config for local dev and GitHub Pages production builds. */
export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    passWithNoTests: true,
  },
});
