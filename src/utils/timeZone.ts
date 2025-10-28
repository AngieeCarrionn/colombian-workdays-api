import { DateTime } from "luxon";
import { TIMEZONE } from "../config/constants";

export const toColombiaTime = (date: string): DateTime =>
  DateTime.fromISO(date, { zone: "utc" }).setZone(TIMEZONE);

export const toUTC = (date: DateTime): string =>
  date.setZone("utc").toISO({ suppressMilliseconds: true }) ?? '';
