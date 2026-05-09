import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { getTailoredWorkout } from '../../data/workoutData'
import { filterWorkoutExercises } from '../../data/injuryFilter'
import styles from './OverviewPage.module.css'
import { computeNotifications } from '../../components/ui/NotificationsPanel'
import { parseStoredDate } from '../../utils/dateUtils'
import { getTodaySplitKey, getDayNumber } from '../../utils/workoutSplitUtils'
import { formatRepsDisplay, isHoldExercise } from '../../utils/exerciseUtils'

/* ─── Helpers ─── */

function getTodaySplit(appData) {
  const customPlan = getTailoredWorkout(appData)
  const splitKey = getTodaySplitKey(appData)
  const rawSplit = customPlan[splitKey] || customPlan.push
  return filterWorkoutExercises(rawSplit)
}



function computeStreak(workoutHistory = []) {
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
  
  // If today is Sunday, skip it (rest day)
  if (check.getDay() === 0) check.setDate(check.getDate() - 1)

  // If today hasn't been worked out yet, check if yesterday (or last non-Sunday) was
  const todayStr = `${check.getFullYear()}-${String(check.getMonth() + 1).padStart(2, '0')}-${String(check.getDate()).padStart(2, '0')}`
  if (!workedDates.has(todayStr)) {
    // Allow today to not be done yet — step back one day
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

function getWeeklyProgress(workoutHistory = []) {
  const total = 6 // 6 sessions per week (Mon–Sat)
  const today = new Date()
  const dow = today.getDay()
  
  // If today is Sunday, refresh the donut to 0 for the upcoming week
  if (dow === 0) {
    return { total, done: 0, pct: 0 }
  }

  // Find Monday of the current week
  const monday = new Date(today)
  monday.setDate(today.getDate() - (dow - 1))
  monday.setHours(0,0,0,0)

  // Find Saturday of the current week
  const saturday = new Date(monday)
  saturday.setDate(monday.getDate() + 5)
  saturday.setHours(23,59,59,999)

  // Count unique days worked out this week (Mon to Sat)
  const uniqueDaysDone = new Set()

  workoutHistory.forEach(w => {
    const d = parseStoredDate(w.date || w.timestamp)
    // Only count if it's between Mon-Sat and not a Sunday
    if (d >= monday && d <= saturday && d.getDay() !== 0) {
      uniqueDaysDone.add(d.toDateString())
    }
  })

  const done = uniqueDaysDone.size
  const capped = Math.min(done, total)
  return { total, done: capped, pct: Math.round((capped / total) * 100) }
}

/* ─── Sub-components ─── */

function StatCard({ icon, label, value, badge, to }) {
  const navigate = useNavigate()
  return (
    <div className={styles.statCard} onClick={() => to && navigate(to)} style={to ? { cursor: 'pointer' } : {}}>
      <div className={styles.statIconWrap}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className={styles.statInfo}>
        <p className={styles.statLabel}>{label}</p>
        <div className={styles.statValueRow}>
          <h3 className={styles.statValue}>{value}</h3>
          {badge && <span className={`${styles.badge} ${styles[badge.type]}`}>{badge.content}</span>}
        </div>
      </div>
    </div>
  )
}

function SessionCard({ workout, goal }) {
  const navigate = useNavigate()
  const exercises = workout?.exercises?.slice(0, 5) || []

  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionHeader}>
        <h4>Today's Session</h4>
        <span className={styles.tagPill}>{workout?.label || 'Loading...'}</span>
      </div>
      <div className={styles.sessionBody}>
        <div className={styles.sessionMeta}>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined">schedule</span>
            <span>{workout?.duration || '—'} mins</span>
          </div>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined">fitness_center</span>
            <span>{workout?.exercises?.length || 0} Exercises</span>
          </div>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined">bolt</span>
            <span>{workout?.intensity || '—'} Intensity</span>
          </div>
        </div>
        <div className={styles.exerciseList}>
          {exercises.map((ex, i) => (
            <div
              key={i}
              className={styles.exerciseItem}
              onClick={() => navigate('/workout')}
            >
              <div className={styles.exerciseInfo}>
                <div className={styles.exerciseNumber}>{i + 1}</div>
                <div className={styles.exerciseDetails}>
                  <p>{ex.name}</p>
                  <p>{ex.sets} Sets × {formatRepsDisplay(ex.name, ex.reps)}</p>
                </div>
              </div>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>chevron_right</span>
            </div>
          ))}
          {exercises.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', padding: '1rem 0' }}>
              No exercises scheduled today.
            </p>
          )}
        </div>
        <button className={styles.btnStartSession} onClick={() => navigate('/workout')}>
          <span className="material-symbols-outlined">play_arrow</span>
          Start Session
        </button>
      </div>
    </div>
  )
}

