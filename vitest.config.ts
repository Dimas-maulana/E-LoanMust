import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/index.ts'
      ]
    },
    setupFiles: ['./src/test-setup.ts'],
    deps: {
      inline: [/@angular/]
    }
  }
});
