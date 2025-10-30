import { TIMEZONE } from "../config/constants";
import { BusinessDateParams } from "../domain/Interfaces/IBusinessDateService";
import { DateTime } from "luxon";
import { BusinessDateRequestDTO } from "../types/businessDate.types";
/**
 * Utilidades de validación para la API de fechas hábiles.
 *
 * Contiene:
 * - validateISODate: valida que la cadena tenga formato ISO 8601 con hora y zona (UTC)
 * - validateBusinessDateParams: valida y normaliza los parámetros de consulta usados por
 *   el endpoint `/api/business-date`.
 */

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
 * Convierte/valida estrictamente un entero positivo.
 * Acepta:
 *   - string con SOLO dígitos (p. ej., "3", "0003")
 *   - number entero > 0
 */
const parseStrictPositiveInt = (
    raw: unknown,
    key: "days" | "hours"
): number | undefined => {
    // Si no vino el parámetro, no forzar error aquí
    if (raw === undefined || raw === null) return undefined;

    // Explícitamente NO aceptamos arrays u otros tipos que no sean string/number
    if (Array.isArray(raw)) {
        throw { status: 400, error: "InvalidParameters", message: `${key} debe ser un entero positivo` };
    }
    if (typeof raw === "number") {
        if (!Number.isInteger(raw) || raw <= 0 || !Number.isSafeInteger(raw)) {
            throw { status: 400, error: "InvalidParameters", message: `${key} debe ser un entero positivo` };
        }
        return raw;
    }

    if (typeof raw === "string") {
        // Ultra-estricto: SIN trim. Debe ser dígitos puros (nada de espacios, +, decimales, exponentes).
        if (!/^[0-9]+$/.test(raw)) {
            throw { status: 400, error: "InvalidParameters", message: `${key} debe ser un entero positivo` };
        }
        const n = Number(raw); // seguro porque solo hay dígitos
        if (!Number.isSafeInteger(n) || n <= 0) {
            throw { status: 400, error: "InvalidParameters", message: `${key} debe ser un entero positivo` };
        }
        return n;
    }

    // Cualquier otro tipo queda rechazado
    throw { status: 400, error: "InvalidParameters", message: `${key} debe ser un entero positivo` };
};
/**
 * Valida y convierte los parámetros de consulta para el cálculo de fechas hábiles
 * 
 * @param {Partial<BusinessDateRequestDTO>} query - Objeto con los parámetros de la consulta
 * @param {number} [query.days] - Días hábiles a añadir (debe ser positivo)
 * @param {number} [query.hours] - Horas hábiles a añadir (debe ser positivo)
 * @param {string} [query.date] - Fecha inicial en formato ISO UTC (ej: 2025-10-28T00:00:00Z)
 * @returns {BusinessDateParams} Parámetros validados y convertidos con fecha en UTC
 * @throws {Error} Si los parámetros son inválidos o no se proporciona ni days ni hours
 */
export const validateBusinessDateParams = (query: Partial<BusinessDateRequestDTO>): BusinessDateParams => {
    // Valida/convierte estrictamente
    const days = parseStrictPositiveInt(query.days as unknown, "days");
    const hours = parseStrictPositiveInt(query.hours as unknown, "hours");
    // Validar que al menos uno esté definido y sea numérico
    if ((days === undefined || isNaN(days)) && (hours === undefined || isNaN(hours))) {
        throw { status: 400, error: "InvalidParameters", message: "Debe enviar days o hours" };
    }

    // Validar valores positivos (si se proporcionan)
    if (days !== undefined && days <= 0) {
        throw { status: 400, error: "InvalidParameters", message: "days debe ser positivo" };
    }
    if (hours !== undefined && hours <= 0) {
        throw { status: 400, error: "InvalidParameters", message: "hours debe ser positivo" };
    }

    // Determinar la fecha: si viene en la query se valida su formato ISO. Si no, se devuelve
    // la fecha actual en la zona horaria de Colombia convertida a UTC en formato ISO.
    let date: string;
    if (query.date) {
        date = String(query.date);
        // Validar formato de fecha ISO si viene
        validateISODate(date);
    } else {
        // Si no viene, tomar fecha actual en Colombia y convertir a ISO UTC sin milisegundos
        date = DateTime.now().setZone(TIMEZONE).toUTC().toISO({ suppressMilliseconds: true })!;
    }

    return { days, hours, date };
};