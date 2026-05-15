// ── Injury Filtering Logic (ported from 2.0-Copy Calistrength.js) ──

const BODY_PARTS = ['neck', 'shoulder', 'elbow', 'wrist', 'lower back', 'back', 'knee', 'shin', 'ankle', 'hamstring', 'hip', 'calf', 'chest']

const LIGHT_ALTERNATIVES = {
  lowerBody: [
    { name: 'Glute Bridges', sets: 3, reps: 15, desc: 'Keep core tight, squeeze glutes at top', img: '/Assets/Glutebridge.png' },
    { name: 'Wall Sit', sets: 3, reps: '30s', desc: 'Hold 90 degree angle against wall', img: '/Assets/Squats.png' },
    { name: 'Lateral Leg Raises', sets: 3, reps: 12, desc: 'Slow controlled movement for hip stability', img: '/Assets/forward-backward lunges.png' },
    { name: 'Floor Calf Raises', sets: 3, reps: 15, desc: 'Gentle ankle mobility', img: '/Assets/calves raises.png' },
    { name: 'Bird Dog', sets: 3, reps: 10, desc: 'Great for stability and core', img: '/Assets/Superman hold.png' },
  ],
  upperPush: [
    { name: 'High Plank Hold', sets: 3, reps: '45s', desc: 'Keep core tight and shoulders active', img: '/Assets/plank hold.png' },
    { name: 'Shoulder Taps', sets: 3, reps: 16, desc: 'Keep hips stable, tap opposite shoulder', img: '/Assets/Pushups.png' },
    { name: 'Scapular Push-ups', sets: 3, reps: 12, desc: 'Keep arms straight, move only shoulder blades', img: '/Assets/Pushups.png' },
    { name: 'Elevated Pike Hold', sets: 3, reps: '20s', desc: 'Keep hips high, arms straight', img: '/Assets/elevated pike hold.png' },
    { name: 'Knee Push-ups', sets: 3, reps: 8, desc: 'Focus on perfect form, very light', img: '/Assets/Pushups.png' },
  ],
  upperPull: [
    { name: 'Scapular Pull-ups', sets: 3, reps: 10, desc: 'Hang from bar, pull shoulder blades down', img: '/Assets/Pullups.png' },
    { name: 'Dead Hang (Active)', sets: 3, reps: '20s', desc: 'Pull shoulder blades away from ears', img: '/Assets/Pullups.png' },
    { name: 'Bird Dog', sets: 3, reps: 10, desc: 'Focus on back and core tension', img: '/Assets/Superman hold.png' },
    { name: 'Band Pull-aparts', sets: 3, reps: 15, desc: 'Light resistance for rear delts and back', img: '/Assets/Pullups.png' },
    { name: 'Floor Pull-Slides', sets: 3, reps: 10, desc: 'Lay on floor, slide body using lats', img: '/Assets/Pullups.png' },
  ],
}

// ── Injury-safe exercises to ADD during "light" mode ──
const INJURY_SAFE_EXERCISES = {
  shoulder: [
    { name: 'High Plank Hold', sets: 2, reps: '30s', desc: 'Gentle shoulder stabilization — keep core tight, shoulders packed', img: '/Assets/plank hold.png' },
  ],
  elbow: [
    { name: 'High Plank Hold', sets: 2, reps: '30s', desc: 'Straight arm hold — no elbow bending required', img: '/Assets/plank hold.png' },
  ],
  wrist: [
    { name: 'High Plank Hold', sets: 2, reps: '20s', desc: 'Spread fingers wide for even pressure — stop if painful', img: '/Assets/plank hold.png' },
  ],
  chest: [
    { name: 'High Plank Hold', sets: 2, reps: '30s', desc: 'Isometric hold — minimal chest strain', img: '/Assets/plank hold.png' },
  ],
  neck: [
    { name: 'High Plank Hold', sets: 2, reps: '30s', desc: 'Keep neck neutral — eyes between hands', img: '/Assets/plank hold.png' },
  ],
  knee: [
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Partial squat — only go to pain-free depth', img: '/Assets/Squats.png' },
    { name: 'Deep Squat Hold', sets: 2, reps: '15s', desc: 'Assisted deep squat — hold chair or doorframe for support', img: '/Assets/Squats.png' },
  ],
  ankle: [
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Gentle ankle mobility — pain-free range only', img: '/Assets/Squats.png' },
    { name: 'Deep Squat Hold', sets: 2, reps: '15s', desc: 'Slow controlled hold — focus on ankle flexibility', img: '/Assets/Squats.png' },
  ],
  shin: [
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Zero impact hold — gentle on shins', img: '/Assets/Squats.png' },
  ],
  hamstring: [
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Controlled depth — ease hamstring tension', img: '/Assets/Squats.png' },
    { name: 'Deep Squat Hold', sets: 2, reps: '15s', desc: 'Hip opening hold — gentle hamstring lengthening', img: '/Assets/Squats.png' },
  ],
  hip: [
    { name: 'Deep Squat Hold', sets: 2, reps: '20s', desc: 'Open hips gently — use support if needed', img: '/Assets/Squats.png' },
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Partial squat — pain-free hip range', img: '/Assets/Squats.png' },
  ],
  calf: [
    { name: 'Squat Hold', sets: 2, reps: '20s', desc: 'Flat foot hold — no calf engagement needed', img: '/Assets/Squats.png' },
  ],
  back: [
    { name: 'Bird Dog Hold', sets: 2, reps: '20s each side', desc: 'Gentle back stabilization — opposite arm and leg', img: '/Assets/Superman hold.png' },
  ],
  'lower back': [
    { name: 'Bird Dog Hold', sets: 2, reps: '20s each side', desc: 'Safe lower back exercise — keep spine neutral', img: '/Assets/Superman hold.png' },
  ],
}

