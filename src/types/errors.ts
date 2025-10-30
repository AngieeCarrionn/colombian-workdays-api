/**
 * Definiciones de gestión de errores y middleware para la API
 * Proporciona un manejo y formato de errores consistente en toda la aplicación
 */

import { Request, Response, NextFunction } from "express";

/**
 * Interface representando una estructura de error de API
 * @interface ApiError
 * 
 * @property {number} [status] - Código de estado HTTP para el error.
 *                              Defaults to 500 if not provided.
 * @property {string} [error] - Identificador de tipo de error.
 *                             Defaults to "InternalError" if not provided.
 * @property {string} [message] - Mensaje de error legible por humanos.
 *                               Defaults to "Error interno del servidor" if not provided.
 */
interface ApiError {
    status?: number;
    error?: string;
    message?: string;
}

/**
 * Middleware global para el manejo de errores para Express
 * Procesa los errores y los devuelve en un formato consistente
 *
 * @param {ApiError} err - El objeto de error a procesar
 * @param {Request} _req - Objeto de solicitud de Express (no utilizado)
 * @param {Response} res - Objeto de respuesta de Express
 * @param {NextFunction} _next - Express next function (unused)
 * 
 * @returns {void} Sends JSON response with error details
 * 
 * @example
 * // Error thrown somewhere in the application
 * throw { status: 400, error: "InvalidParameters", message: "Formato de fecha no válido" };
 * 
 * // Error handler will respond with:
 * // Status: 400
 * // Body: { "error": "InvalidParameters", "message": "Formato de fecha no válido" }
 */
export const errorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err.status || 500;
  const error = err.error || "InternalError";
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    error,
    message,
  });
};