import { BusinessDateParams } from "../domain/Interfaces/IBusinessDateService";

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
export const validateBusinessDateParams = (query: any): BusinessDateParams => {
    const days = query.days ? Number(query.days) : undefined;
    const hours = query.hours ? Number(query.hours) : undefined;
    const date = query.date ? String(query.date) : undefined;

    if ((days && days < 0) || (hours && hours < 0)) {
        throw { status: 400, error: "InvalidParameters", message: "days y hours deben ser positivos" };
    }

    if (!days && !hours) {
        throw { status: 400, error: "InvalidParameters", message: "Debe enviar days o hours" };
    }
    return { days, hours, date };
};
