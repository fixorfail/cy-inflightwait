import type { InflightTracker } from './tracker';
import { formatWaitMessage } from './log';

export interface WaitForInflightOptions {
  /** Maximum time to wait in ms before resolving regardless. Default: 30 000 */
  timeout?: number;
  /** Initial pause to let requests start before checking. Default: 150 */
  duckingDelay?: number;
  /** Idle period after the last request completes before resolving. Default: 500 */
  coolDown?: number;
}

const POLL_INTERVAL_MS = 50;
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_DUCKING_MS = 150;
const DEFAULT_COOLDOWN_MS = 500;

export function registerCommand(tracker: InflightTracker): void {
  Cypress.Commands.add('waitForInflight', (options: WaitForInflightOptions = {}) => {
    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;
    const duckingDelay = options.duckingDelay ?? DEFAULT_DUCKING_MS;
    const coolDown = options.coolDown ?? DEFAULT_COOLDOWN_MS;

    const log = Cypress.log({
      name: 'waitForInflight',
      message: `ducking ${duckingDelay}ms…`,
      autoEnd: false,
    });

    const promise = new Promise<void>((resolve) => {
      setTimeout(() => {
        const startTime = Date.now();

        const tick = (): void => {
          const elapsed = Date.now() - startTime;

          if (elapsed >= timeout) {
            const msg =
              tracker.inflightCount > 0
                ? `timed out — ${tracker.inflightCount} still in-flight`
                : 'timed out (idle)';
            log.set({ message: msg });
            log.end();
            resolve();
            return;
          }

          log.set({ message: formatWaitMessage(tracker.inflightCount, elapsed, timeout) });

          if (tracker.inflightCount === 0) {
            if (tracker.lastCompleteTime === null) {
              log.set({ message: 'done — no requests observed' });
              log.end();
              resolve();
              return;
            }

            if (Date.now() - tracker.lastCompleteTime >= coolDown) {
              log.set({ message: 'done' });
              log.end();
              resolve();
              return;
            }
          }

          setTimeout(tick, POLL_INTERVAL_MS);
        };

        tick();
      }, duckingDelay);
    });

    // cy.wrap turns the native Promise into a Chainable and sets a hard ceiling
    // slightly above our own timeout so Cypress itself never fires first.
    return cy.wrap<Promise<void>, void>(promise, { log: false, timeout: timeout + duckingDelay + 1_000 });
  });
}
