import { BusinessDateParams } from "../domain/Interfaces/IBusinessDateService";
import { DateTime } from "luxon";

/**
 * Valida que una cadena esté en formato ISO 8601 con hora y zona (UTC)
 * Ejemplo válido: 2025-10-28T00:00:00.000Z
 *
 * Nota: la función acepta tanto fechas con milisegundos como sin ellos
 * (ej. `2025-10-28T00:00:00Z` o `2025-10-28T00:00:00.000Z`).
 *
 * @param {string | undefined} date - Cadena a validar
 * @throws {object} Error con estructura { status, error, message } si la fecha es inválida
 */
export const validateISODate = (date?: string): void => {
    if (!date) return;

    // Regex que acepta segundos y opcionalmente milisegundos, siempre con 'Z' al final
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/;

    if (!isoRegex.test(date) || !DateTime.fromISO(date, { zone: "utc" }).isValid) {
        throw {
            status: 400,
            error: "InvalidParameters",
            message: "date debe estar en formato ISO 8601 completo con hora y zona (ej: 2025-10-28T00:00:00.000Z)"
        };
    }
};

/**
 * Valida y convierte los parámetros de consulta para el cálculo de fechas hábiles
 * 
 * @param {any} query - Objeto con los parámetros de la consulta
 * @param {string} [query.days] - Días hábiles a añadir
 * @param {string} [query.hours] - Horas hábiles a añadir
 * @param {string} [query.date] - Fecha inicial en formato ISO
 * @returns {BusinessDateParams} Parámetros validados y convertidos
 * @throws {Error} Si los parámetros son inválidos
 */
export const validateBusinessDateParams = (query: Record<string, any>): BusinessDateParams => {
    const days = query.days !== undefined ? Number(query.days) : undefined;
    const hours = query.hours !== undefined ? Number(query.hours) : undefined;
    const date = query.date ? String(query.date) : undefined;

    // Validar que al menos uno esté definido
    if ((days === undefined || isNaN(days)) && (hours === undefined || isNaN(hours))) {
        throw { status: 400, error: "InvalidParameters", message: "Debe enviar days o hours" };
    }

    // Validar valores positivos
    if (days !== undefined && days <= 0) {
        throw { status: 400, error: "InvalidParameters", message: "days debe ser positivo" };
    }
    if (hours !== undefined && hours <= 0) {
        throw { status: 400, error: "InvalidParameters", message: "hours debe ser positivo" };
    }
    // Validar formato de fecha ISO
    validateISODate(date);
    return { days, hours, date };
};