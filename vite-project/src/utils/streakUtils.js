/**
 * Shared Streak Utilities
 * ────────────────────────
 * Single source of truth for streak computation across all pages.
 *
 * Rules:
 *   - Sundays (day 0) NEVER affect the streak — no increase, no decrease.
 *   - A streak counts consecutive non-Sunday days with at least one workout.
 *   - If today hasn't been worked out yet, we forgive it and count from yesterday.
 */

import { parseStoredDate } from './dateUtils'

/**
 * Compute the current workout streak, skipping Sundays.
 * Used by: OverviewPage, DailyReportPage, and anywhere else that shows "current streak".
 *
 * @param {Array} workoutHistory – array of { date, ... } workout entries
 * @returns {number} current streak count
 */
export function computeStreak(workoutHistory = []) {
  if (!workoutHistory.length) return 0

  // Build a Set of unique workout date strings (YYYY-MM-DD)
  const workedDates = new Set(workoutHistory.map(w => {
    const d = parseStoredDate(w.date || w.timestamp)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }))

  let streak = 0
  const cur = new Date()
  cur.setHours(0, 0, 0, 0)

  // Walk backwards day by day from today
  const check = new Date(cur)

  // If today is Sunday, skip it (rest day — doesn't count either way)
  if (check.getDay() === 0) check.setDate(check.getDate() - 1)

  // If today hasn't been worked out yet, allow it — step back one day
  const todayStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
  if (!workedDates.has(todayStr)) {
    check.setDate(check.getDate() - 1)
    // Skip Sunday
    if (check.getDay() === 0) check.setDate(check.getDate() - 1)
  }

  while (true) {
    // Skip Sundays (rest days don't break streak)
    if (check.getDay() === 0) {
      check.setDate(check.getDate() - 1)
      continue
    }

    const dateStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
    if (workedDates.has(dateStr)) {
      streak++
      check.setDate(check.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

/**
 * Compute the longest streak ever, skipping Sundays.
 * Used by: ActivityPage, AppContext (longestStreak sync).
 *
 * @param {Array} workoutHistory – array of { date, ... } workout entries
 * @returns {number} longest streak count
 */
export function computeLongestStreak(workoutHistory = []) {
  if (!workoutHistory.length) return 0

  // Get unique sorted dates
  const uniqueDates = [...new Set(workoutHistory.map(w => {
    const d = parseStoredDate(w.date || w.timestamp)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }))].sort()

  let longest = 0
  let current = 0
  let prevWorkDate = null // last non-Sunday date that had a workout

  for (const ds of uniqueDates) {
    const [year, month, day] = ds.split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    d.setHours(0, 0, 0, 0)

    // Skip any workout logged on a Sunday (shouldn't count)
    if (d.getDay() === 0) continue

    if (!prevWorkDate) {
      current = 1
    } else {
      // Count the non-Sunday days between prevWorkDate and d
      // They should be exactly 1 for consecutive
      let nonSundayGap = 0
      const walker = new Date(prevWorkDate)
      walker.setDate(walker.getDate() + 1)
      while (walker <= d) {
        if (walker.getDay() !== 0) nonSundayGap++
        walker.setDate(walker.getDate() + 1)
      }

      if (nonSundayGap === 1) {
        current++
      } else {
        current = 1
      }
    }

    if (current > longest) longest = current
    prevWorkDate = d
  }

  return longest
}
