/**
 * Módulo de cálculo de fechas hábiles con soporte para:
 * - Horario laboral: 8:00 AM - 5:00 PM (configurable en constants.ts)
 * - Hora de almuerzo: 12:00 PM - 1:00 PM (no cuenta como tiempo hábil)
 * - Fines de semana: sábado y domingo no son hábiles
 * - Zona horaria: todas las operaciones se realizan en America/Bogota
 * 
 * Comportamiento general:
 * 1. Las fechas se normalizan a zona horaria local (America/Bogota)
 * 2. Si la fecha cae fuera de horario laboral, se ajusta al último momento hábil anterior
 * 3. Se aplican los días hábiles primero (si hay)
 * 4. Se aplican las horas hábiles después (si hay)
 * 5. El resultado se convierte a UTC antes de retornarlo
 * 
 * @example
 * // Sumar 2 días y 4 horas hábiles a una fecha
 * const result = await addBusinessTime(
 *   DateTime.fromISO("2025-10-28T14:30:00Z"),
 *   { days: 2, hours: 4 }
 * );
 * 
 * // Ajustar una fecha fuera de horario al último momento hábil
 * const adjusted = adjustBackwardToWorkTime(
 *   DateTime.fromISO("2025-10-28T23:00:00Z")
 * ); // → 2025-10-28T17:00:00
 */
import { DateTime } from "luxon";
import {
    WORK_START_HOUR,
    WORK_END_HOUR,
    LUNCH_START_HOUR,
    LUNCH_END_HOUR,
    TIMEZONE,
} from "../config/constants";

/**
 * Parámetros para añadir tiempo hábil
 */
interface AddTimeParams {
    /** Días hábiles a añadir (entero ≥ 0) */
    days?: number;
    /** Horas hábiles a añadir (número ≥ 0, acepta decimales) */
    hours?: number;
}

/**
 * Convierte una fecha UTC a la zona horaria local (America/Bogota)
 * @param date Fecha en cualquier zona
 * @returns La misma fecha en zona America/Bogota
 */
const toLocal = (date: DateTime): DateTime =>
    date.setZone(TIMEZONE, { keepLocalTime: false });

/**
 * Determina si una fecha cae en fin de semana
 * @param date Fecha a evaluar (se convertirá a local si es necesario)
 * @returns true si es sábado (6) o domingo (7)
 */
const isWeekend = (date: DateTime): boolean => {
    const local = toLocal(date);
    return local.weekday === 6 || local.weekday === 7; // sábado o domingo
};

/**
 * Mueve una fecha al siguiente día hábil manteniendo la hora del día
 * @example
 * // Sábado 10:30 → Lunes 10:30
 * moveToNextWorkDayKeepingTime(DateTime.fromISO("2025-10-25T10:30:00Z"))
 * 
 * @param date Fecha a mover (se convierte a local)
 * @returns Nueva fecha en el siguiente día hábil con la misma hora
 */
const moveToNextWorkDayKeepingTime = (date: DateTime): DateTime => {
    let local = toLocal(date);
    while (isWeekend(local)) {
        local = local.plus({ days: 1 });
    }
    return local.set({
        hour: date.hour,
        minute: date.minute,
        second: 0,
        millisecond: 0,
    });
};

/**
 * Calcula el inicio (8:00 AM) del siguiente día hábil
 * @example
 * // Viernes 17:00 → Lunes 8:00
 * nextWorkDayStart(DateTime.fromISO("2025-10-24T17:00:00Z"))
 * 
 * @param date Fecha base
 * @returns Siguiente día hábil a las 8:00 AM
 */
const nextWorkDayStart = (date: DateTime): DateTime => {
    let local = toLocal(date).plus({ days: 1 }).set({
        hour: WORK_START_HOUR,
        minute: 0,
        second: 0,
        millisecond: 0,
    });

    while (isWeekend(local)) {
        local = local.plus({ days: 1 });
    }
    return local;
};

