
/**
 * @fileoverview Punto de entrada de la aplicación para la API de Workdays Colombia
 * 
 * Supports both:
 * - Ejecución local (via Express server)
 * - Despliegue en AWS Lambda (via serverless-http)
 */
import { app, startServer } from "./app";
import serverless from "serverless-http";
// Controlador de exportación para AWS Lambda
export const handler = serverless(app);
// Si se ejecuta localmente (no en AWS Lambda), inicie Express normalmente.
if (process.env.AWS_EXECUTION_ENV === undefined) {
    startServer();
}