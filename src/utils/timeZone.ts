/**
 * @fileoverview Utilidades para manejo de fechas y zonas horarias.
 * Proporciona funciones para convertir entre UTC y hora local de Colombia.
 */
import { DateTime } from "luxon";
import { TIMEZONE } from "../config/constants";
/**
 * Convierte una fecha ISO (en UTC) a hora local de Colombia.
 *
 * @param {string} date - Fecha en formato ISO 8601 (UTC).
 * @returns {DateTime} Objeto `DateTime` en zona horaria de Colombia (`America/Bogota`).
 *
 * @example
 * ```ts
 * const dt = toColombiaTime("2025-10-28T15:00:00Z");
 * console.log(dt.toISO()); // "2025-10-28T10:00:00-05:00"
 * ```
 */
export const toColombiaTime = (date: string): DateTime =>
    DateTime.fromISO(date, { zone: "utc" }).setZone(TIMEZONE);
/**
 * Convierte una fecha en zona horaria local (u otra) a cadena ISO en UTC.
 *
 * @param {DateTime} date - Instancia de Luxon `DateTime` en cualquier zona horaria.
 * @returns {string} Fecha en formato ISO 8601 UTC (sin milisegundos).
 *
 * @example
 * ```ts
 * const dt = DateTime.local(2025, 10, 28, 9, 0);
 * const utc = toUTC(dt);
 * console.log(utc); // "2025-10-28T14:00:00Z"
 * ```
 */
export const toUTC = (date: DateTime): string =>
    // Convertir a UTC y devolver como cadena ISO sin milisegundos
    date.setZone("utc").toISO({ suppressMilliseconds: true }) ?? '';
