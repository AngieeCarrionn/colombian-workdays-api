import { HOLIDAYS_URL } from "../../config/constants";

/**
 * Caché en memoria de los días festivos. Almacena fechas en formato `YYYY-MM-DD`.
 * - Inicialmente es `null` y se carga la primera vez que se llama a `getHolidays()`.
 * - Actualmente no tiene expiración (TTL). Si se requiere refrescar, agregar una
 *   función para invalidar la caché o implementar TTL.
 */
let holidaysCache: Set<string> | null = null;

/**
 * Obtiene el conjunto de festivos nacionales.
 *
 * Flujo:
 * 1. Si existe `holidaysCache`, devuelve la caché inmediatamente.
 * 2. Si no, realiza una petición `fetch` a `HOLIDAYS_URL`, transforma la respuesta
 *    en un `Set<string>` con las fechas (campo `date`) y lo almacena en caché.
 *
 * Notas:
 * - El endpoint externo debe devolver un array de objetos con la propiedad `date`.
 * - Si la petición falla (response.ok === false) se lanza un `Error` genérico.
 * - La función es asíncrona porque realiza una llamada de red.
 *
 * @returns {Promise<Set<string>>} Conjunto de fechas festivas en formato `YYYY-MM-DD`
 * @throws {Error} Si no fue posible cargar los festivos desde `HOLIDAYS_URL`
 */
export const getHolidays = async (): Promise<Set<string>> => {
    if (holidaysCache) return holidaysCache;

    const response = await fetch(HOLIDAYS_URL);
    if (!response.ok) throw new Error("No se pudieron cargar los festivos");

    const data = await response.json();
    const normalized = data.map((d: any) => (typeof d === "string" ? d : d.date));
    holidaysCache = new Set(normalized);
    return holidaysCache;
};