function NextSkillCard({ skillsData }) {
  const navigate = useNavigate()
  const state = skillsData || { ongoing: [], mastered: [], nextSkill: null }
  const nextSkillId = state.nextSkill || null
  const mastered = state.mastered || []

  const ALL_SKILLS_FLAT = [
    { id: 'pushups', name: 'Push Ups', level: 'Beginner' },
    { id: 'squats', name: 'Squats', level: 'Beginner' },
    { id: 'dead-hang', name: 'Dead Hang', level: 'Beginner' },
    { id: 'dips', name: 'Dips', level: 'Intermediate' },
    { id: 'pullups', name: 'Pull Ups', level: 'Intermediate' },
    { id: 'lsit', name: 'L-Sit', level: 'Intermediate' },
    { id: 'dragon-flag', name: 'Dragon Flag', level: 'Intermediate' },
    { id: 'handstand', name: 'Handstand', level: 'Advanced' },
    { id: 'front-lever', name: 'Front Lever', level: 'Advanced' },
    { id: 'muscle-ups', name: 'Muscle Ups', level: 'Elite' },
    { id: 'human-flag', name: 'Human Flag', level: 'Elite' },
    { id: 'full-planche', name: 'Full Planche', level: 'Elite' },
  ]

  const justMastered = nextSkillId && mastered.includes(nextSkillId)
  const skill = nextSkillId ? ALL_SKILLS_FLAT.find(s => s.id === nextSkillId) : null

  return (
    <div className={`${styles.skillNextCard} ${!nextSkillId && mastered.length > 0 ? styles.glowPulse : ''}`}>
      <span className="material-symbols-outlined" style={{ position:'absolute', right:'1rem', top:'1rem', fontSize:'3rem', color:'var(--primary)', opacity:0.12, pointerEvents:'none' }}>trending_up</span>
      <div className={styles.skillContent}>
        {justMastered ? (
          <>
            <h4 className={styles.skillTitle}><span className="material-symbols-outlined">emoji_events</span> Skill Mastered! 🎉</h4>
            <p className={styles.skillDesc}>You mastered {skill?.name}! Time to set your next goal.</p>
            <button className={styles.btnLearnSkill} onClick={() => navigate('/skills')}>🎯 Mark Next Skill</button>
          </>
        ) : !nextSkillId ? (
          <>
            <h4 className={styles.skillTitle}><span className="material-symbols-outlined">star_border</span> Next Skill: <span>Not set</span></h4>
            <p className={styles.skillDesc}>Mark a skill from the Skills page and it will appear here as your next goal.</p>
            <button className={styles.btnLearnSkill} onClick={() => navigate('/skills')}>Mark a Next Skill</button>
          </>
        ) : (
          <>
            <h4 className={styles.skillTitle}><span className="material-symbols-outlined">star</span> Next Skill: <span style={{ color:'var(--primary)' }}>{skill?.name}</span></h4>
            <p className={styles.skillDesc}>Focus on {skill?.name} — a {skill?.level} skill. Stay consistent and track your progress.</p>
            <div className={styles.skillEta}>
              <span className="material-symbols-outlined" style={{ fontSize:'0.875rem' }}>timer</span>
              {skill?.level} level
            </div>
            <button className={styles.btnLearnSkill} onClick={() => navigate('/skills')}>Train {skill?.name}</button>
          </>
        )}
      </div>
    </div>
  )
}

function WeeklyProgressCard({ pct, done, total }) {
  const radius = 58
  const circ = 2 * Math.PI * radius
  const offset = circ - (pct / 100) * circ

  let caption
  if (done === 0) caption = `${total} workout sessions this week — none completed yet. Let's go! 💪`
  else if (done === total) caption = `All ${total} sessions done this week! Crushing it 🔥`
  else caption = `${done} of ${total} sessions done — ${total - done} remaining this week.`

  return (
    <div className={styles.card}>
      <h4 className={styles.cardTitle}>Weekly Sessions</h4>
      <div className={styles.progressCircleContainer}>
        <svg className={styles.circleSvg} viewBox="0 0 128 128">
          <circle className={styles.circleBg} cx="64" cy="64" r={radius} fill="transparent" stroke="currentColor" strokeWidth="8" />
          <circle
            className={styles.circleFill}
            cx="64" cy="64" r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className={styles.progressLabels}>
          <span className={styles.progressPercent}>{pct}%</span>
          <span className={styles.progressStatus}>{pct >= 100 ? 'Complete' : 'Progress'}</span>
        </div>
      </div>
      <p className={styles.progressCaption}>{caption}</p>
    </div>
  )
}

