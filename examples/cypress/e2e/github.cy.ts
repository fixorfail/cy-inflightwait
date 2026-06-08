// Example: navigate to GitHub and wait for all in-flight requests to settle
// before making assertions. This prevents flaky tests caused by assertions
// running while background XHR/fetch traffic is still in-flight.

describe('GitHub homepage', () => {
  it('loads and settles before asserting', () => {
    cy.visit('/');

    // Wait for every request triggered by the page load to complete and for
    // the network to stay idle for the default 500 ms cool-down window.
    cy.waitForInflight();

    cy.title().should('include', 'GitHub');
    cy.get('header').should('be.visible');
  });

  it('waits after a client-side navigation', () => {
    cy.visit('/');
    cy.waitForInflight();

    // Follow GitHub's Explore link, which may trigger additional XHR traffic.
    cy.contains('a', 'Sign in').first().click();

    // Block until the navigation's network activity drains.
    cy.waitForInflight({ coolDown: 1000 });

    cy.url().should('include', '/login');
  });
});
