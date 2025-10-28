import { DateTime } from "luxon";
import { WORK_START_HOUR, WORK_END_HOUR, LUNCH_START_HOUR, LUNCH_END_HOUR, TIMEZONE } from "../config/constants";
import { isHoliday } from "../infrastructure/services/holidays.service";

/**
 * Parámetros para añadir tiempo hábil a una fecha
 */
interface AddTimeParams {
    /** Número de días hábiles a añadir o restar */
    days?: number;
    /** Número de horas hábiles a añadir o restar */
    hours?: number;
}

/**
 * Añade tiempo hábil a una fecha, considerando:
 * - Horario laboral (8:00 AM - 5:00 PM)
 * - Hora de almuerzo (12:00 PM - 1:00 PM)
 * - Fines de semana
 * - Festivos nacionales
 * 
 * @param {DateTime} date - Fecha inicial
 * @param {AddTimeParams} params - Parámetros de tiempo a añadir
 * @param {number} [params.days=0] - Días hábiles a añadir
 * @param {number} [params.hours=0] - Horas hábiles a añadir
 * @returns {Promise<DateTime>} Nueva fecha con el tiempo hábil añadido
 */
export const addBusinessTime = async (date: DateTime, { days = 0, hours = 0 }: AddTimeParams): Promise<DateTime> => {
    let current = date;

    // TODO: lógica completa de suma de días/horas hábiles
    // - saltar fines de semana y festivos
    // - respetar horario laboral y almuerzo
    // - Si la fecha ingresada esta por fuera del horario de trabajo, aproximar hacia atrás al día laboral más cercano
    // - retornar en formato UTC (ISO 8601)
    // si se envian días y horas sumer primero días y luego horas
    return current;
};
