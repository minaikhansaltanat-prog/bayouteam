import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ASTANA_OFFSET_MS = 5 * 3600 * 1000;

// Deterministic DD.MM / DD.MM.YYYY formatting in the Astana (UTC+5) calendar
// day, independent of the server's or browser's local timezone/ICU data —
// using Intl.DateTimeFormat with a locale here caused SSR/CSR hydration
// mismatches (Node's ICU data for kk-KZ can disagree with the browser's).
export function formatAstanaDate(input: string | Date, withYear = false) {
  const date = new Date(input);
  const shifted = new Date(date.getTime() + ASTANA_OFFSET_MS);
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  if (!withYear) return `${day}.${month}`;
  return `${day}.${month}.${shifted.getUTCFullYear()}`;
}

export function formatAstanaTime(input: string | Date) {
  const date = new Date(input);
  const shifted = new Date(date.getTime() + ASTANA_OFFSET_MS);
  const hours = String(shifted.getUTCHours()).padStart(2, "0");
  const minutes = String(shifted.getUTCMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function initials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
