/**
 * @fileoverview Express application setup and configuration.
 * This module initializes the Express application with all necessary middleware,
 * route configurations, and error handling.
 */

import express, { Application } from "express";
import cors from "cors";
import businessDateRouter from "./routes/businessDate.routes";
import { errorHandler } from "./types/errors";

/**
 * Initializes and starts the Express server with all configurations
 * 
 * Sets up:
 * - CORS middleware for cross-origin requests
 * - JSON parsing middleware
 * - Cache control headers for development
 * - API routes
 * - Global error handling
 * 
 * @function startServer
 * @returns {void}
 * 
 * @example
 * // Start the server
 * startServer();
 * // Server will start on PORT from environment variables or default to 3000
 * 
 * @throws {Error} If server fails to start or port is already in use
 */
export const startServer = (): void => {
    const app: Application = express();

    // Enable CORS for all origins
    app.use(cors());

    // Parse incoming JSON payloads
    app.use(express.json());

    // Disable caching in development to ensure correct status codes
    app.use((req, res, next) => {
        res.setHeader("Cache-Control", "no-store");
        next();
    });

    // Mount API routes
    app.use("/api/business-date", businessDateRouter);

    // Global error handling middleware
    app.use(errorHandler);

    // Start server on specified port
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};
