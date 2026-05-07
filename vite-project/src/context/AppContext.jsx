import { createContext, useContext, useState, useCallback } from 'react'

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
  restTime: 90,
  weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
  profile: { name: 'User', email: '', phone: '', dob: '', role: 'Athlete', avatar: '', bio: '' },
}

const STORAGE_KEY = 'caliStrengthData'

function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_DATA }
    const parsed = JSON.parse(raw)
    // Patch any missing fields from old data
    return { ...DEFAULT_DATA, ...parsed }
  } catch {
    return { ...DEFAULT_DATA }
  }
}

function saveAppData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ─── Context ──────────────────────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {
  // Core app data
  const [appData, setAppDataRaw] = useState(() => loadAppData())

  const setAppData = useCallback((updater) => {
    setAppDataRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveAppData(next)
      return next
    })
  }, [])

  // Theme
  const [theme, setThemeRaw] = useState(
    () => localStorage.getItem('calistrength-theme') || 'dark'
  )
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
    appData, setAppData,
    theme, toggleTheme,
    skillsData, setSkillsData,
    session, setSession,
    isSidebarOpen, setSidebarOpen,
    isSearchOpen, setSearchOpen,
    isNotifOpen, setNotifOpen,
    readNotifications, setReadNotifications,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
