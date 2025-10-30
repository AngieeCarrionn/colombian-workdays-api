/**
 * Módulo de cálculo de fechas hábiles.
 *
 * Reglas implementadas:
 * - Jornada laboral: 08:00–12:00 y 13:00–17:00 (hora local Colombia).
 * - Almuerzo (12:00–13:00) no suma tiempo hábil.
 * - Fines de semana (sábado/domingo) y días festivos (opcional según BUSINESS_IGNORE_HOLIDAYS).
 * - Zona horaria: America/Bogota (toda la lógica se realiza en hora local).
 * - Alineación inicial **hacia atrás**: si t0 cae fuera de jornada o en día no hábil,
 *   se ancla al último instante laboral válido ≤ t0 (ver alignBackToWorkingInstant).
 * - Orden de cómputo: primero days, luego hours.
 *
 * Salida: DateTime en UTC (conversión fuera de este módulo, o al final de addBusinessTime).
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
const IGNORE_HOLIDAYS: boolean = process.env.BUSINESS_IGNORE_HOLIDAYS === "true";

/**
 * Convierte un DateTime a la zona horaria local (America/Bogota)
 */
const toLocal = (date: DateTime): DateTime =>
  date.setZone(TIMEZONE, { keepLocalTime: false });

/**
 * Determina si una fecha cae en fin de semana (sábado/domingo)
 * @param date Se asume en cualquier zona; se normaliza a local internamente
 */
const isWeekend = (date: DateTime): boolean => {
  const wd = toLocal(date).weekday; // 1..7 (lunes..domingo)
  return wd === 6 || wd === 7;
};

/**
 * Determina si una fecha (día) es no laborable (fin de semana o festivo).
 * Si IGNORE_HOLIDAYS=true, sólo se consideran fines de semana.
 * isHoliday espera formato 'yyyy-MM-dd' de la zona local.
 */
const isNonWorkingDay = async (date: DateTime): Promise<boolean> => {
  const local = toLocal(date);
  if (IGNORE_HOLIDAYS) return isWeekend(local);
  const dateStr: string = local.toFormat("yyyy-MM-dd");
  return isWeekend(local) || (await isHoliday(dateStr));
};

/**
 * Mueve una fecha al **siguiente** día hábil a las 08:00.
 * (Se mantiene para uso interno en horas; no se usa para el anclaje inicial).
 */
