/**
 * Mock Service Worker Server Setup
 * 
 * This file configures MSW for API mocking in tests.
 * Only include if MSW is installed in the project.
 */

// Note: This is a placeholder for MSW setup
// Uncomment and configure when MSW is added to the project

/*
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup requests interception using the given handlers
export const server = setupServer(...handlers);
*/

// Placeholder export for when MSW is not available
export const server = {
  listen: () => {},
  resetHandlers: () => {},
  close: () => {},
};