// ── Stretches to append at the END of workout for injured body part ──
const INJURY_STRETCHES = {
  shoulder: { name: '🧘 Shoulder Stretch', sets: 1, reps: '45s each side', desc: 'Cross-body shoulder stretch — hold gently, no bouncing', img: '' },
  elbow: { name: '🧘 Forearm & Elbow Stretch', sets: 1, reps: '30s each arm', desc: 'Extend arm, gently pull fingers back and then forward', img: '' },
  wrist: { name: '🧘 Wrist Stretch', sets: 1, reps: '30s each wrist', desc: 'Prayer stretch — press palms together, lower to waist height', img: '' },
  chest: { name: '🧘 Chest Opener Stretch', sets: 1, reps: '45s', desc: 'Doorway stretch — arms at 90°, lean forward gently', img: '' },
  neck: { name: '🧘 Neck Stretch', sets: 1, reps: '30s each side', desc: 'Gentle lateral neck stretch — ear toward shoulder', img: '' },
  knee: { name: '🧘 Quad & Knee Stretch', sets: 1, reps: '30s each leg', desc: 'Standing quad stretch — hold wall for balance', img: '' },
  ankle: { name: '🧘 Ankle Mobility Stretch', sets: 1, reps: '30s each ankle', desc: 'Slow ankle circles then calf stretch against wall', img: '' },
  shin: { name: '🧘 Shin Stretch', sets: 1, reps: '30s each leg', desc: 'Kneel and sit on heels — stretch front of shin', img: '' },
  hamstring: { name: '🧘 Hamstring Stretch', sets: 1, reps: '45s each leg', desc: 'Standing forward fold — keep slight knee bend', img: '' },
  hip: { name: '🧘 Hip Flexor Stretch', sets: 1, reps: '45s each side', desc: 'Low lunge position — push hips forward gently', img: '' },
  calf: { name: '🧘 Calf Stretch', sets: 1, reps: '30s each leg', desc: 'Wall calf stretch — heel pressed to ground', img: '' },
  back: { name: '🧘 Back Stretch', sets: 1, reps: '45s', desc: "Child's pose — arms extended, sink hips to heels", img: '' },
  'lower back': { name: '🧘 Lower Back Stretch', sets: 1, reps: '45s', desc: 'Knees-to-chest stretch — hug both knees lying down', img: '' },
}

