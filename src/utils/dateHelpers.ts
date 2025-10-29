/**
 * Módulo de cálculo de fechas hábiles.
 * 
 * Soporta:
 * - Horario laboral configurable (por default 8:00 - 17:00)
 * - Hora de almuerzo (12:00 - 13:00) excluida del cómputo de tiempo hábil
 * - Fines de semana (sábado y domingo)
 * - Días festivos (consulta a isHoliday, opcional según BUSINESS_IGNORE_HOLIDAYS)
 * - Zona horaria: America/Bogota
 */

import { DateTime } from "luxon";
import {
    WORK_START_HOUR,
    WORK_END_HOUR,
    LUNCH_START_HOUR,
    LUNCH_END_HOUR,
    TIMEZONE,
} from "../config/constants";
import { isHoliday } from "../infrastructure/services/holidays.service";

interface AddTimeParams {
    days?: number;
    hours?: number;
}

// Permite ignorar festivos si la variable de entorno está en true
const IGNORE_HOLIDAYS = process.env.BUSINESS_IGNORE_HOLIDAYS === "true";

/**
 * Convierte una fecha a la zona horaria local (America/Bogota)
 * @param date Fecha a convertir
 * @returns DateTime ajustado a zona local
 */
const toLocal = (date: DateTime) => date.setZone(TIMEZONE, { keepLocalTime: false });

/**
 * Determina si una fecha cae en fin de semana
 * @param date Fecha a evaluar (se convierte a zona local)
 * @returns true si es sábado o domingo
 */
const isWeekend = (date: DateTime) => {
    const wd = toLocal(date).weekday;
    return wd === 6 || wd === 7;
};

/**
 * Determina si una fecha es un día no laborable
 * @param date Fecha a evaluar
 * @returns true si es fin de semana o festivo
 * 
 * Nota:
 * - Si IGNORE_HOLIDAYS=true, solo se consideran fines de semana
 * - isHoliday espera formato 'yyyy-MM-dd'
 */
const isNonWorkingDay = async (date: DateTime): Promise<boolean> => {
    const local = toLocal(date);
    if (IGNORE_HOLIDAYS) return isWeekend(local);

    const dateStr = local.toFormat("yyyy-MM-dd");
    return isWeekend(local) || (await isHoliday(dateStr));
};

/**
 * Mueve una fecha al siguiente día hábil, ajustando al inicio de jornada
 * @param date Fecha de referencia
 * @returns DateTime del siguiente día hábil al inicio del horario laboral
 */
const moveToNextWorkDay = async (date: DateTime): Promise<DateTime> => {
    let d = toLocal(date);

    do {
        // Avanzar un día completo y ajustar hora al inicio de jornada
        d = d.plus({ days: 1 }).set({
            hour: WORK_START_HOUR,
            minute: 0,
            second: 0,
            millisecond: 0,
        });
    } while (await isNonWorkingDay(d)); // Repetir hasta encontrar un día hábil

    return d;
};

/**
 * Ajusta la hora de una fecha al rango laboral válido,
 * evitando horas fuera de jornada y bloque de almuerzo
 * @param date Fecha a ajustar
 * @returns DateTime ajustado a horario laboral
 */
