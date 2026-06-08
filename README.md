# Cy Inflight Wait

A Cypress plugin that adds `cy.waitForInflight()` — a command that blocks until all in-flight network requests have completed and the network has been idle for a configurable cool-down window.

## When to use this

The right way to synchronize a Cypress test with the network is to wait for something specific: a named `cy.intercept` alias, a particular element becoming visible, or a known API response. That approach is precise, fast, and resilient.

However, there are real situations where that isn't practical:

- **Many concurrent requests with no single completion signal.** A dashboard that fans out a dozen parallel API calls has no one response you can key on. Waiting for the last one by name means hard-coding an implementation detail that changes whenever the page evolves.
- **Third-party or legacy pages you don't control.** You can't instrument a vendor portal or a legacy app to emit a "ready" signal. The page is done when it's done.
- **High variability in request patterns.** Feature flags, A/B tests, and personalization mean the set of requests fired on a given page load differs across users, environments, and test runs. A fixed intercept alias will intermittently pass or fail depending on which variant fires.
- **End-to-end smoke tests over a full user journey.** When the goal is broad coverage rather than surgical assertion, the overhead of naming every request isn't worth it. You need a general "wait for the dust to settle" primitive.

`cy.waitForInflight()` is that primitive. It is not a replacement for targeted waits — it is a fallback for when targeted waits are impractical.

## How it works

Setup registers a `cy.intercept` wildcard (or a pattern you supply) that wraps every matching request. Each request increments an in-flight counter; the corresponding response decrements it. `cy.waitForInflight()` polls that counter every 50 ms and resolves once the counter has been at zero continuously for the cool-down window. A ducking delay at the start gives the browser time to fire initial requests before the poll begins, so the command doesn't resolve prematurely on a zero count that hasn't started yet.

The Cypress Command Log shows a live progress bar and a countdown while the command is waiting, so failures are easy to diagnose.

## Installation

```sh
npm install --save-dev cy-inflightwait
```

## Setup

Call `setupInflightTracker` once in your Cypress support file. It registers the intercept and the `cy.waitForInflight` command.

```ts
// cypress/support/e2e.ts
import { setupInflightTracker } from 'cy-inflightwait';

setupInflightTracker();
```

To track only a subset of requests, pass a URL pattern (anything `cy.intercept` accepts as its first argument):

```ts
setupInflightTracker({ urlPattern: '/api/**' });
```

## Usage

Call `cy.waitForInflight()` anywhere in a test after an action that triggers network traffic.

```ts
// Wait for all requests fired by a page load to settle.
cy.visit('/dashboard');
cy.waitForInflight();
cy.get('[data-cy=chart]').should('be.visible');
```

```ts
// Wait after a user action that triggers background requests.
cy.get('[data-cy=save-button]').click();
cy.waitForInflight();
cy.get('[data-cy=success-toast]').should('be.visible');
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `timeout` | `number` | `30000` | Maximum ms to wait before resolving regardless of in-flight count. |
| `duckingDelay` | `number` | `150` | Initial pause (ms) before polling starts, to let requests begin. |
| `coolDown` | `number` | `500` | Ms the counter must stay at zero before the command resolves. |

```ts
cy.waitForInflight({
  timeout: 10_000,   // give up after 10 s
  coolDown: 1_000,   // require 1 s of silence before resolving
});
```

## Examples

The [`examples/`](./examples) directory contains a self-contained Cypress project that runs the command against GitHub. See [`examples/README.md`](./examples/README.md) for setup and run instructions.
