/**
 * Constantes de configuración del cálculo de fechas hábiles.
 * 
 * Horario laboral:
 * - Inicio: 8:00 AM (`WORK_START_HOUR`)
 * - Almuerzo: 12:00 PM - 1:00 PM (`LUNCH_START_HOUR` - `LUNCH_END_HOUR`)
 * - Fin: 5:00 PM (`WORK_END_HOUR`)
 * 
 * Validaciones implícitas:
 * - `WORK_START_HOUR` < `LUNCH_START_HOUR` < `LUNCH_END_HOUR` < `WORK_END_HOUR`
 * - Todas las horas están en formato 24h (0-23)
 * - El almuerzo cuenta como tiempo no hábil
 * 
 * Nota: Las fechas se manejan en zona `America/Bogota` y se convierten a UTC
 * al retornarlas al cliente.
 */

/** 
 * Hora de inicio de la jornada laboral (8:00 AM)
 * @type {number} Hora en formato 24h (0-23)
 */
export const WORK_START_HOUR = 8;

/** 
 * Hora de inicio del almuerzo (12:00 PM)
 * @type {number} Hora en formato 24h (0-23)
 * @remarks Debe ser mayor que `WORK_START_HOUR`
 */
export const LUNCH_START_HOUR = 12;

/** 
 * Hora de fin del almuerzo (1:00 PM)
 * @type {number} Hora en formato 24h (0-23)
 * @remarks Debe ser mayor que `LUNCH_START_HOUR`
 */
export const LUNCH_END_HOUR = 13;

/** 
 * Hora de fin de la jornada laboral (5:00 PM)
 * @type {number} Hora en formato 24h (0-23)
 * @remarks Debe ser mayor que `LUNCH_END_HOUR`
 */
export const WORK_END_HOUR = 17;

/** 
 * Zona horaria base para todos los cálculos
 * @type {string} Identificador IANA de zona horaria
 * @example "America/Bogota"
 */
export const TIMEZONE = "America/Bogota";

/** 
 * URL del endpoint que provee los días festivos
 * @type {string} URL HTTPS válida
 * @remarks El endpoint debe retornar un array de objetos con propiedad `date` en formato ISO
 * @example
 * [
 *   { "date": "2025-01-01" },
 *   { "date": "2025-05-01" }
 * ]
 */
export const HOLIDAYS_URL = "https://content.capta.co/Recruitment/WorkingDays.json";
