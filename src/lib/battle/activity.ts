/**
 * Activity Heatmap Normalization Engine
 * Converts raw submission timestamps and calendars into a 182-day (26-week)
 * array of normalized activity levels (0-4).
 */

const SECONDS_PER_DAY = 86400;

/**
 * Maps a single day's submission count to a standard 5-tier GitHub/LeetCode intensity level:
 * 0: 0 submissions (empty canvas)
 * 1: 1-2 submissions (light)
 * 2: 3-4 submissions (medium)
 * 3: 5-7 submissions (high)
 * 4: 8+ submissions (maximum)
 */
export function countToActivityLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 7) return 3;
  return 4;
}

/**
 * Computes a normalized array of daily activity levels (0-4) for the past `totalDays` days
 * up to the given reference date (defaulting to current UTC day).
 */
export function buildActivityLevels(
  dayCounts: Map<number, number> | Record<string, number>,
  totalDays = 182,
  referenceDate = new Date()
): number[] {
  // Midnight UTC of reference day
  const todayUtcMidnight =
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate()
    ) / 1000;

  const levels: number[] = [];

  // Iterate backwards (totalDays - 1) days to today (totalDays elements total)
  for (let i = totalDays - 1; i >= 0; i--) {
    const dayTimestamp = todayUtcMidnight - i * SECONDS_PER_DAY;
    let count = 0;

    if (dayCounts instanceof Map) {
      count = dayCounts.get(dayTimestamp) ?? 0;
    } else if (typeof dayCounts === "object" && dayCounts !== null) {
      count = Number(dayCounts[String(dayTimestamp)]) || 0;
    }

    levels.push(countToActivityLevel(count));
  }

  return levels;
}

/**
 * Builds activity levels from a list of individual submission timestamps (in seconds).
 */
export function buildActivityLevelsFromTimestamps(
  timestamps: number[],
  totalDays = 182,
  referenceDate = new Date()
): number[] {
  const countsByDay = new Map<number, number>();

  for (const ts of timestamps) {
    if (!ts || isNaN(ts)) continue;
    const dayUtc = Math.floor(ts / SECONDS_PER_DAY) * SECONDS_PER_DAY;
    countsByDay.set(dayUtc, (countsByDay.get(dayUtc) ?? 0) + 1);
  }

  return buildActivityLevels(countsByDay, totalDays, referenceDate);
}

/**
 * Parses LeetCode submissionCalendar JSON string and converts it to activity levels.
 */
export function buildActivityLevelsFromLeetcodeCalendar(
  submissionCalendarJson?: string,
  totalDays = 182,
  referenceDate = new Date()
): number[] {
  if (!submissionCalendarJson) {
    return new Array(totalDays).fill(0);
  }

  try {
    const parsed = JSON.parse(submissionCalendarJson) as Record<string, number>;
    return buildActivityLevels(parsed, totalDays, referenceDate);
  } catch {
    return new Array(totalDays).fill(0);
  }
}
