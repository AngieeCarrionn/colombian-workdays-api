import { IBusinessDateService, BusinessDateParams } from "../Interfaces/IBusinessDateService";
import { BusinessDate } from "../entities/BusinessDate";
import { addBusinessTime } from "../../utils/dateHelpers";

/**
 * Implementación del servicio de cálculo de fechas hábiles
 * @implements {IBusinessDateService}
 */
export class BusinessDateService implements IBusinessDateService {
  /**
   * Calcula una nueva fecha considerando días y horas hábiles en Colombia
   * @param {BusinessDateParams} params - Parámetros para el cálculo
   * @param {number} [params.days] - Días hábiles a añadir o restar
   * @param {number} [params.hours] - Horas hábiles a añadir o restar
   * @param {string} [params.date] - Fecha inicial en formato ISO
   * @returns {Promise<string>} Fecha resultante en formato ISO UTC
   * @throws {Error} Si hay un error en el cálculo o formato de la fecha
   */
  async calculateBusinessDate({ days, hours, date }: BusinessDateParams): Promise<string> {
    const businessDate = new BusinessDate(date);
    const result = await addBusinessTime(businessDate.getDate(), { days, hours });

    const iso = result.setZone("utc").toISO({ suppressMilliseconds: true });
    if (!iso) {
      throw { status: 500, error: "InternalError", message: "No se puede formatear la fecha." };
    }
    return iso;
  }
}
