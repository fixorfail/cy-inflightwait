import { InflightTracker } from './tracker';
import { registerCommand } from './command';

export type { WaitForInflightOptions } from './command';

export interface SetupOptions {
  /**
   * URL pattern passed to cy.intercept to select which requests are tracked.
   * Accepts any value cy.intercept accepts as its first argument.
   * Default: '**' (all requests)
   */
  urlPattern?: string | RegExp;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForInflight(
        options?: import('./command').WaitForInflightOptions,
      ): Chainable<void>;
    }
  }
}

/**
 * Register the inflight request tracker.
 * Call once in your Cypress support file (e.g. cypress/support/e2e.ts).
 *
 * @example
 * import { setupInflightTracker } from 'cy-inflightwait';
 * setupInflightTracker({ urlPattern: '/api/**' });
 *
 * // then in a test:
 * cy.waitForInflight();
 */
export function setupInflightTracker(options: SetupOptions = {}): void {
  const tracker = new InflightTracker();
  const pattern = options.urlPattern ?? '**';

  beforeEach(() => {
    tracker.reset();

    cy.intercept(pattern as string, (req) => {
      tracker.trackRequest();
      req.on('response', () => tracker.untrackRequest());
    });
  });

  registerCommand(tracker);
}
