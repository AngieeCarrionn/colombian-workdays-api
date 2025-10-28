import { HOLIDAYS_URL } from "../../config/constants";

let holidaysCache: string[] = [];

export const getHolidays = async (): Promise<string[]> => {
  if (holidaysCache.length > 0) return holidaysCache;

  const response = await fetch(HOLIDAYS_URL);
  if (!response.ok) throw new Error("No se pudieron cargar los festivos");

  holidaysCache = await response.json();
  return holidaysCache;
};
