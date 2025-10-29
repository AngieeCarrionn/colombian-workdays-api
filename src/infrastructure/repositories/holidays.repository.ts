import { HOLIDAYS_URL } from "../../config/constants";

let holidaysCache: Set<string> | null = null;

export const getHolidays = async (): Promise<Set<string>> => {
  if (holidaysCache) return holidaysCache;

  const response = await fetch(HOLIDAYS_URL);
  if (!response.ok) throw new Error("No se pudieron cargar los festivos");

  const data = await response.json();
  holidaysCache = new Set(data.map((d: { date: string }) => d.date));
  return holidaysCache;
};
