/**
 * @fileoverview Define las rutas relacionadas con el cálculo de fechas hábiles.
 * Base path: /api/business-date
 * 
 * Incluye la documentación OpenAPI para el endpoint principal.
 */
import { Router } from "express";
import { getBusinessDate } from "../controllers/businessDate.controller";

/**
 * Router para el cálculo de fechas hábiles.
 * Base path: /api/business-date
 * 
 * @openapi
 * tags:
 *   name: Business Date
 *   description: Endpoints para cálculo de fechas hábiles
 */

const router = Router();

/**
 * @openapi
 * /api/business-date:
 *   get:
 *     summary: Calcula una nueva fecha hábil.
 *     tags: [Business Date]
 *     description: |
 *       Calcula una nueva fecha sumando días y/o horas hábiles a una fecha base,
 *       considerando:
 *       - Horario laboral (8:00 AM - 5:00 PM)
 *       - Hora de almuerzo (12:00 PM - 1:00 PM)
 *       - Fines de semana
 *       - Zona horaria: Colombia (America/Bogota)
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date-time
 *         description: |
 *           Fecha base en formato ISO 8601 con zona UTC
 *           (ej: 2025-10-28T14:30:00Z).
 *           Si no se proporciona, se usa la fecha actual.
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: |
 *           Días hábiles a sumar.
 *           Requerido si no se proporciona hours.
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *           minimum: 0.016667  # 1 minuto
 *         description: |
 *           Horas hábiles a sumar.
 *           Requerido si no se proporciona days.
 *           Acepta decimales (ej: 1.5 = 1h 30min).
 *     responses:
 *       200:
 *         description: Nueva fecha calculada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Nueva fecha en formato ISO 8601 UTC.
 *               example:
 *                 date: "2025-10-28T22:00:00Z"
 *       400:
 *         description: Error en los parámetros.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 error:
 *                   type: string
 *                   example: "InvalidParameters"
 *                 message:
 *                   type: string
 *                   example: "Debe enviar days o hours"
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 error:
 *                   type: string
 *                   example: "InternalError"
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
router.get("/", getBusinessDate);

export default router;
