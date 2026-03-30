import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  getRegistrationStatus,
  isClosingSoon,
  formatDateDisplay,
  formatRegistrationPeriod,
  getEffectiveJobStatus,
} from "@/lib/jobStatus";

// Fixed reference date: 2026-03-15
const FIXED_TODAY = "2026-03-15";

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(FIXED_TODAY));
});

afterEach(() => {
  vi.useRealTimers();
});

// ── getRegistrationStatus ──────────────────────────────────────────────────────

describe("getRegistrationStatus", () => {
  it('returns "open" when no dates are provided', () => {
    expect(getRegistrationStatus(undefined, undefined)).toBe("open");
    expect(getRegistrationStatus(null, null)).toBe("open");
  });

  it('returns "open" when today is within the window', () => {
    expect(getRegistrationStatus("2026-03-01", "2026-05-31")).toBe("open");
  });

  it('returns "open" when today equals the start date', () => {
    expect(getRegistrationStatus("2026-03-15", "2026-05-31")).toBe("open");
  });

  it('returns "open" when today equals the end date', () => {
    expect(getRegistrationStatus("2026-03-01", "2026-03-15")).toBe("open");
  });

  it('returns "upcoming" when today is before the start date', () => {
    expect(getRegistrationStatus("2026-04-01", "2026-05-31")).toBe("upcoming");
  });

  it('returns "closed" when today is after the end date', () => {
    expect(getRegistrationStatus("2026-01-01", "2026-02-28")).toBe("closed");
  });
});

// ── isClosingSoon ──────────────────────────────────────────────────────────────

describe("isClosingSoon", () => {
  it("returns false when endDate is undefined", () => {
    expect(isClosingSoon(undefined)).toBe(false);
  });

  it("returns false when registration is already closed", () => {
    expect(isClosingSoon("2026-02-28")).toBe(false);
  });

  it("returns true when end date is today", () => {
    expect(isClosingSoon("2026-03-15")).toBe(true);
  });

  it("returns true when end date is within 7 days", () => {
    expect(isClosingSoon("2026-03-20")).toBe(true); // 5 days away
  });

  it("returns false when end date is more than 7 days away", () => {
    expect(isClosingSoon("2026-03-23")).toBe(false); // 8 days away
  });

  it("respects a custom withinDays threshold", () => {
    expect(isClosingSoon("2026-03-20", 3)).toBe(false); // 5 days > 3
    expect(isClosingSoon("2026-03-17", 3)).toBe(true);  // 2 days < 3
  });
});

// ── formatDateDisplay ──────────────────────────────────────────────────────────

describe("formatDateDisplay", () => {
  it("formats a date in human-readable Indian English", () => {
    const result = formatDateDisplay("2026-06-10");
    expect(result).toContain("2026");
    expect(result).toContain("June");
    expect(result).toContain("10");
  });

  it("formats a single-digit day correctly", () => {
    const result = formatDateDisplay("2026-03-01");
    expect(result).toContain("1");
    expect(result).toContain("March");
  });
});

// ── formatRegistrationPeriod ───────────────────────────────────────────────────

describe("formatRegistrationPeriod", () => {
  it("returns null when dates are missing", () => {
    expect(formatRegistrationPeriod(undefined, undefined)).toBeNull();
    expect(formatRegistrationPeriod("2026-03-01", undefined)).toBeNull();
    expect(formatRegistrationPeriod(undefined, "2026-05-31")).toBeNull();
  });

  it("returns a formatted period string containing both dates", () => {
    const result = formatRegistrationPeriod("2026-03-01", "2026-05-31");
    expect(result).not.toBeNull();
    expect(result).toContain("–");
    expect(result).toContain("March");
    expect(result).toContain("May");
  });
});

// ── getEffectiveJobStatus ──────────────────────────────────────────────────────

describe("getEffectiveJobStatus", () => {
  it('returns "inactive" when jobStatus is "inactive" regardless of dates', () => {
    expect(getEffectiveJobStatus("inactive", "2026-05-31")).toBe("inactive");
    expect(getEffectiveJobStatus("inactive", "2026-02-01")).toBe("inactive");
    expect(getEffectiveJobStatus("inactive", undefined)).toBe("inactive");
  });

  it('returns "closed" when registration end date has passed', () => {
    expect(getEffectiveJobStatus("active", "2026-02-28")).toBe("closed");
  });

  it('returns "active" when registration is still open', () => {
    expect(getEffectiveJobStatus("active", "2026-05-31")).toBe("active");
  });

  it('returns "active" when no dates are provided', () => {
    expect(getEffectiveJobStatus("active", undefined)).toBe("active");
    expect(getEffectiveJobStatus(undefined, undefined)).toBe("active");
  });

  it('returns "active" when jobStatus is undefined but registration is open', () => {
    expect(getEffectiveJobStatus(undefined, "2026-05-31")).toBe("active");
  });
});