/**
 * Ajusta una fecha hacia atrás al último momento hábil válido
 * 
 * Casos especiales:
 * - Fin de semana → viernes 5:00 PM
 * - Después de 5:00 PM → mismo día 5:00 PM
 * - Durante almuerzo (12-1) → 12:00 PM
 * - Antes de 8:00 AM → día anterior 5:00 PM
 * 
 * @example
 * // Sábado 10:00 → Viernes 17:00
 * adjustBackwardToWorkTime(DateTime.fromISO("2025-10-25T10:00:00Z"))
 * 
 * // 23:00 → 17:00 mismo día
 * adjustBackwardToWorkTime(DateTime.fromISO("2025-10-24T23:00:00Z"))
 * 
 * // 12:30 (almuerzo) → 12:00
 * adjustBackwardToWorkTime(DateTime.fromISO("2025-10-24T12:30:00Z"))
 * 
 * @param date Fecha a ajustar
 * @returns Última fecha hábil válida
 */
const adjustBackwardToWorkTime = (date: DateTime): DateTime => {
    let local = toLocal(date);

    while (isWeekend(local)) {
        local = local.minus({ days: 1 }).set({
            hour: WORK_END_HOUR,
            minute: 0,
            second: 0,
            millisecond: 0,
        });
    }

    const hour = local.hour;

    if (hour >= WORK_END_HOUR) {
        // después de la jornada → 17:00
        return local.set({ hour: WORK_END_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
        // durante almuerzo → 12:00
        return local.set({ hour: LUNCH_START_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    if (hour < WORK_START_HOUR) {
        // antes de 8:00 → día anterior hábil 17:00
        let prev = local.minus({ days: 1 });
        while (isWeekend(prev)) {
            prev = prev.minus({ days: 1 });
        }
        return prev.set({ hour: WORK_END_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    return local;
};

/**
 * Suma N días hábiles a una fecha manteniendo la hora del día
 * - Si la fecha inicial cae en fin de semana, se mueve al siguiente día hábil
 * - Salta fines de semana al contar días
 * - Preserva la hora del día (si empieza 14:30, termina 14:30)
 * 
 * @example
 * // Viernes 14:30 + 2 días → Martes 14:30
 * addBusinessDaysKeepingTime(
 *   DateTime.fromISO("2025-10-24T14:30:00Z"),
 *   2
 * )
 * 
 * @param date Fecha inicial
 * @param days Días hábiles a sumar (entero positivo)
 * @returns Nueva fecha con los días hábiles sumados
 */
const addBusinessDaysKeepingTime = (date: DateTime, days: number): DateTime => {
    let newDate = toLocal(date);
    if (isWeekend(newDate)) {
        newDate = moveToNextWorkDayKeepingTime(newDate);
    }

    let added = 0;
    while (added < days) {
        newDate = newDate.plus({ days: 1 });
        while (isWeekend(newDate)) {
            newDate = newDate.plus({ days: 1 });
        }
        added++;
    }
    return newDate;
};

/** Calcula minutos laborales disponibles en el día actual */
const availableWorkingMinutesToday = (local: DateTime): number => {
    if (local.hour < WORK_START_HOUR) {
        // Día completo disponible (8–12 y 13–17)
        return (LUNCH_START_HOUR - WORK_START_HOUR) * 60 + (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
    }

    if (local.hour >= LUNCH_START_HOUR && local.hour < LUNCH_END_HOUR) {
        // en almuerzo → queda solo la tarde
        return (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
    }

    if (local.hour >= WORK_END_HOUR) return 0;

    if (local.hour < LUNCH_START_HOUR) {
        const minutesToLunch = (LUNCH_START_HOUR - local.hour) * 60 - local.minute;
        const afternoon = (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
        return Math.max(0, minutesToLunch) + afternoon;
    }

    // en la tarde
    const minutesToEnd = (WORK_END_HOUR - local.hour) * 60 - local.minute;
    return Math.max(0, minutesToEnd);
};

/**
 * Añade horas hábiles a una fecha respetando horario laboral y almuerzo.
 * 
 * Comportamiento:
 * 1. Ajusta la fecha inicial al último momento hábil válido
 * 2. Si hay que cruzar el almuerzo, lo salta automáticamente
 * 3. Si no hay suficientes horas en el día, continúa el siguiente día hábil
 * 
 * Notas:
 * - El tiempo se convierte a minutos internamente para mayor precisión
 * - Soporta horas decimales (ej: 1.5 horas = 1h 30min)
 * - Hora de almuerzo (12-1) no cuenta como tiempo hábil
 * 
 * @example
 * // 11:00 + 2h (cruza almuerzo) → 14:00
 * addBusinessHours(
 *   DateTime.fromISO("2025-10-24T11:00:00Z"),
 *   2
 * )
 * 
 * // 16:00 + 3h (cruza día) → siguiente día 10:00
 * addBusinessHours(
 *   DateTime.fromISO("2025-10-24T16:00:00Z"),
 *   3
 * )
 * 
 * @param date Fecha inicial
 * @param hours Horas hábiles a sumar (número positivo, acepta decimales)
 * @returns Nueva fecha con las horas sumadas
 */
const addBusinessHours = (date: DateTime, hours: number): DateTime => {
    let remaining = Math.round(hours * 60);
    let local = toLocal(date);

    local = adjustBackwardToWorkTime(local);

    while (remaining > 0) {
        if (isWeekend(local)) {
            local = nextWorkDayStart(local);
            continue;
        }

        const available = availableWorkingMinutesToday(local);
        if (available <= 0) {
            local = nextWorkDayStart(local);
            continue;
        }

        if (remaining <= available) {
            if (local.hour < LUNCH_START_HOUR) {
                const toLunch = (LUNCH_START_HOUR - local.hour) * 60 - local.minute;
                if (remaining <= toLunch) {
                    local = local.plus({ minutes: remaining });
                    remaining = 0;
                    break;
                }
                remaining -= toLunch;
                local = local.set({ hour: LUNCH_END_HOUR, minute: 0 });
                local = local.plus({ minutes: remaining });
                remaining = 0;
                break;
            }

            if (local.hour >= LUNCH_START_HOUR && local.hour < LUNCH_END_HOUR) {
                local = local.set({ hour: LUNCH_END_HOUR, minute: 0 });
                local = local.plus({ minutes: remaining });
                remaining = 0;
                break;
            }

            local = local.plus({ minutes: remaining });
            remaining = 0;
            break;
        } else {
            remaining -= available;
            local = nextWorkDayStart(local);
        }
    }

    return local;
};

/**
 * Suma días y/o horas hábiles a una fecha.
 * 
 * Flujo de trabajo:
 * 1. Normaliza la fecha a zona horaria local (America/Bogota)
 * 2. Ajusta la fecha al último momento hábil válido si es necesario
 * 3. Suma los días hábiles (si days > 0)
 * 4. Suma las horas hábiles (si hours > 0)
 * 5. Convierte el resultado a UTC
 * 
 * Casos especiales:
 * - Si la fecha inicial está fuera de horario, se ajusta hacia atrás
 * - Los fines de semana se saltan al contar días
 * - La hora de almuerzo (12-1) no cuenta como tiempo hábil
 * - Si al sumar horas se cruza el almuerzo, se salta automáticamente
 * 
 * @example
 * // Viernes 14:30 + 2 días y 4 horas
 * const result = await addBusinessTime(
 *   DateTime.fromISO("2025-10-24T14:30:00Z"),
 *   { days: 2, hours: 4 }
 * );
 * // → Martes siguiente 11:30 UTC
 * 
 * @param date Fecha inicial (cualquier zona horaria)
 * @param params Días y/u horas hábiles a sumar
 * @returns Promesa con la nueva fecha en UTC
 */
export const addBusinessTime = async (
    date: DateTime,
    { days = 0, hours = 0 }: AddTimeParams
): Promise<DateTime> => {
    let local = toLocal(date);

    local = adjustBackwardToWorkTime(local);

    if (days > 0) {
        local = addBusinessDaysKeepingTime(local, days);
    }

    if (hours > 0) {
        local = addBusinessHours(local, hours);
    }

    return local.toUTC();
};

export type { AddTimeParams };
