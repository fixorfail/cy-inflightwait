import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://github.com',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
  },
});
