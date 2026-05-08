import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// ─── Default data shape (mirrors caliStrengthData) ────────────────────────
const DEFAULT_DATA = {
  goal: null,
  targetDays: 30,
  startDate: null,
  weightHistory: [],
  workouts: [],
  workoutHistory: [],
  workoutRepsPerDay: [],
  workoutHoursPerDay: [],
  allExerciseReps: [],
  skills: { ongoing: [], completed: [] },
  targetweight: 75,
  longestStreak: 0,
  restTime: 30,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  profile: { name: 'User', email: '', phone: '', dob: '', role: 'Athlete', avatar: '', bio: '' },
}

const STORAGE_KEY = 'caliStrengthData'
const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken() {
  return localStorage.getItem('cs_token')
}

function loadLocalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_DATA, ...parsed }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

function saveLocalData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ── Merge MySQL data on top of local data ─────────────────────────────────────
// MySQL is authoritative for workoutHistory, weightHistory, allExerciseReps, and profile fields.
// Everything else (theme, skills UI state) stays in localStorage.
function mergeRemoteIntoLocal(local, remote) {
  const merged = { ...local }

  if (remote.weightHistory?.length > 0) {
    merged.weightHistory = remote.weightHistory
  }
  if (remote.workoutHistory?.length > 0) {
    merged.workoutHistory = remote.workoutHistory
    // Rebuild workoutRepsPerDay and workoutHoursPerDay from history
    merged.workoutRepsPerDay = remote.workoutHistory.map(w => ({
      date: w.date,
      reps: w.totalReps || 0,
    }))
    merged.workoutHoursPerDay = remote.workoutHistory.map(w => ({
      date: w.date,
      seconds: w.totalSeconds || 0,
      minutes: Math.floor((w.totalSeconds || 0) / 60),
    }))

    // Compute longestStreak from workout history dates
    const uniqueDates = [...new Set(remote.workoutHistory.map(w => w.date))].sort()
    let longest = 0, current = 0, prevDate = null
    for (const ds of uniqueDates) {
      const d = new Date(ds); d.setHours(0,0,0,0)
      if (!prevDate) { current = 1 }
      else {
        const diff = (d - prevDate) / 86400000
        if (diff === 1) current++
        else if (diff > 1) current = 1
      }
      if (current > longest) longest = current
      prevDate = d
    }
    merged.longestStreak = Math.max(merged.longestStreak || 0, longest)
  }

  // allExerciseReps from backend (records + exercises)
  if (remote.allExerciseReps?.length > 0) {
    merged.allExerciseReps = remote.allExerciseReps
  }

  // Profile fields from /auth/me
  if (remote.profile) {
    merged.profile = { ...merged.profile, ...remote.profile }
    if (remote.profile.goal)          merged.goal = remote.profile.goal
    if (remote.profile.experience)    merged.level = remote.profile.experience
    if (remote.profile.startDate)     merged.startDate = remote.profile.startDate
    if (remote.profile.targetWeight)  merged.profile.targetWeight = remote.profile.targetWeight
    if (remote.profile.restTime != null) merged.restTime = remote.profile.restTime
  }

  return merged
}

