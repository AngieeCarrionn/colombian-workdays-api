import { getHolidays } from "../repositories/holidays.repository";

export const isHoliday = async (dateStr: string): Promise<boolean> => {
  const holidays = await getHolidays();
  return holidays.includes(dateStr);
};
