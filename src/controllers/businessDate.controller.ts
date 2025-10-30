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
        // 1Validación de parámetros de entrada (days, hours, date)
        //    - Verifica que los valores sean válidos (números positivos, formato correcto)
        //    - Si falta alguno o es inválido, lanza un error con código 400
        const { days, hours, date } = validateBusinessDateParams(req.query);
        // 2Se crea una instancia del servicio de negocio encargado del cálculo
        //    Este servicio contiene toda la lógica para sumar horas y días hábiles
        //    considerando fines de semana, festivos y horario laboral colombiano.
        const service = new BusinessDateService();
        // 3️Se calcula la fecha hábil resultante usando los parámetros validados
        //    El servicio devuelve la fecha final en formato UTC (ISO 8601)
        const result = await service.calculateBusinessDate({ days, hours, date });

        // 4️Respuesta exitosa (HTTP 200)
        //    Se devuelve un JSON con la clave "date" (sin campos extra),
        //    cumpliendo con el contrato definido por la prueba técnica.
        res.status(200).json({ date: result });
    } catch (error) {
        // 5️Manejo de errores centralizado
        //    Si ocurre un error en validación o lógica, se pasa al middleware `errorHandler`
        next(error);
    }
};
