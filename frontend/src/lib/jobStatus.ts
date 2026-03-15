/** Registration window status derived from current date vs. stored dates. */
export type RegistrationStatus = "upcoming" | "open" | "closed";

/**
 * Compute the registration status based on start/end date strings (YYYY-MM-DD).
 * - "upcoming" : current date is before the start date
 * - "open"     : current date is within the window (or no dates supplied)
 * - "closed"   : current date is past the end date
 */
export function getRegistrationStatus(
  startDate: string | undefined | null,
  endDate: string | undefined | null
): RegistrationStatus {
  if (!startDate || !endDate) return "open";
  const now = new Date();
  // Compare date-only (strip time) to avoid timezone edge-cases
  const todayStr = now.toISOString().slice(0, 10);
  if (todayStr < startDate) return "upcoming";
  if (todayStr > endDate) return "closed";
  return "open";
}

/**
 * Returns true when the registration end date is within `withinDays` calendar
 * days from today AND the registration is still open.
 */
export function isClosingSoon(
  endDate: string | undefined | null,
  withinDays = 7
): boolean {
  if (!endDate) return false;
  const todayStr = new Date().toISOString().slice(0, 10);
  if (todayStr > endDate) return false; // already closed
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysLeft =
    (new Date(endDate).getTime() - new Date(todayStr).getTime()) / msPerDay;
  return daysLeft >= 0 && daysLeft <= withinDays;
}

/**
 * Format a YYYY-MM-DD string into a human-readable date (e.g. "10 June 2026").
 */
export function formatDateDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Build the registration period string shown on job cards.
 * Returns null when no dates are stored.
 */
export function formatRegistrationPeriod(
  startDate: string | undefined | null,
  endDate: string | undefined | null
): string | null {
  if (!startDate || !endDate) return null;
  return `${formatDateDisplay(startDate)} – ${formatDateDisplay(endDate)}`;
}

/**
 * Determine the effective display status for a job, factoring in both the
 * stored `jobStatus` field and the registration end date.
 *
 * Priority:
 *  1. If `jobStatus` is "inactive"  → "inactive"
 *  2. If registrationEndDate passed → "closed"
 *  3. Otherwise                     → "active"
 */
export function getEffectiveJobStatus(
  jobStatus: string | undefined | null,
  registrationEndDate: string | undefined | null
): "active" | "inactive" | "closed" {
  if (jobStatus === "inactive") return "inactive";
  if (registrationEndDate) {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (todayStr > registrationEndDate) return "closed";
  }
  return "active";
}
