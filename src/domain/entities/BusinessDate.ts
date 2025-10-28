import { DateTime } from "luxon";
import { TIMEZONE } from "../../config/constants";

/**
 * Clase que representa una fecha en el contexto de días hábiles
 */
export class BusinessDate {
  /** Fecha interna en zona horaria de Colombia */
  private date: DateTime;

  /**
   * Crea una nueva instancia de BusinessDate
   * @param {string} [date] - Fecha inicial en formato ISO. Si no se proporciona, usa la fecha actual
   */
  constructor(date?: string) {
    this.date = date
      ? DateTime.fromISO(date, { zone: "utc" }).setZone(TIMEZONE)
      : DateTime.now().setZone(TIMEZONE);
  }

  /**
   * Obtiene la fecha en formato DateTime de Luxon
   * @returns {DateTime} Fecha en zona horaria de Colombia
   */
  getDate(): DateTime {
    return this.date;
  }

  /**
   * Convierte la fecha a formato ISO en UTC
   * @returns {string} Fecha en formato ISO UTC sin milisegundos
   */
  toUTCString(): string {
    return this.date.setZone("utc").toISO({ suppressMilliseconds: true }) ?? '';
  }
}
