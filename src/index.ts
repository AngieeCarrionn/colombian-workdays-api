/**
 * @fileoverview Application entry point for the Colombian Workdays API
 * 
 * This is the main entry point for the application. It imports and starts
 * the Express server configured in the app module. The server handles:
 * - Business date calculations
 * - Colombian holiday validations
 * - Timezone-aware operations
 * 
 * Environment variables:
 * - PORT: Server port (defaults to 3000)
 * 
 * @see {@link startServer}
 */

import { startServer } from "./app";

// Initialize and start the Express server
startServer();