export function isExerciseRelatedToPart(exName, part) {
  const name = exName.toLowerCase().replace(/⚠️\s*/g, '')
  const p = part.toLowerCase()

  if (['shoulder', 'elbow', 'wrist', 'chest', 'neck'].includes(p)) {
    return name.includes('push-up') || name.includes('push up') || name.includes('pushup') ||
           name.includes('dip') || name.includes('handstand') || name.includes('pike') ||
           name.includes('burpee') || name.includes('diamond') || name.includes('incline') ||
           name.includes('decline') || name.includes('shoulder tap') || name.includes('commando') ||
           name.includes('plank hold')
  }
  if (['back', 'bicep', 'grip'].includes(p)) {
    return name.includes('pull-up') || name.includes('pull up') || name.includes('pullup') ||
           name.includes('row') || name.includes('chin-up') || name.includes('chin up') ||
           name.includes('dead hang') || name.includes('australian') || name.includes('negative') ||
           name.includes('wide grip') || name.includes('superman')
  }
  if (['knee', 'ankle', 'hip', 'leg', 'glute', 'calf', 'shin', 'hamstring'].includes(p)) {
    return name.includes('squat') || name.includes('lunge') || name.includes('calf') ||
           name.includes('bridge') || name.includes('jump') || name.includes('pistol') ||
           name.includes('box jump') || name.includes('wall sit') || name.includes('leg raise') ||
           name.includes('step')
  }
  if (['core', 'stomach', 'lower back', 'abs'].includes(p)) {
    return name.includes('plank') || name.includes('raise') || name.includes('twist') ||
           name.includes('crunch') || name.includes('hollow') || name.includes('v-up') ||
           name.includes('v up') || name.includes('mountain climber') || name.includes('bicycle') ||
           name.includes('superman') || name.includes('flutter') || name.includes('bird dog') ||
           name.includes('dead bug') || name.includes('side plank')
  }
  return false
}

export function getActiveInjuries() {
  try {
    const s = JSON.parse(localStorage.getItem('cs_ai_chat'))
    if (!s || !s.injuries) return []
    const now = new Date().getTime()
    return s.injuries.filter(inj => {
      if (inj.permanent) return true
      return ((now - (inj.date || 0)) / (1000 * 60 * 60 * 24)) <= 7
    })
  } catch { return [] }
}

export function filterWorkoutExercises(workoutDataObj) {
  // Deep copy to avoid mutating global data
  const clone = JSON.parse(JSON.stringify(workoutDataObj))

  const allInjuries = getActiveInjuries()
  if (!allInjuries || allInjuries.length === 0) return clone

  const removeParts = allInjuries.filter(i => i.mode !== 'light').map(i => i.part)
  const lightInjuries = allInjuries.filter(i => i.mode === 'light')

  // ── REMOVE MODE: Completely remove affected exercises, no replacements ──
  if (removeParts.length > 0) {
    clone.exercises = clone.exercises.filter(ex =>
      !removeParts.some(part => isExerciseRelatedToPart(ex.name, part))
    )
  }

  // ── LIGHT MODE: Reduce to 2 sets, add safe exercises + stretch at end ──
  if (lightInjuries.length > 0) {
    const safeToAdd = []
    const stretchesToAdd = []

    lightInjuries.forEach(inj => {
      // 1. Reduce sets to exactly 2 for affected exercises & mark them
      clone.exercises.forEach(ex => {
        if (isExerciseRelatedToPart(ex.name, inj.part) && !ex.name.includes('⚠️')) {
          ex.sets = 2
          ex.name = '⚠️ ' + ex.name
          ex.desc = '⚠️ INJURY MODE — 2 sets only. Focus on slow, pain-free tempo. ' + ex.desc
        }
      })

      // 2. Collect injury-safe exercises (High Plank Hold, Squat Hold, etc.)
      const safeExercises = INJURY_SAFE_EXERCISES[inj.part] || []
      safeExercises.forEach(safe => {
        if (!safeToAdd.some(e => e.name === safe.name)) {
          safeToAdd.push(JSON.parse(JSON.stringify(safe)))
        }
      })

      // 3. Collect stretch for this injured part
      const stretch = INJURY_STRETCHES[inj.part]
      if (stretch && !stretchesToAdd.some(e => e.name === stretch.name)) {
        stretchesToAdd.push(JSON.parse(JSON.stringify(stretch)))
      }
    })

    // Append safe exercises (avoid duplicates with existing)
    safeToAdd.forEach(safe => {
      if (!clone.exercises.some(e => e.name === safe.name || e.name === '⚠️ ' + safe.name)) {
        clone.exercises.push(safe)
      }
    })

    // Append stretches at the very end of exercises
    stretchesToAdd.forEach(stretch => {
      if (!clone.exercises.some(e => e.name === stretch.name)) {
        clone.exercises.push(stretch)
      }
    })
  }

  // Deduplicate
  const seen = new Set()
  clone.exercises = clone.exercises.filter(ex => {
    if (seen.has(ex.name)) return false
    seen.add(ex.name)
    return true
  })

  return clone
}

export { BODY_PARTS }
