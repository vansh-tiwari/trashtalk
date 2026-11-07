/**
 * Deterministic number formatting using en-US standard comma grouping (e.g. 180,000).
 * Prevents SSR/CSR hydration mismatches across different client browser locales (e.g. en-IN: 1,80,000, de-DE: 180.000).
 */
const EN_US_FORMATTER = new Intl.NumberFormat("en-US");

export function formatNum(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return "0";
  return EN_US_FORMATTER.format(val);
}
