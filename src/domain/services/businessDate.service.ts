/**
 * @fileoverview Servicio que implementa la lógica de cálculo de fechas hábiles en Colombia.
 * Utiliza utilidades de tiempo para sumar o restar días y horas hábiles sobre una fecha base.
 */
import { IBusinessDateService, BusinessDateParams } from "../Interfaces/IBusinessDateService";
import { BusinessDate } from "../entities/BusinessDate";
import { addBusinessTime } from "../../utils/dateHelpers";

/**
 * Servicio para el cálculo de fechas hábiles.
 * Implementa la interfaz {@link IBusinessDateService}.
 */
export class BusinessDateService implements IBusinessDateService {
    /**
       * Calcula una nueva fecha considerando días y horas hábiles en Colombia.
       * Usa la clase {@link BusinessDate} y la utilidad {@link addBusinessTime}.
       *
       * @param {BusinessDateParams} params - Parámetros para el cálculo.
       * @param {number} [params.days] - Días hábiles a añadir o restar.
       * @param {number} [params.hours] - Horas hábiles a añadir o restar.
       * @param {string} [params.date] - Fecha inicial en formato ISO.
       * @returns {Promise<string>} Fecha resultante en formato ISO UTC.
       * @throws {Error} Si ocurre un error durante el cálculo o el formato de la fecha.
       *
       * @example
       * ```ts
       * const service = new BusinessDateService();
       * const result = await service.calculateBusinessDate({ date: "2025-10-29T12:00:00Z", days: 2 });
       * console.log(result); // → "2025-10-31T12:00:00Z"
       * ```
       */
    async calculateBusinessDate({ days, hours, date }: BusinessDateParams): Promise<string> {
        // Crear una instancia de BusinessDate a partir de la fecha recibida (o la actual si no se pasa ninguna)
        const businessDate = new BusinessDate(date);
        // Calcular la nueva fecha sumando o restando días/horas hábiles
        const result = await addBusinessTime(businessDate.getDate(), { days, hours });
        // Convertir el resultado a formato ISO UTC sin milisegundos
        const iso = result.setZone("utc").toISO({ suppressMilliseconds: true });
        // Validar que la conversión haya sido exitosa
        if (!iso) {
            throw { status: 500, error: "InternalError", message: "No se puede formatear la fecha." };
        }
        return iso;
    }
}
