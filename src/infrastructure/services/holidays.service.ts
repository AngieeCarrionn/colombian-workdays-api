import { getHolidays } from "../repositories/holidays.repository";

/**
 * Servicio ligero para consultar si una fecha es festivo nacional.
 *
 * Este módulo expone `isHoliday(dateStr)` que realiza:
 * 1. Carga (o reutiliza) la caché de festivos a través de `getHolidays()`.
 * 2. Comprueba si la fecha (en formato `YYYY-MM-DD`) pertenece al conjunto.
 *
 * Notas de comportamiento:
 * - `getHolidays()` puede lanzar si la petición al proveedor de festivos falla;
 *   en ese caso `isHoliday` propagará la excepción.
 * - La función espera la fecha en formato `YYYY-MM-DD`. Asegúrate de convertir
 *   el `DateTime` o la fecha entrante a ese formato antes de llamar.
 *
 * @param {string} dateStr Fecha en formato `YYYY-MM-DD` a verificar
 * @returns {Promise<boolean>} `true` si la fecha es festivo; `false` en caso contrario
 * @throws {Error} Si no fue posible cargar la lista de festivos desde el repositorio
 */
export const isHoliday = async (dateStr: string): Promise<boolean> => {
  const holidays = await getHolidays();
  return holidays.has(dateStr);
};
