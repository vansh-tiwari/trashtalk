import { describe, it, expect } from "vitest";
import {
  countToActivityLevel,
  buildActivityLevels,
  buildActivityLevelsFromTimestamps,
  buildActivityLevelsFromLeetcodeCalendar,
} from "@/lib/battle/activity";

describe("Activity Heatmap Normalization Engine", () => {
  it("maps counts to correct 5-tier intensity levels", () => {
    expect(countToActivityLevel(0)).toBe(0);
    expect(countToActivityLevel(-5)).toBe(0);
    expect(countToActivityLevel(1)).toBe(1);
    expect(countToActivityLevel(2)).toBe(1);
    expect(countToActivityLevel(3)).toBe(2);
    expect(countToActivityLevel(4)).toBe(2);
    expect(countToActivityLevel(5)).toBe(3);
    expect(countToActivityLevel(7)).toBe(3);
    expect(countToActivityLevel(8)).toBe(4);
    expect(countToActivityLevel(25)).toBe(4);
  });

  it("builds exactly 182 daily levels up to reference date with correct counts", () => {
    const refDate = new Date("2026-10-28T12:00:00Z");
    const todayMidnight = Date.UTC(2026, 9, 28) / 1000;
    const SECONDS_PER_DAY = 86400;

    const dayCounts = new Map<number, number>();
    // Today has 10 submissions (level 4)
    dayCounts.set(todayMidnight, 10);
    // Yesterday has 3 submissions (level 2)
    dayCounts.set(todayMidnight - SECONDS_PER_DAY, 3);
    // 5 days ago has 1 submission (level 1)
    dayCounts.set(todayMidnight - 5 * SECONDS_PER_DAY, 1);

    const levels = buildActivityLevels(dayCounts, 182, refDate);

    expect(levels).toHaveLength(182);
    // Last element is today
    expect(levels[181]).toBe(4);
    // Second-to-last is yesterday
    expect(levels[180]).toBe(2);
    // 5 days ago is index 181 - 5 = 176
    expect(levels[176]).toBe(1);
    // Other days are 0
    expect(levels[179]).toBe(0);
  });

  it("builds activity levels from timestamps array (Codeforces style)", () => {
    const refDate = new Date("2026-10-28T12:00:00Z");
    const todayMidnight = Date.UTC(2026, 9, 28) / 1000;
    const SECONDS_PER_DAY = 86400;

    // 6 submissions today at various hours
    const timestamps = [
      todayMidnight + 3600,
      todayMidnight + 7200,
      todayMidnight + 10800,
      todayMidnight + 14400,
      todayMidnight + 18000,
      todayMidnight + 21600,
      // 1 submission yesterday
      todayMidnight - SECONDS_PER_DAY + 5000,
    ];

    const levels = buildActivityLevelsFromTimestamps(timestamps, 182, refDate);

    expect(levels).toHaveLength(182);
    expect(levels[181]).toBe(3); // 6 submissions -> level 3
    expect(levels[180]).toBe(1); // 1 submission -> level 1
  });

  it("parses LeetCode submissionCalendar JSON string", () => {
    const refDate = new Date("2026-10-28T12:00:00Z");
    const todayMidnight = Date.UTC(2026, 9, 28) / 1000;

    const calendarJson = JSON.stringify({
      [String(todayMidnight)]: 8,
    });

    const levels = buildActivityLevelsFromLeetcodeCalendar(calendarJson, 182, refDate);

    expect(levels).toHaveLength(182);
    expect(levels[181]).toBe(4);
  });

  it("safely handles undefined or malformed calendar JSON", () => {
    const levels1 = buildActivityLevelsFromLeetcodeCalendar(undefined, 182);
    expect(levels1).toHaveLength(182);
    expect(levels1.every((l) => l === 0)).toBe(true);

    const levels2 = buildActivityLevelsFromLeetcodeCalendar("invalid-json", 182);
    expect(levels2).toHaveLength(182);
    expect(levels2.every((l) => l === 0)).toBe(true);
  });
});
