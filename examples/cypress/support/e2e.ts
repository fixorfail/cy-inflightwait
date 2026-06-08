import { setupInflightTracker } from 'cy-inflightwait';

// Track all requests. Narrow the pattern to e.g. '/api/**' if you only care
// about a subset of network activity.
setupInflightTracker({ urlPattern: '**' });