const moveToNextWorkDay = async (date: DateTime): Promise<DateTime> => {
  let d = toLocal(date);
  do {
    d = d.plus({ days: 1 }).set({
      hour: WORK_START_HOUR,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
  } while (await isNonWorkingDay(d));
  return d;
};

/**
 * Mueve una fecha al **día hábil anterior** a las 17:00.
 */
const moveToPrevWorkDay = async (date: DateTime): Promise<DateTime> => {
  let d = toLocal(date)
    .minus({ days: 1 })
    .set({
      hour: WORK_END_HOUR,
      minute: 0,
      second: 0,
      millisecond: 0,
    });

  while (await isNonWorkingDay(d)) {
    d = d
      .minus({ days: 1 })
      .set({
        hour: WORK_END_HOUR,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
  }
  return d;
};

/**
 * (NO USAR para el cómputo de esta API) Ajusta hacia **adelante** al rango laboral:
 * - Antes de 08:00 → 08:00
 * - Después de 17:00 → 17:00
 * - En almuerzo → 12:00 (borde)
 * Se deja por compatibilidad, pero el enunciado exige "aproximar hacia atrás".
 */
const adjustTimeToWorkHours = (date: DateTime): DateTime => {
  let d = toLocal(date);
  const hour = d.hour;

  if (hour < WORK_START_HOUR) {
    return d.set({ hour: WORK_START_HOUR, minute: 0, second: 0, millisecond: 0 });
  }

  if (hour >= WORK_END_HOUR) {
    return d.set({ hour: WORK_END_HOUR, minute: 0, second: 0, millisecond: 0 });
  }

  if (hour >= LUNCH_START_HOUR && hour < LUNCH_END_HOUR) {
    return d.set({ hour: LUNCH_START_HOUR, minute: 0, second: 0, millisecond: 0 });
  }

  return d.set({ second: 0, millisecond: 0 });
};

/**
 * Alinea **HACIA ATRÁS** al instante laboral válido más cercano (≤ date).
 * Reglas:
 * - Día no hábil → día hábil anterior 17:00
 * - Después de 17:00 → 17:00
 * - En almuerzo (12:00–12:59) → 12:00
 * - Antes de 08:00 → día hábil anterior 17:00
 * - Dentro del bloque laboral → se mantiene (segundos/milisegundos a 0)
 */
const alignBackToWorkingInstant = async (date: DateTime): Promise<DateTime> => {
  const d0 = toLocal(date);

  if (await isNonWorkingDay(d0)) {
    return moveToPrevWorkDay(d0);
  }

  const minutes = d0.hour * 60 + d0.minute;
  const W_START = WORK_START_HOUR * 60;
  const L_START = LUNCH_START_HOUR * 60;
  const L_END = LUNCH_END_HOUR * 60;
  const W_END = WORK_END_HOUR * 60;

  // ≥ 17:00 → 17:00
  if (minutes >= W_END) {
    return d0.set({ hour: WORK_END_HOUR, minute: 0, second: 0, millisecond: 0 });
  }
  // En almuerzo → 12:00
  if (minutes >= L_START && minutes < L_END) {
    return d0.set({ hour: LUNCH_START_HOUR, minute: 0, second: 0, millisecond: 0 });
  }
  // Antes de 08:00 → día hábil anterior 17:00
  if (minutes < W_START) {
    return moveToPrevWorkDay(d0);
  }

  // Ya dentro del bloque (o exactamente en 08:00/12:00/13:00/17:00)
  return d0.set({ second: 0, millisecond: 0 });
};

/**
 * Suma días hábiles preservando la hora local actual.
 * Se asume que el punto de partida ya está anclado en un instante laboral válido.
 */
const addBusinessDays = async (date: DateTime, days: number): Promise<DateTime> => {
  let d = toLocal(date);
  let added = 0;

  while (added < days) {
    d = d.plus({ days: 1 });
    while (await isNonWorkingDay(d)) {
      d = d.plus({ days: 1 });
    }
    added++;
  }

  // Nota: no adelantamos al "siguiente hábil" al final; el bucle ya lo garantiza.
  return d;
};

/**
 * Suma horas hábiles respetando 08–12 / 13–17, almuerzo y días no laborables.
 * Se asume que el punto de partida ya está anclado en un instante laboral válido.
 */
const addBusinessHours = async (date: DateTime, hours: number): Promise<DateTime> => {
  let d = toLocal(date);
  let remaining: number = Math.round(hours * 60); // minutos por sumar

  while (remaining > 0) {
    // Si el día no es laborable, saltar al siguiente hábil 08:00
    if (await isNonWorkingDay(d)) {
      d = await moveToNextWorkDay(d);
      continue;
    }

    const currentMinutes = d.hour * 60 + d.minute;
    let endBlockMinutes: number;

    if (d.hour < LUNCH_START_HOUR) {
      // Bloque de mañana: termina 12:00
      endBlockMinutes = LUNCH_START_HOUR * 60;
    } else if (d.hour >= LUNCH_START_HOUR && d.hour < LUNCH_END_HOUR) {
      // En almuerzo → brincar a 13:00
      d = d.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
      continue;
    } else {
      // Bloque de tarde: termina 17:00
      endBlockMinutes = WORK_END_HOUR * 60;
    }

    const available = endBlockMinutes - currentMinutes;

    if (available <= 0) {
      // Sin minutos disponibles en este bloque → avanzar a la próxima sesión
      if (d.hour >= WORK_END_HOUR) {
        d = await moveToNextWorkDay(d);
      } else if (d.hour >= LUNCH_START_HOUR && d.hour < LUNCH_END_HOUR) {
        d = d.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
      } else {
        // Caso borde improbable (redondeos). Asegurar progreso:
        d = d.plus({ minutes: 1 });
      }
      continue;
    }

    if (remaining <= available) {
      // Cabe en el bloque actual
      d = d.plus({ minutes: remaining });
      remaining = 0;
    } else {
      // Agota el bloque y continúa
      d = d.plus({ minutes: available });
      remaining -= available;

      // Si quedamos justo en 12:00, saltar a 13:00
      if (d.hour === LUNCH_START_HOUR && d.minute === 0) {
        d = d.set({ hour: LUNCH_END_HOUR, minute: 0, second: 0, millisecond: 0 });
      }
      // Si quedamos justo en 17:00, saltar al siguiente hábil 08:00
      if (d.hour === WORK_END_HOUR && d.minute === 0) {
        d = await moveToNextWorkDay(d);
      }
    }
  }

  return d;
};

/**
 * Suma tiempo hábil (days y/o hours) a partir de una fecha dada.
 * - Alinea **hacia atrás** al instante laboral válido ≤ t0.
 * - Suma primero days (preservando la hora local), luego hours.
 * - Devuelve DateTime en UTC (sin formateo; el handler puede serializar a "...Z").
 *
 * @throws Error si no se proporciona days ni hours (ambos 0/undefined)
 */
export const addBusinessTime = async (
  date: DateTime,
  { days = 0, hours = 0 }: AddTimeParams
): Promise<DateTime> => {
  if ((days ?? 0) <= 0 && (hours ?? 0) <= 0) {
    throw new Error("Debe enviar days y/o hours");
  }

  // 1) Alineación inicial **HACIA ATRÁS**
  let d = await alignBackToWorkingInstant(date);

  // 2) Sumar días hábiles (preservando hora local)
  if (days > 0) {
    d = await addBusinessDays(d, days);
  }

  // 3) Sumar horas hábiles
  if (hours > 0) {
    d = await addBusinessHours(d, hours);
  }

  // 4) Retornar en UTC
  return d.toUTC();
};
