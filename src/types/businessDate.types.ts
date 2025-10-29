/**
 * Objeto de transferencia de datos para solicitudes de cálculo de fechas comerciales.
 * Representa los parámetros de entrada para calcular fechas comerciales.
 * @interface BusinessDateRequestDTO
 * 
 * @property {number} [days] - Número de días hábiles a añadir/restar.
 *                            Valores positivos añaden días, valores negativos restan días.
 * @property {number} [hours] - Número de horas hábiles a añadir/restar.
 *                             Valores positivos añaden horas, valores negativos restan horas.
 * @property {string} [date] - Fecha base para el cálculo en formato ISO 8601 UTC con sufijo Z.
 *                            Si no se proporciona, se utilizará la fecha y hora actuales.
 *                            Ejemplo: "2025-10-29T14:30:00Z"
 */
export interface BusinessDateRequestDTO {
    days?: number;
    hours?: number;
    date?: string; // ISO 8601 UTC with Z
}

/**
 * Objeto de transferencia de datos para las respuestas de cálculo de fechas comerciales.
 * Representa el resultado de un cálculo de fecha comercial.
 * @interface BusinessDateResponseDTO
 * 
 * @property {string} date - Fecha resultante en formato ISO 8601 UTC con sufijo Z.
 *                          Ejemplo: "2025-10-29T14:30:00Z"
 */
export interface BusinessDateResponseDTO {
    date: string; // ISO 8601 UTC with Z
}