// ── Fetch all user data from MySQL in one burst ───────────────────────────────
async function fetchRemoteData() {
  const token = getToken()
  if (!token) return null

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }

  try {
    const [meRes, workoutsRes, weightRes, recordsRes] = await Promise.all([
      fetch(`${API}/auth/me`,             { headers }),
      fetch(`${API}/workouts/history`,    { headers }),
      fetch(`${API}/weight`,             { headers }),
      fetch(`${API}/records`,            { headers }),
    ])

    const me       = meRes.ok       ? await meRes.json()       : null
    const workouts = workoutsRes.ok ? await workoutsRes.json() : []
    const weight   = weightRes.ok   ? await weightRes.json()   : []
    const records  = recordsRes.ok  ? await recordsRes.json()  : []

    // Normalize workout history: snake_case → camelCase
    const normalizedHistory = workouts.map(w => ({
      id:             w.id,
      date:           w.date,
      totalSeconds:   w.total_seconds || w.totalSeconds || 0,
      totalReps:      w.total_reps || w.totalReps || 0,
      caloriesBurned: w.calories_burned || w.caloriesBurned || 0,
      label:          w.label || w.split || 'Workout',
      split:          w.split || '',
      duration:       Math.floor((w.total_seconds || w.totalSeconds || 0) / 60),
      exercises:      (w.exercises || []).map(e => ({
        name:       e.exercise_name || e.name || '',
        category:   e.category || '',
        totalReps:  e.total_reps || e.totalReps || 0,
        setsData:   e.sets_data || e.setsData || null,
      })),
    }))

    // Build allExerciseReps from backend records + workout exercises
    const exerciseMap = {}

    // Seed from personal records
    for (const r of records) {
      const name = r.exercise_name || r.name
      if (!name) continue
      exerciseMap[name] = {
        name,
        highestPR: r.max_reps || 0,
        totalReps: 0,
        sessions: 0,
      }
    }

    // Enrich from workout history exercises
    for (const w of normalizedHistory) {
      for (const e of w.exercises) {
        if (!e.name) continue
        if (!exerciseMap[e.name]) {
          exerciseMap[e.name] = { name: e.name, highestPR: 0, totalReps: 0, sessions: 0 }
        }
        exerciseMap[e.name].totalReps += (e.totalReps || 0)
        exerciseMap[e.name].sessions += 1
        if ((e.totalReps || 0) > exerciseMap[e.name].highestPR) {
          exerciseMap[e.name].highestPR = e.totalReps
        }
      }
    }

    const allExerciseReps = Object.values(exerciseMap)

    return {
      profile: me ? {
        name:          me.name,
        email:         me.email,
        avatar:        me.avatar,
        bio:           me.bio,
        phone:         me.phone,
        role:          me.role,
        goal:          me.goal,
        startDate:     me.start_date,
        targetWeight:  me.target_weight,
        restTime:      me.rest_time,
        theme:         me.theme,
        is_onboarded:  me.is_onboarded,
        age:           me.age,
        height:        me.height_cm,
        gender:        me.gender,
        experience:    me.experience,
      } : null,
      workoutHistory: normalizedHistory,
      allExerciseReps,
      // Backend returns { date, weight_kg } — normalize to { date, weight }
      weightHistory: weight.map(w => ({
        date: w.date,
        weight: w.weight_kg != null ? String(w.weight_kg) : (w.weight || '0'),
      })),
    }
  } catch (err) {
    console.warn('[AppContext] Could not fetch from MySQL backend:', err.message)
    return null
  }
}

// ─── Context ──────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Start from localStorage, then hydrate from MySQL
  const [appData, setAppDataRaw] = useState(() => loadLocalData())
  const [dbLoaded, setDbLoaded] = useState(false)

  // Theme — will be updated after remote fetch if backend has a saved theme
  const [theme, setThemeRaw] = useState(
    () => localStorage.getItem('calistrength-theme') || 'dark'
  )

  // Stable helper to apply theme to DOM + state
  const applyTheme = (t) => {
    setThemeRaw(t)
    localStorage.setItem('calistrength-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  // On mount: fetch from MySQL and merge
  useEffect(() => {
    fetchRemoteData().then(remote => {
      if (remote) {
        setAppDataRaw(prev => {
          const merged = mergeRemoteIntoLocal(prev, remote)
          saveLocalData(merged)
          return merged
        })
        // Apply theme from backend if present
        if (remote.profile?.theme) {
          applyTheme(remote.profile.theme)
        }
      }
      setDbLoaded(true)
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setAppData = useCallback((updater) => {
    setAppDataRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveLocalData(next)
      return next
    })
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeRaw(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('calistrength-theme', next)
      document.documentElement.setAttribute('data-theme', next)
      return next
    })
  }, [])

  // Skills (separate localStorage key)
  const [skillsData, setSkillsDataRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem('caliSkills')) || { ongoing: [], mastered: [], nextSkill: null } }
    catch { return { ongoing: [], mastered: [], nextSkill: null } }
  })
  const setSkillsData = useCallback((updater) => {
    setSkillsDataRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('caliSkills', JSON.stringify(next))
      return next
    })
  }, [])

  // Workout Session
  const [session, setSessionRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_session_progress')) || null }
    catch { return null }
  })
  const setSession = useCallback((updater) => {
    setSessionRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (next) localStorage.setItem('cs_session_progress', JSON.stringify(next))
      else localStorage.removeItem('cs_session_progress')
      return next
    })
  }, [])

  // UI State
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [isNotifOpen, setNotifOpen] = useState(false)

  // Read Notifications
  const [readNotifications, setReadNotificationsRaw] = useState(() => {
    try { return JSON.parse(localStorage.getItem('caliReadNotifs')) || [] }
    catch { return [] }
  })
  const setReadNotifications = useCallback((updater) => {
    setReadNotificationsRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem('caliReadNotifs', JSON.stringify(next))
      return next
    })
  }, [])

  const value = {
    appData,
    setAppData,
    dbLoaded,
    theme,
    toggleTheme,
    setTheme: applyTheme,
    skillsData,
    setSkillsData,
    session,
    setSession,
    isSidebarOpen,
    setSidebarOpen,
    isSearchOpen,
    setSearchOpen,
    isNotifOpen,
    setNotifOpen,
    readNotifications,
    setReadNotifications,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
