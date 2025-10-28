import { Request, Response, NextFunction } from "express";
import { BusinessDateService } from "../domain/services/businessDate.service";
import { validateBusinessDateParams } from "../utils/validators";

/**
 * Controlador para el cálculo de fechas hábiles
 * @swagger
 * /api/business-date:
 *   get:
 *     summary: Calcula una fecha hábil
 *     description: Calcula una nueva fecha considerando días y horas hábiles en Colombia
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Fecha inicial en formato ISO
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *         description: Días hábiles a añadir o restar
 *       - in: query
 *         name: hours
 *         schema:
 *           type: number
 *         description: Horas hábiles a añadir o restar
 *     responses:
 *       200:
 *         description: Fecha calculada exitosamente
 *       400:
 *         description: Error en los parámetros proporcionados
 *       500:
 *         description: Error interno del servidor
 */
export const getBusinessDate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { days, hours, date } = validateBusinessDateParams(req.query);
        const service = new BusinessDateService();
        const result = await service.calculateBusinessDate({ days, hours, date });
        res.status(200).json({ date: result });
    } catch (error) {
        next(error);
    }
};
