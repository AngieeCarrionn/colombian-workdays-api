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

/** Comprueba si la fecha (instante) cae en fin de semana según la zona configurada */
const isWeekend = (date: DateTime): boolean => {
    const local = date.setZone(TIMEZONE);
    return local.weekday === 6 || local.weekday === 7; // 6 = sábado, 7 = domingo
};

/** Comprueba si la fecha (instante) es festivo en Colombia (según YYYY-MM-DD) */
const isHolidayLocal = async (date: DateTime): Promise<boolean> => {
    const local = date.setZone(TIMEZONE);
    const isoDate = local.toISODate();
    if (!isoDate) return false;
    return await isHoliday(isoDate);
};

/** Mueve al siguiente día hábil (avanzando) y devuelve la fecha manteniendo la hora pasada si es posible */
const moveToNextWorkDayKeepingTime = async (date: DateTime): Promise<DateTime> => {
    let newDate = date;
    while (isWeekend(newDate) || (await isHolidayLocal(newDate))) {
        newDate = newDate.plus({ days: 1 });
    }
    return newDate.set({ hour: date.hour, minute: date.minute, second: 0, millisecond: 0 });
};

/** Mueve al siguiente día hábil y fija la hora al inicio laboral */
const moveToNextWorkDayAtStart = async (date: DateTime): Promise<DateTime> => {
    let newDate = date;
    while (isWeekend(newDate) || (await isHolidayLocal(newDate))) {
        newDate = newDate.plus({ days: 1 });
    }
    return newDate.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
};

/** Ajusta la fecha hacia adelante al próximo instante válido dentro del horario laboral */
const adjustForwardToWorkTime = async (date: DateTime): Promise<DateTime> => {
    let local = date.setZone(TIMEZONE, { keepLocalTime: false });

    // Fin de semana o festivo → siguiente día hábil a las 08:00
    if (isWeekend(local) || (await isHolidayLocal(local))) {
        return await moveToNextWorkDayAtStart(local);
    }

    const hour = local.hour;

    // Antes del inicio laboral → mismo día a WORK_START_HOUR
    if (hour < WORK_START_HOUR) {
        return local.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    // Durante almuerzo → mover al final del almuerzo
    if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
        return local.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
    }

    // Después del cierre → siguiente día hábil a WORK_START_HOUR
    if (hour >= WORK_END_HOUR) {
        return await moveToNextWorkDayAtStart(local.plus({ days: 1 }));
    }

    // Ya dentro del horario laboral válido
    return local;
};

/** Suma N días hábiles preservando la hora del día */
const addBusinessDaysKeepingTime = async (date: DateTime, days: number): Promise<DateTime> => {
    let newDate = date;
    let added = 0;
    while (added < days) {
        newDate = newDate.plus({ days: 1 });
        while (isWeekend(newDate) || (await isHolidayLocal(newDate))) {
            newDate = newDate.plus({ days: 1 });
        }
        added += 1;
    }
    return newDate;
};

/** Calcula minutos hábiles disponibles en el día actual (excluyendo almuerzo) desde el instante local dado */
const availableWorkingMinutesToday = (local: DateTime): number => {
    if (local.hour < WORK_START_HOUR) {
        return (LUNCH_START_HOUR - WORK_START_HOUR) * 60 + (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
    }

    if (local.hour >= LUNCH_START_HOUR && local.hour < LUNCH_END_HOUR) {
        return (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
    }

    if (local.hour >= WORK_END_HOUR) return 0;

    if (local.hour < LUNCH_START_HOUR) {
        const minutesToLunch = (LUNCH_START_HOUR - local.hour) * 60 - local.minute;
        const afternoonMinutes = (WORK_END_HOUR - LUNCH_END_HOUR) * 60;
        return Math.max(0, minutesToLunch) + afternoonMinutes;
    }

    const minutesToEnd = (WORK_END_HOUR - local.hour) * 60 - local.minute;
    return Math.max(0, minutesToEnd);
};

/** Añade horas hábiles a la fecha, respetando almuerzo y horas laborales */
const addBusinessHours = async (date: DateTime, hours: number): Promise<DateTime> => {
    let remainingMinutes = Math.round(hours * 60);
    let local = date.setZone(TIMEZONE, { keepLocalTime: false });

    local = await adjustForwardToWorkTime(local);

    while (remainingMinutes > 0) {
        if (isWeekend(local) || (await isHolidayLocal(local))) {
            local = await moveToNextWorkDayAtStart(local.plus({ days: 1 }));
            continue;
        }

        const available = availableWorkingMinutesToday(local);
        if (available <= 0) {
            local = await moveToNextWorkDayAtStart(local.plus({ days: 1 }));
            continue;
        }

        if (remainingMinutes <= available) {
            const start = local;

            // Si antes del almuerzo y la suma cruza el almuerzo
            if (start.hour < LUNCH_START_HOUR) {
                const minutesToLunch = (LUNCH_START_HOUR - start.hour) * 60 - start.minute;
                if (remainingMinutes <= minutesToLunch) {
                    local = local.plus({ minutes: remainingMinutes });
                    break;
                }
                remainingMinutes -= minutesToLunch;
                local = local.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
                local = local.plus({ minutes: remainingMinutes });
                break;
            }

            // Si está en almuerzo, saltar a LUNCH_END
            if (start.hour >= LUNCH_START_HOUR && start.hour < LUNCH_END_HOUR) {
                local = local.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
                local = local.plus({ minutes: remainingMinutes });
                break;
            }

            // Si ya en la tarde
            local = local.plus({ minutes: remainingMinutes });
            break;
        } else {
            remainingMinutes -= available;
            local = await moveToNextWorkDayAtStart(local.plus({ days: 1 }));
        }
    }

    return local;
};

/** Función principal: suma días y horas hábiles */
export const addBusinessTime = async (
    date: DateTime,
    { days = 0, hours = 0 }: AddTimeParams
): Promise<DateTime> => {
    let local = date.setZone(TIMEZONE, { keepLocalTime: false });
    local = await adjustForwardToWorkTime(local);

    if (days > 0) {
        local = await addBusinessDaysKeepingTime(local, days);
        local = await moveToNextWorkDayKeepingTime(local);
        local = await adjustForwardToWorkTime(local);
    }

    if (hours > 0) {
        local = await addBusinessHours(local, hours);
    }

    return local.toUTC();
};

export type { AddTimeParams };