function LatestPRsCard({ allExerciseReps = [] }) {
  const navigate = useNavigate()
  const validPRs = allExerciseReps
    .filter(e => e.highestPR && e.highestPR > 0 && !e.name?.toLowerCase().includes('stretch'))
    .sort((a, b) => b.highestPR - a.highestPR)
    .slice(0, 5)

  if (!validPRs.length) return null

  return (
    <div className={styles.card}>
      <div className={styles.prCardHeader}>
        <h4 className={styles.cardTitle}>Latest PRs</h4>
        <button className={styles.viewAllBtn} onClick={() => navigate('/records')}>View All</button>
      </div>
      <div className={styles.prList}>
          {validPRs.map((pr, i) => (
            <div key={i} className={styles.prRow}>
              <span className={styles.prName}>{pr.name}</span>
              <span className={styles.prVal}>{pr.highestPR} {isHoldExercise(pr.name) ? 'sec' : 'reps'}</span>
            </div>
          ))}
      </div>
    </div>
  )
}

/* ─── Skill Reminder Toast ─── */
function SkillToast({ skillName, onClose }) {
  return (
    <div className={styles.toast}>
      <div className={styles.toastIcon}>
        <span className="material-symbols-outlined">fitness_center</span>
      </div>
      <div className={styles.toastBody}>
        <div className={styles.toastLabel}>Skill Reminder</div>
        <div className={styles.toastMsg}>
          Don't forget to train your <strong>{skillName}</strong> skill today! Keep pushing your limits.
        </div>
      </div>
      <button className={styles.toastClose} onClick={onClose}>
        <span className="material-symbols-outlined">close</span>
      </button>
    </div>
  )
}

/* ══════════════════════════════════
   MAIN OVERVIEW PAGE
   ══════════════════════════════════ */
