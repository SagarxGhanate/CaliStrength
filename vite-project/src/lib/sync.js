/**
 * sync.js — Background MySQL sync for CaliStrength
 *
 * This file silently saves data to your backend every time
 * localStorage is updated. Your app keeps working exactly
 * as before — this just adds MySQL persistence on top.
 */

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('cs_token')
}

async function post(path, body) {
  const token = getToken()
  if (!token) return // Not logged in — skip sync

  try {
    await fetch(`${API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    // Silent fail — app still works via localStorage
    console.warn('[sync] Failed to sync to backend:', err.message)
  }
}

async function del(path, body) {
  const token = getToken()
  if (!token) return
  try {
    await fetch(`${API}${path}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
  } catch (err) {
    console.warn('[sync] Failed to delete from backend:', err.message)
  }
}

// ── WORKOUT ───────────────────────────────────────────────────────────────────
/**
 * Call this after a set is completed in WorkoutPage.
 * exName: exercise name string
 * reps: number of reps done
 * seconds: time taken for the set
 * splitKey: 'push', 'pull', 'legs', 'core'
 */
export async function syncWorkoutSet(exName, reps, seconds, splitKey = '', setNumber = 1) {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  await post('/workouts/session', {
    date: today,
    total_seconds: seconds || 0,
    total_reps: reps || 0,
    exercises: [{
      exercise_name: exName,
      category: splitKey,
      total_reps: reps || 0,
      sets_data: [{ set: setNumber, reps: reps || 0 }],
    }]
  })

  // Also update PR if this is a high rep count
  await post('/records', {
    exercise_name: exName,
    max_reps: reps || 0,
    date_achieved: today,
  })
}

// ── WEIGHT ────────────────────────────────────────────────────────────────────
/**
 * Call this when user logs their weight in WeightPage.
 */
export async function syncWeight(weightKg, dateStr) {
  await post('/weight', {
    date: dateStr,
    weight_kg: parseFloat(weightKg),
  })
}

// ── SKILLS ────────────────────────────────────────────────────────────────────
/**
 * Call when user starts training a skill.
 */
export async function syncSkillStart(skillKey) {
  await post('/skills/start', { skill_key: skillKey })
}

/**
 * Call when user marks a skill as mastered.
 */
export async function syncSkillMaster(skillKey) {
  await post('/skills/master', { skill_key: skillKey })
}

/**
 * Call when user removes a skill from their list.
 */
export async function syncSkillRemove(skillKey) {
  await del('/skills/remove', { skill_key: skillKey })
}

// ── PERSONAL RECORDS ──────────────────────────────────────────────────────────
/**
 * Call when a new PR is achieved.
 */
export async function syncPR(exerciseName, maxReps, dateStr) {
  await post('/records', {
    exercise_name: exerciseName,
    max_reps: maxReps,
    date_achieved: dateStr,
  })
}
