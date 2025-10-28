/**
 * Parámetros para el cálculo de fechas hábiles
 */
export interface BusinessDateParams {
  /** Número de días hábiles a añadir o restar */
  days?: number;
  /** Número de horas hábiles a añadir o restar */
  hours?: number;
  /** Fecha inicial en formato ISO. Si no se proporciona, se usa la fecha actual */
  date?: string;
}

/**
 * Interfaz para el servicio de cálculo de fechas hábiles
 */
export interface IBusinessDateService {
  /**
   * Calcula una nueva fecha considerando días y horas hábiles
   * @param params - Parámetros para el cálculo
   * @returns Promesa que resuelve a la fecha resultante en formato ISO UTC
   */
  calculateBusinessDate(params: BusinessDateParams): Promise<string>;
}
