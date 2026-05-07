/**
 * Exercise Utility Helpers
 * ────────────────────────
 * Centralised hold-exercise detection so every UI surface
 * (exercise cards, timer modal, rest popup, overview, done block)
 * agrees on which exercises are timed holds vs. rep-based.
 */

/**
 * Names (lowercased) that are always treated as hold / timed exercises,
 * regardless of what the `reps` field says.
 *
 * This list covers every hold exercise across all workout splits
 * in workoutData.js — add new ones here as needed.
 */
const HOLD_EXERCISE_NAMES = [
  'forearm plank',
  'hollow body hold',
  'side plank',
  'superman hold',
  'wall handstand hold',
  'dead hang',
  'pigeon pose',
  'full body stretch',
  'foam rolling',
  'deep breathing',
  'hollow body rock',      // "rock" variant is still timed
  'l-sit',
  'l sit',
  'front lever',
  'human flag',
  'full planche',
  'planche lean',
]

/**
 * Names that contain hold keywords but are actually rep-based movements.
 */
const HOLD_EXCEPTIONS = [
  'side plank dips',       // movement (dips), not a static hold
  'plank jacks',           // movement (jumping), not a static hold
  'commando plank',        // movement (up-down), not a static hold
]

/**
 * Keywords in the exercise name that strongly imply a hold.
 */
const HOLD_KEYWORDS = ['plank', 'hold', 'hang', 'lever', 'flag', 'planche', 'l-sit', 'l sit']

/**
 * Determine whether an exercise is a timed hold (true) or rep-based (false).
 *
 * @param {string}        name  – exercise name
 * @param {string|number} reps  – the reps value from the exercise object
 * @returns {boolean}
 */
export function isHoldExercise(name, reps) {
  const lower = (name || '').toLowerCase().trim()

  // 0. Check exceptions first — these look like holds but aren't
  if (HOLD_EXCEPTIONS.includes(lower)) return false

  // 1. Exact-name match
  if (HOLD_EXERCISE_NAMES.includes(lower)) return true

  // 2. Keyword match
  if (HOLD_KEYWORDS.some(kw => lower.includes(kw))) return true

  // 3. Reps value contains time units ('s', 'sec', 'min', 'each')
  const repsStr = String(reps || '').toLowerCase()
  if (/\d+\s*s(ec)?/.test(repsStr) || repsStr.includes('min') || repsStr.includes('each')) return true

  return false
}

/**
 * Format the reps display string for an exercise.
 * Hold exercises → "30s" / "60s"  (appends 's' if reps is a plain number)
 * Rep  exercises → "12 Reps"
 *
 * @param {string}        name
 * @param {string|number} reps
 * @returns {string}
 */
export function formatRepsDisplay(name, reps) {
  if (isHoldExercise(name, reps)) {
    const str = String(reps)
    // If already a formatted string like '30s', '60s each', '3 min', return as-is
    if (/[a-zA-Z]/.test(str)) return str
    // Plain number → append 's'
    return `${str}s`
  }
  return `${reps} Reps`
}

/**
 * Label for the log input in the rest-timer popup.
 */
export function getLogLabel(name, reps) {
  return isHoldExercise(name, reps) ? 'LOG HOLD TIME (SEC)' : 'LOG REPS FOR THIS SET'
}

/**
 * Unit label shown alongside the stat.
 * Hold → "Hold"   Rep → "Reps"
 */
export function getStatLabel(name, reps) {
  return isHoldExercise(name, reps) ? 'Hold' : 'Reps'
}
