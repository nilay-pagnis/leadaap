/**
 * Parse Postgres / Supabase timestamptz strings as an absolute instant.
 * If the string has no timezone suffix, it is treated as UTC (API default).
 */
export function parseTimestamptz(input: string): Date {
  const trimmed = input.trim();
  if (!trimmed) return new Date(NaN);

  let s = trimmed;
  if (/^\d{4}-\d{2}-\d{2}\s+\d/.test(s)) {
    s = s.replace(/^(\d{4}-\d{2}-\d{2})\s+/, "$1T");
  }

  const hasExplicitOffset =
    /Z$/i.test(s) ||
    /[+-]\d{2}(:\d{2}){1,2}$/.test(s) ||
    /[+-]\d{4}$/.test(s);

  if (!hasExplicitOffset) {
    s = `${s}Z`;
  }

  return new Date(s);
}
