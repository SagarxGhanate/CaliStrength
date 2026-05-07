import { useMemo, useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './NotificationsPanel.module.css'

/* ── Notification trigger logic (mirrors notifications.js) ── */
export function computeNotifications(appData) {
  const { workoutHistory = [], weightHistory = [], allExerciseReps = [], longestStreak = 0, profile = {}, startDate } = appData

  const notifs = []

  // 0. Weekly Performance Report
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday
  const lastSunday = new Date(now)
  lastSunday.setDate(now.getDate() - currentDay)
  lastSunday.setHours(0, 0, 0, 0)

  const weekStart = new Date(lastSunday)
  weekStart.setDate(weekStart.getDate() - 7)

  const startedBeforeSunday = workoutHistory.some(w => new Date(w.date || w.timestamp).getTime() < lastSunday.getTime())

  if (startedBeforeSunday) {
    const weekWorkouts = workoutHistory.filter(w => {
      const t = new Date(w.date || w.timestamp).getTime()
      return t >= weekStart.getTime() && t < lastSunday.getTime()
    })

    let totalReps = 0
    const muscleMap = {}
    weekWorkouts.forEach(w => {
      totalReps += (w.totalReps || 0)
      const split = (w.split || 'other').toLowerCase()
      muscleMap[split] = (muscleMap[split] || 0) + 1
    })

    const sortedMuscles = Object.entries(muscleMap).sort((a, b) => b[1] - a[1])
    const topMuscle = sortedMuscles.length > 0 ? sortedMuscles[0][0] : 'General'

    const weekWeights = weightHistory.filter(w => {
      const t = new Date(w.date || w.timestamp).getTime()
      return t >= weekStart.getTime() && t < lastSunday.getTime()
    })
    let weightDelta = 0
    if (weekWeights.length >= 2) {
      weightDelta = (weekWeights[weekWeights.length - 1].weight - weekWeights[0].weight).toFixed(1)
    }

    const skillsState = appData.skills || { masteryHistory: [] }
    const weekSkills = (skillsState.masteryHistory || []).filter(s => {
      return s.timestamp >= weekStart.getTime() && s.timestamp < lastSunday.getTime()
    }).map(s => s.name)

    const weekPRs = allExerciseReps.filter(ex => {
      if (!ex.lastPRDate) return false
      const prDate = new Date(ex.lastPRDate).getTime()
      return prDate >= weekStart.getTime() && prDate < lastSunday.getTime()
    }).map(ex => ({ name: ex.name, value: ex.highestPR }))

    let streakText = ""
    if (weekWorkouts.length >= 6) {
      streakText = "Incredible work! You hit a perfect 6/6 streak this week. You're an absolute machine, keep pushing the limits! 🚀🦾"
    } else if (weekWorkouts.length > 0) {
      streakText = `You completed ${weekWorkouts.length} sessions this week. Every workout counts toward your goal—let's aim for even more consistency next week! You've got this! 🔥`
    } else {
      streakText = "A fresh week is a fresh start. Don't wait for motivation—create momentum! Let's get back to the grind tomorrow. 💪"
    }

    notifs.push({
      id: `weekly_${lastSunday.getTime()}`,
      type: 'weekly_summary',
      icon: 'bar_chart',
      title: 'Weekly Performance Report 📊',
      message: `Hey ${profile.name || 'Athlete'}, here's your growth summary for the past 7 days.`,
      time: lastSunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      stats: {
        sessions: weekWorkouts.length,
        totalReps,
        topMuscle,
        weightDelta,
        prs: weekPRs.slice(0, 5),
        skills: weekSkills
      },
      streakText
    })
  }

  // 1. Inactivity (3+ days without workout)
  if (workoutHistory.length > 0) {
    const last = workoutHistory[workoutHistory.length - 1]
    const lastDate = new Date(last.date)
    const diffDays = Math.floor((Date.now() - lastDate.getTime()) / 86400000)
    if (diffDays >= 3) {
      notifs.push({
        id: 'inactivity',
        type: 'warning',
        icon: 'warning',
        title: `We miss you, ${profile.name || 'Athlete'}!`,
        message: `You've been inactive for ${diffDays} days. A quick 15-min session will re-ignite your momentum! 🔥`,
        time: 'Now',
      })
    }
  }

  // 2. Streak milestone
  if (longestStreak >= 7) {
    notifs.push({
      id: 'streak_' + longestStreak,
      type: 'achievement',
      icon: 'local_fire_department',
      title: `🔥 ${longestStreak}-Day Streak!`,
      message: `Your longest streak is ${longestStreak} days. Consistency builds champions. Keep pushing!`,
      time: 'Milestone',
    })
  }

  // 3. Pull-up sessions achievement
  const pullEntry = allExerciseReps.find(e => e.name?.toLowerCase().includes('pull'))
  if (pullEntry && Object.keys(pullEntry.daysLogged || {}).length >= 10) {
    notifs.push({
      id: 'iron_grip',
      type: 'achievement',
      icon: 'emoji_events',
      title: '🦾 Iron Grip Achieved!',
      message: 'You\'ve logged 10+ pull-up sessions. Your grip strength is becoming legendary.',
      time: 'Achievement',
    })
  }

  // 4. Core sessions achievement
  const coreSessions = workoutHistory.filter(w => w.split === 'core').length
  if (coreSessions >= 5) {
    notifs.push({
      id: 'core_steel',
      type: 'achievement',
      icon: 'shield',
      title: '🛡️ Core of Steel!',
      message: `${coreSessions} core sessions complete. Your midsection is bulletproof now.`,
      time: 'Achievement',
    })
  }

  // 6. No workout logged today
  const todayStr = new Date().toISOString().split('T')[0]
  const workoutToday = workoutHistory.find(w => {
    const d = new Date(w.date || w.timestamp || 0)
    return d.toISOString().split('T')[0] === todayStr
  })
  if (!workoutToday && workoutHistory.length > 0) {
    notifs.push({
      id: 'workout_today',
      type: 'reminder',
      icon: 'fitness_center',
      title: 'Today\'s Session Awaits',
      message: 'You haven\'t started today\'s workout yet. Your scheduled session is ready — let\'s go! 💪',
      time: 'Today',
    })
  }

  // 7. Welcome for brand new users
  if (workoutHistory.length === 0 && weightHistory.length <= 1) {
    notifs.push({
      id: 'welcome',
      type: 'info',
      icon: 'waving_hand',
      title: 'Welcome to CaliStrength! 🎉',
      message: 'Your journey starts today. Complete your first workout and log your weight to unlock your dashboard stats.',
      time: 'Welcome',
    })
  }

  return notifs
}

const TYPE_COLORS = {
  warning:     { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444' },
  achievement: { bg: 'rgba(236,91,19,0.12)',   color: '#ec5b13' },
  reminder:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  info:        { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  weekly_summary: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6' },
}

export default function NotificationsPanel() {
  const { appData, isNotifOpen, setNotifOpen, readNotifications, setReadNotifications } = useApp()
  const [expandedIds, setExpandedIds] = useState([])

  const notifications = useMemo(() => computeNotifications(appData), [appData])

  // Reset expanded state when drawer closes
  useEffect(() => {
    if (!isNotifOpen) {
      setExpandedIds([])
    }
  }, [isNotifOpen])

  if (!isNotifOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={() => setNotifOpen(false)} />

      {/* Drawer */}
      <div className={styles.drawer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
              notifications_active
            </span>
            <h2 className={styles.title}>Notifications</h2>
            {notifications.length > 0 && (
              <span className={styles.badge}>{notifications.length}</span>
            )}
          </div>
          <button className={styles.closeBtn} onClick={() => setNotifOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <span className="material-symbols-outlined">notifications_off</span>
              <p>You're all caught up!</p>
              <p className={styles.emptyNote}>Notifications will appear here as you log workouts and progress.</p>
            </div>
          ) : (
            notifications.map(n => {
              const col = TYPE_COLORS[n.type] || TYPE_COLORS.info
              const isRead = readNotifications.includes(n.id)
              const isExpanded = expandedIds.includes(n.id)
              
              const handleCardClick = (e) => {
                // Prevent toggling if the user is actively selecting text
                if (window.getSelection().toString().length > 0) return

                if (!isRead) {
                  setReadNotifications(prev => [...prev, n.id])
                }

                const isWeekly = n.type === 'weekly_summary'
                const isExpandBtn = e.target.closest(`.${styles.expandToggle}`)

                if (!isExpanded) {
                  // Always expand if closed
                  setExpandedIds(prev => [...prev, n.id])
                } else {
                  // If already expanded...
                  if (isWeekly) {
                    // For Weekly Report, ONLY close if they click the explicit "SHOW LESS" toggle
                    if (isExpandBtn) {
                      setExpandedIds(prev => prev.filter(id => id !== n.id))
                    }
                  } else {
                    // For normal notifications, clicking anywhere closes them
                    setExpandedIds(prev => prev.filter(id => id !== n.id))
                  }
                }
              }

              return (
                <div key={n.id} className={`${styles.card} ${!isRead ? styles.cardUnread : ''} ${isExpanded ? styles.cardExpanded : ''}`} onClick={handleCardClick}>
                  <div className={styles.cardIcon} style={{ background: col.bg, color: col.color }}>
                    <span className="material-symbols-outlined">{n.icon}</span>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardTop}>
                      <p className={styles.cardTitle}>
                        {n.title}
                        {!isRead && <span className={styles.unreadDot}></span>}
                      </p>
                      <span className={styles.cardTime}>{n.time}</span>
                    </div>
                    {n.type === 'weekly_summary' ? (
                      <div className={`${styles.weeklyContainer} ${isExpanded ? styles.weeklyExpanded : ''}`}>
                        {!isExpanded && <p className={styles.cardMsg}>{n.message}</p>}
                        
                        <div className={styles.weeklyDetails}>
                          <p className={styles.cardMsg} style={{ marginBottom: '1rem' }}>{n.message}</p>
                          
                          <div className={styles.weeklyGrid}>
                            <div className={styles.weeklyStat}>
                              <span className="material-symbols-outlined">fitness_center</span>
                              <div>
                                <span className={styles.wLabel}>SESSIONS</span>
                                <span className={styles.wValue}>{n.stats.sessions}</span>
                              </div>
                            </div>
                            <div className={styles.weeklyStat}>
                              <span className="material-symbols-outlined">rebase_edit</span>
                              <div>
                                <span className={styles.wLabel}>TOTAL REPS</span>
                                <span className={styles.wValue}>{n.stats.totalReps}</span>
                              </div>
                            </div>
                            <div className={styles.weeklyStat}>
                              <span className="material-symbols-outlined">monitoring</span>
                              <div>
                                <span className={styles.wLabel}>WEIGHT</span>
                                <span className={styles.wValue}>
                                  {n.stats.weightDelta !== 0 ? `${n.stats.weightDelta > 0 ? '+' : ''}${n.stats.weightDelta} kg` : 'Stable'}
                                </span>
                              </div>
                            </div>
                            <div className={styles.weeklyStat}>
                              <span className="material-symbols-outlined">psychology</span>
                              <div>
                                <span className={styles.wLabel}>TOP MUSCLE</span>
                                <span className={styles.wValue} style={{ textTransform: 'capitalize' }}>{n.stats.topMuscle}</span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.weeklySection}>
                            <h4 className={styles.weeklySectionTitle}>
                              <span className="material-symbols-outlined">workspace_premium</span> Weekly Achievements
                            </h4>
                            {n.stats.prs.length > 0 ? (
                              <ul className={styles.weeklyList}>
                                {n.stats.prs.map((pr, i) => (
                                  <li key={i}><span>{pr.name}</span> <span>{pr.value} reps</span></li>
                                ))}
                              </ul>
                            ) : (
                              <p className={styles.emptyList}>No new PRs this week. Keep grinding!</p>
                            )}
                          </div>

                          <div className={styles.weeklySection}>
                            <h4 className={styles.weeklySectionTitle}>
                              <span className="material-symbols-outlined">school</span> Skills Mastered
                            </h4>
                            {n.stats.skills.length > 0 ? (
                              <ul className={styles.weeklyList}>
                                {n.stats.skills.map((skill, i) => (
                                  <li key={i}><span>{skill}</span> <span>Mastered ✓</span></li>
                                ))}
                              </ul>
                            ) : (
                              <p className={styles.emptyList}>Keep training those skills!</p>
                            )}
                          </div>

                          <div className={styles.weeklySection}>
                            <h4 className={styles.weeklySectionTitle}>
                              <span className="material-symbols-outlined">bolt</span> Coach's Note
                            </h4>
                            <div className={styles.coachNote}>
                              {n.streakText}
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.expandToggle}>
                          {isExpanded ? 'SHOW LESS' : 'SHOW DETAILS'}
                          <span className="material-symbols-outlined">
                            {isExpanded ? 'expand_less' : 'expand_more'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className={`${styles.cardMsg} ${isExpanded ? styles.cardMsgExpanded : ''}`}>{n.message}</p>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerNote}>Notifications are generated from your activity data</span>
        </div>
      </div>
    </>
  )
}
