# cy-inflightwait examples

A self-contained Cypress project demonstrating `cy.waitForInflight()` against GitHub.

## Prerequisites

- Node.js 18+
- A browser supported by Cypress (Chrome, Firefox, or Electron)

## Setup

From the `examples/` directory:

```sh
npm install
```

This installs Cypress and resolves `cy-inflightwait` from the parent directory via the `file:..` dependency. Build the plugin first if you haven't already:

```sh
cd .. && npm run build && cd examples
```

## Running the examples

**Interactive (Cypress App):**

```sh
npm run cy:open
```

Opens the Cypress Test Runner. Select **E2E Testing**, choose a browser, then click `github.cy.ts` to run the tests.

**Headless:**

```sh
npm run cy:run
```

Runs all specs in the terminal and exits with a non-zero code on failure.

## What the examples cover

| File | What it demonstrates |
|------|----------------------|
| `cypress/support/e2e.ts` | Registering `setupInflightTracker` once in the support file |
| `cypress/e2e/github.cy.ts` | Waiting after initial page load; waiting after a client-side navigation with a longer `coolDown` |
