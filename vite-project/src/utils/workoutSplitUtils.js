/**
 * Shared Workout Split Utility
 * ─────────────────────────────
 * Single source of truth for determining today's workout split.
 *
 * Rules:
 *   1. Every Sunday → rest day (always).
 *   2. On non-Sunday days the cycle is: push → core → pull → legs → push → …
 *   3. The cycle position is determined by counting non-Sunday days elapsed
 *      since the user's startDate.
 *
 * Both the Overview (dashboard) and the Workout page must import from here
 * so they always stay in sync.
 */

const SPLIT_CYCLE = ['push', 'core', 'pull', 'legs']

/**
 * Count non-Sunday days between two dates (inclusive of `from`, exclusive of `to`).
 * Both dates should already have hours zeroed.
 */
function countNonSundayDays(from, to) {
  let count = 0
  const d = new Date(from)
  while (d < to) {
    if (d.getDay() !== 0) count++       // 0 = Sunday
    d.setDate(d.getDate() + 1)
  }
  return count
}

/**
 * Return the split key for a given date (defaults to today).
 *
 * @param {Object}  appData        – the global appData object (needs .startDate)
 * @param {Date}   [date]          – the target date (defaults to now)
 * @returns {string} one of 'push' | 'core' | 'pull' | 'legs' | 'rest'
 */
export function getTodaySplitKey(appData, date) {
  const target = date ? new Date(date) : new Date()
  target.setHours(0, 0, 0, 0)

  // Rule 1 — Sundays are always rest
  if (target.getDay() === 0) return 'rest'

  // Determine start anchor
  const start = new Date(appData?.startDate || target)
  start.setHours(0, 0, 0, 0)

  // If target is before start (shouldn't happen), just use day 0
  if (target < start) return SPLIT_CYCLE[0]

  // Count workout (non-Sunday) days elapsed from start up to (but not including) target
  const elapsed = countNonSundayDays(start, target)

  // If the startDate itself is a Sunday it was a rest day and doesn't count,
  // but countNonSundayDays already skips Sundays, so no special-case needed.

  return SPLIT_CYCLE[elapsed % SPLIT_CYCLE.length]
}

/**
 * Compute the sequential "day number" the athlete is on.
 * This counts every calendar day since startDate, starting at 1.
 */
export function getDayNumber(appData) {
  if (!appData?.startDate) return 1
  const start = new Date(appData.startDate)
  start.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(1, Math.floor((now - start) / 86400000) + 1)
}