const adjustTimeToWorkHours = (date: DateTime): DateTime => {
    let d = toLocal(date);
    const hour = d.hour;

    if (hour < WORK_START_HOUR) {
        // Antes de inicio de jornada → mover al inicio
        return d.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    if (hour >= WORK_END_HOUR) {
        // Después del fin de jornada → mover al fin
        return d.set({ hour: WORK_END_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
        // Durante el almuerzo → mover al inicio del bloque de almuerzo
        return d.set({ hour: LUNCH_START_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    // Mantener hora y minuto, pero resetear segundos y milisegundos
    return d.set({ second: 0, millisecond: 0 });
};

/**
 * Suma días hábiles a una fecha, preservando la hora
 * @param date Fecha de inicio
 * @param days Número de días hábiles a sumar
 * @returns DateTime con los días hábiles sumados
 */
const addBusinessDays = async (date: DateTime, days: number): Promise<DateTime> => {
    let d = toLocal(date);
    let added = 0;

    while (added < days) {
        d = d.plus({ days: 1 }); // Avanzar un día
        while (await isNonWorkingDay(d)) {
            // Saltar días no laborables consecutivos
            d = d.plus({ days: 1 });
        }
        added++;
    }

    // Si cae en día no laboral al final, mover al siguiente hábil
    if (await isNonWorkingDay(d)) d = await moveToNextWorkDay(d);

    return d;
};

/**
 * Suma horas hábiles a una fecha, respetando bloques de almuerzo y fin de jornada
 * @param date Fecha de inicio
 * @param hours Número de horas hábiles a sumar
 * @returns DateTime con las horas hábiles sumadas
 */
const addBusinessHours = async (date: DateTime, hours: number): Promise<DateTime> => {
    let d = toLocal(date);
    let remaining = Math.round(hours * 60); // Convertir a minutos

    while (remaining > 0) {
        if (await isNonWorkingDay(d)) {
            // Si el día no es laborable, saltar al siguiente día hábil
            d = await moveToNextWorkDay(d);
            continue;
        }

        const currentMinutes = d.hour * 60 + d.minute;
        let endBlockMinutes: number;

        if (d.hour < LUNCH_START_HOUR) {
            // Bloque antes del almuerzo
            endBlockMinutes = LUNCH_START_HOUR * 60;
        } else if (d.hour >= LUNCH_START_HOUR && d.hour < LUNCH_END_HOUR) {
            // Durante almuerzo → mover al final del almuerzo
            d = d.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
            continue;
        } else {
            // Bloque después del almuerzo hasta fin de jornada
            endBlockMinutes = WORK_END_HOUR * 60;
        }

        const available = endBlockMinutes - currentMinutes;

        if (remaining <= available) {
            // Si cabe dentro del bloque actual, sumar y terminar
            d = d.plus({ minutes: remaining });
            remaining = 0;
        } else {
            // Si no cabe, llenar el bloque y continuar con el siguiente
            d = d.plus({ minutes: available });
            remaining -= available;

            // Ajustar si se cruza almuerzo o fin de jornada
            if (d.hour === LUNCH_START_HOUR && d.minute === 0) {
                d = d.set({ hour: LUNCH_END_HOUR, minute: 0 });
            }
            if (d.hour === WORK_END_HOUR && d.minute === 0) {
                d = await moveToNextWorkDay(d);
            }
        }
    }

    return d;
};

/**
 * Suma tiempo hábil (días y/o horas) a una fecha, considerando
 * horarios laborales, almuerzo, fines de semana y festivos.
 * @param date Fecha de inicio
 * @param param1 Objeto con days y/o hours a sumar
 * @returns DateTime en UTC con el tiempo hábil sumado
 * @throws Error si no se proporciona days ni hours
 * 
 * @example
 * const result = await addBusinessTime(
 *   DateTime.fromISO("2025-10-28T14:30:00Z"),
 *   { days: 2, hours: 4 }
 * );
 */
export const addBusinessTime = async (
    date: DateTime,
    { days = 0, hours = 0 }: AddTimeParams
): Promise<DateTime> => {
    if (days <= 0 && hours <= 0) throw new Error("Debe enviar days y/o hours");

    // Ajustar a horario laboral
    let d = adjustTimeToWorkHours(toLocal(date));

    // Mover al siguiente día hábil si el día actual no es laborable
    if (await isNonWorkingDay(d)) {
        d = await moveToNextWorkDay(d);
    }

    // Sumar días hábiles
    if (days > 0) d = await addBusinessDays(d, days);

    // Sumar horas hábiles
    if (hours > 0) d = await addBusinessHours(d, hours);

    // Retornar en UTC para consistencia
    return d.toUTC();
};
