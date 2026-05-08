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

  // Separate "Remove" and "Light" injuries
  const removeParts = allInjuries.filter(i => i.mode !== 'light').map(i => i.part)
  const lightInjuries = allInjuries.filter(i => i.mode === 'light')
  const lightParts = lightInjuries.map(i => i.part)

  // Determine what body parts are affected (Remove)
  const skipLowerBody = removeParts.some(i => ['knee', 'shin', 'ankle', 'hamstring', 'calf', 'hip', 'lower back'].includes(i))
  const skipUpperBodyPush = removeParts.some(i => ['shoulder', 'elbow', 'wrist', 'neck', 'chest'].includes(i))
  const skipUpperBodyPull = removeParts.some(i => ['shoulder', 'elbow', 'wrist', 'back'].includes(i))

  // Determine what body parts are affected (Light)
  const skipLightLowerBody = lightParts.some(i => ['knee', 'shin', 'ankle', 'hamstring', 'calf', 'hip', 'lower back'].includes(i))
  const skipLightUpperBodyPush = lightParts.some(i => ['shoulder', 'elbow', 'wrist', 'neck', 'chest'].includes(i))
  const skipLightUpperBodyPull = lightParts.some(i => ['shoulder', 'elbow', 'wrist', 'back'].includes(i))

  // Handle "Remove" Injuries
  if (skipLowerBody) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('squat') &&
      !ex.name.toLowerCase().includes('lunge') &&
      !ex.name.toLowerCase().includes('jump') &&
      !ex.name.toLowerCase().includes('calf')
    )
    if (clone.title?.includes('Leg') || clone.title?.includes('Lower') || clone.label?.includes('Leg'))
      clone.exercises.push(...JSON.parse(JSON.stringify(LIGHT_ALTERNATIVES.lowerBody)))
  } else if (skipLightLowerBody) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('pistol') &&
      !ex.name.toLowerCase().includes('jump')
    )
    if (clone.title?.includes('Leg') || clone.title?.includes('Lower') || clone.label?.includes('Leg')) {
      const added = LIGHT_ALTERNATIVES.lowerBody.filter(a => !clone.exercises.some(e => e.name === a.name))
      clone.exercises.push(...JSON.parse(JSON.stringify(added.slice(0, 2))))
    }
  }

  if (skipUpperBodyPush) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('push-up') &&
      !ex.name.toLowerCase().includes('dip') &&
      !ex.name.toLowerCase().includes('burpee') &&
      !ex.name.toLowerCase().includes('handstand')
    )
    if (clone.title?.includes('Push') || clone.title?.includes('Upper'))
      clone.exercises.push(...JSON.parse(JSON.stringify(LIGHT_ALTERNATIVES.upperPush)))
  } else if (skipLightUpperBodyPush) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('dip') &&
      !ex.name.toLowerCase().includes('handstand') &&
      !ex.name.toLowerCase().includes('pike') &&
      !ex.name.toLowerCase().includes('burpee')
    )
    if (clone.title?.includes('Push') || clone.title?.includes('Upper')) {
      const added = LIGHT_ALTERNATIVES.upperPush.filter(a => !clone.exercises.some(e => e.name === a.name))
      clone.exercises.push(...JSON.parse(JSON.stringify(added.slice(0, 2))))
    }
  }

  if (skipUpperBodyPull) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('pull-up') &&
      !ex.name.toLowerCase().includes('chin-up') &&
      !ex.name.toLowerCase().includes('row')
    )
    if (clone.title?.includes('Pull') || clone.title?.includes('Upper'))
      clone.exercises.push(...JSON.parse(JSON.stringify(LIGHT_ALTERNATIVES.upperPull)))
  } else if (skipLightUpperBodyPull) {
    clone.exercises = clone.exercises.filter(ex =>
      !ex.name.toLowerCase().includes('wide') &&
      !ex.name.toLowerCase().includes('negative')
    )
    if (clone.title?.includes('Pull') || clone.title?.includes('Upper')) {
      const added = LIGHT_ALTERNATIVES.upperPull.filter(a => !clone.exercises.some(e => e.name === a.name))
      clone.exercises.push(...JSON.parse(JSON.stringify(added.slice(0, 2))))
    }
  }

  // Handle "Light" Injuries (Reduce sets, cap at 3, mark with ⚠️)
  const isLightAlternative = (name) => {
    return LIGHT_ALTERNATIVES.lowerBody.some(l => l.name === name) ||
           LIGHT_ALTERNATIVES.upperPush.some(l => l.name === name) ||
           LIGHT_ALTERNATIVES.upperPull.some(l => l.name === name)
  }

  lightInjuries.forEach(inj => {
    clone.exercises.forEach(ex => {
      if (isExerciseRelatedToPart(ex.name, inj.part) && !isLightAlternative(ex.name)) {
        if (!ex.name.includes('⚠️')) {

          // Cap sets to max 3
          if (typeof ex.sets === 'number') {
            ex.sets = Math.min(ex.sets - 1, 3)
            if (ex.sets < 2) ex.sets = 2
          }
          ex.name = '⚠️ ' + ex.name
          ex.desc = '⚠️ INJURY MODE — Reduced sets. Focus on slow, pain-free tempo. ' + ex.desc
        }
      }
    })
  })

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