export default function OverviewPage() {
  const { appData, skillsData, setNotifOpen } = useApp()
  const navigate = useNavigate()

  const {
    profile = {},
    workoutHistory = [],
    workouts = [],
    weightHistory = [],
    longestStreak = 0,
    allExerciseReps = [],
    goal = 'gain',
    startDate,
  } = appData

  const { readNotifications = [] } = useApp()

  // Compute unread notification count
  const notifCount = useMemo(() => {
    if (!appData) return 0
    const allNotifs = computeNotifications(appData)
    const unreadCount = allNotifs.filter(n => !readNotifications.includes(n.id)).length
    return Math.min(unreadCount, 9)
  }, [appData, readNotifications])

  // Stats
  const currentWeight = weightHistory.at(-1)?.weight ?? '—'
  const streak = useMemo(() => computeStreak(workoutHistory), [workoutHistory])
  const dayNumber = useMemo(() => getDayNumber(appData), [appData])

  // Weight trend badge
  const weightBadge = useMemo(() => {
    if (weightHistory.length < 2) return null
    const last = weightHistory.at(-1)?.weight
    const prev = weightHistory.at(-2)?.weight
    if (!last || !prev) return null
    
    const diff = (last - prev).toFixed(1)
    if (diff === "0.0") return null

    const goalStr = (goal || 'fit').toLowerCase()
    let type = 'badgeNeu'
    let icon = 'trending_flat'

    if (diff > 0) {
      if (goalStr.includes('gain')) { type = 'badgeGreen'; icon = 'trending_up' }
      else if (goalStr.includes('lose') || goalStr.includes('loose')) { type = 'badgeRed'; icon = 'trending_up' }
      else { type = 'badgeGreen'; icon = 'trending_up' }
    } else if (diff < 0) {
      if (goalStr.includes('gain')) { type = 'badgeRed'; icon = 'trending_down' }
      else if (goalStr.includes('lose') || goalStr.includes('loose')) { type = 'badgeGreen'; icon = 'trending_down' }
      else { type = 'badgeYellow'; icon = 'trending_down' }
    }

    return {
      type,
      content: <><span className="material-symbols-outlined" style={{ fontSize:'0.875rem' }}>{icon}</span>{Math.abs(diff)}%</>
    }
  }, [weightHistory, goal])

  // Injury event listener to update split immediately
  const [injuryRefreshCount, setInjuryRefreshCount] = useState(0)
  useEffect(() => {
    const handleUpdate = () => setInjuryRefreshCount(c => c + 1)
    window.addEventListener('injuryUpdate', handleUpdate)
    return () => window.removeEventListener('injuryUpdate', handleUpdate)
  }, [])

  // Today's workout
  const todayWorkout = useMemo(() => getTodaySplit(appData), [appData, injuryRefreshCount])

  // Weekly progress
  const weeklyProgress = useMemo(() => getWeeklyProgress(workoutHistory), [workoutHistory])

  // Skill toast
  const [showToast, setShowToast] = useState(false)
  const nextSkillId = skillsData?.nextSkill
  const nextSkillName = useMemo(() => {
    if (!nextSkillId) return null
    const FLAT = [
      { id:'pushups', name:'Push Ups' }, { id:'squats', name:'Squats' }, { id:'dead-hang', name:'Dead Hang' },
      { id:'dips', name:'Dips' }, { id:'pullups', name:'Pull Ups' }, { id:'lsit', name:'L-Sit' },
      { id:'dragon-flag', name:'Dragon Flag' }, { id:'handstand', name:'Handstand' },
      { id:'front-lever', name:'Front Lever' }, { id:'muscle-ups', name:'Muscle Ups' },
      { id:'human-flag', name:'Human Flag' }, { id:'full-planche', name:'Full Planche' },
    ]
    return FLAT.find(s => s.id === nextSkillId)?.name || null
  }, [nextSkillId])

  useEffect(() => {
    if (!nextSkillName) return
    const today = new Date().toDateString()
    const last = localStorage.getItem('lastSkillReminderDate')
    if (last !== today) {
      const timer = setTimeout(() => {
        setShowToast(true)
        localStorage.setItem('lastSkillReminderDate', today)
        setTimeout(() => setShowToast(false), 8000)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [nextSkillName])

  return (
    <>
      <AppHeader icon="grid_view" title="Dashboard" hideOnDesktop />

      <div className={styles.contentInner}>
        {/* Desktop Notification Bell (Absolute positioned) */}
        <div className={styles.desktopNotif}>
          <button
            className={styles.desktopNotifBtn}
            onClick={() => setNotifOpen(open => !open)}
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined">
              {notifCount > 0 ? 'notifications_active' : 'notifications'}
            </span>
            {notifCount > 0 && (
              <span className={styles.notifBadge}>{notifCount}</span>
            )}
          </button>
        </div>

        <div className={`${styles.welcomeHeader} ${styles.animateFadeUp}`}>
          <div className={styles.welcomeTitle}>
            <h2>Athlete Dashboard</h2>
            <p>Welcome back, {profile?.name || 'Athlete'} — push your limits today. 👊</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`${styles.statsGrid} ${styles.animateFadeUp} ${styles.delay1}`}>
          <StatCard
            icon="monitor_weight"
            label="Day's Weight"
            value={currentWeight !== '—' ? `${currentWeight} kg` : '— kg'}
            badge={weightBadge}
            to="/weight"
          />
          <StatCard
            icon="exercise"
            label="Workout Day"
            value={`Day ${dayNumber}`}
            badge={{ type: 'badgePrimary', content: 'Active Cycle' }}
            to="/workout"
          />
          <StatCard
            icon="local_fire_department"
            label="Current Streak"
            value={`${streak} Days`}
            badge={streak > 0 ? { type: 'badgeUp', content: <><span className="material-symbols-outlined" style={{ fontSize:'0.875rem' }}>local_fire_department</span>+{streak}</> } : null}
          />
        </div>

        {/* Main 2-col grid */}
        <div className={styles.dashboardMainGrid}>
          {/* Left: Today's Session */}
          <div className={`${styles.colSession} ${styles.animateFadeUp} ${styles.delay2}`}>
            <SessionCard workout={todayWorkout} goal={goal} />
          </div>

          {/* Right: Next Skill + Weekly Progress + PRs */}
          <div className={`${styles.colSidebar} ${styles.animateFadeUp} ${styles.delay3}`}>
            <NextSkillCard skillsData={skillsData} />
            <WeeklyProgressCard pct={weeklyProgress.pct} done={weeklyProgress.done} total={weeklyProgress.total} />
            <LatestPRsCard allExerciseReps={allExerciseReps} />
          </div>
        </div>

        {/* Mobile Footer Nav */}
        <div className={`${styles.mobileFooterNav} ${styles.animateFadeUp} ${styles.delay4}`}>
          <button className={styles.mobileFooterItem} onClick={() => navigate('/records')}>
            <span>Personal Records</span>
            <span className="material-symbols-outlined">emoji_events</span>
          </button>
          <button className={`${styles.mobileFooterItem} ${styles.mobileFooterDanger}`} onClick={() => {
            if (window.confirm('Reset all workout data? This cannot be undone.')) {
              localStorage.removeItem('cs_session_progress')
              window.location.reload()
            }
          }}>
            <span>Reset Workout</span>
            <span className="material-symbols-outlined">restart_alt</span>
          </button>
        </div>
      </div>

      {/* Skill Reminder Toast */}
      {showToast && nextSkillName && (
        <SkillToast skillName={nextSkillName} onClose={() => setShowToast(false)} />
      )}
    </>
  )
}


