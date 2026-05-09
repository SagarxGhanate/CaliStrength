import { useState, useMemo } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import styles from './ActivityPage.module.css'
import { parseStoredDate, toLocalDateStr } from '../../utils/dateUtils'


export default function ActivityPage() {
  const { appData } = useApp()
  const { longestStreak, workoutHistory = [], workoutHoursPerDay = [] } = appData
  const [currentViewDate, setCurrentViewDate] = useState(new Date())

  // Computations for this month
  const { thisMonthHours, thisMonthExercises, computedLongestStreak } = useMemo(() => {
    let totalSeconds = 0
    let totalExercises = 0
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // 1. Calculate hours from workoutHoursPerDay
    workoutHoursPerDay.forEach(day => {
      const d = parseStoredDate(day.date)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (day.seconds && day.seconds > 0) totalSeconds += day.seconds
        else if (day.minutes) totalSeconds += day.minutes * 60
      }
    })

    // 2. Calculate exercises and fallback seconds from workoutHistory
    workoutHistory.forEach(day => {
      const d = parseStoredDate(day.date)
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        totalExercises += (day.exercises || []).length
        const alreadyCounted = workoutHoursPerDay.find(h => h.date === day.date)
        if (!alreadyCounted && day.totalSeconds) {
          totalSeconds += day.totalSeconds
        } else if (!alreadyCounted && day.duration) {
          totalSeconds += day.duration * 60
        }
      }
    })

    const mins = Math.floor(totalSeconds / 60)
    const secs = Math.floor(totalSeconds % 60)
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60

    let hoursFormatted = ''
    if (hours > 0) hoursFormatted += `${hours} hr `
    if (remainingMins > 0 || hours > 0) hoursFormatted += `${remainingMins} min `
    if (secs > 0 || totalSeconds === 0) hoursFormatted += `${secs} sec`

    hoursFormatted = hoursFormatted.trim()

    // 3. Compute actual Longest Streak
    const dates = [...new Set(workoutHistory.map(w => {
      const d = parseStoredDate(w.date || w.timestamp)
      return toLocalDateStr(d)
    }))].sort()
    
    let longest = 0
    let current = 0
    let prevDate = null

    for (const ds of dates) {
      const d = new Date(ds); d.setHours(0,0,0,0)
      if (!prevDate) {
        current = 1
      } else {
        const diffDays = (d - prevDate) / 86400000
        if (diffDays === 1) {
          current++
        } else if (diffDays > 1) {
          current = 1
        }
      }
      if (current > longest) longest = current
      prevDate = d
    }
    
    const finalLongestStreak = Math.max(longestStreak || 0, longest)

    return { thisMonthHours: hoursFormatted, thisMonthExercises: totalExercises, computedLongestStreak: finalLongestStreak }
  }, [workoutHistory, workoutHoursPerDay, longestStreak])

  // Recent Activity (last 6)
  const recentActivity = useMemo(() => {
    return [...workoutHistory].reverse().slice(0, 6).map((day, i) => {
      const exCount = (day.exercises || []).length
      const secs = day.totalSeconds || 0
      const mins = secs > 0 ? Math.max(1, Math.floor(secs / 60)) : (day.duration || 0)
      const timeStr = mins === 0 ? '—' : mins < 60 ? `${mins} min` : `${(mins / 60).toFixed(1)} hrs`
      const icons = { pull: 'vertical_align_top', push: 'fitness_center', legs: 'directions_run', rest: 'self_improvement' }
      const icon = icons[day.split] || 'fitness_center'

      return {
        id: i,
        name: day.label || 'Workout',
        date: day.date,
        exCount,
        timeStr,
        kcal: day.totalReps || 0,
        icon
      }
    })
  }, [workoutHistory])

  // Calendar Logic
  const calendarData = useMemo(() => {
    const year = currentViewDate.getFullYear()
    const month = currentViewDate.getMonth()
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthLabel = `${monthNames[month]} ${year}`

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const historyDates = workoutHistory.map(h => {
      const d = parseStoredDate(h.date)
      return d ? d.toDateString() : null
    }).filter(Boolean)

    const todayStr = new Date().toDateString()
    const cells = []

    // Padding
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', id: `empty-${i}` })
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const checkDate = new Date(year, month, d)
      const checkDateStr = checkDate.toDateString()
      const isActive = historyDates.includes(checkDateStr)
      const isToday = checkDateStr === todayStr
      cells.push({ type: 'day', day: d, isActive, isToday, id: `day-${d}` })
    }

    return { monthLabel, cells }
  }, [currentViewDate, workoutHistory])

  const nextMonth = () => setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1))
  const prevMonth = () => setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1))

  return (
    <>
      <AppHeader icon="local_fire_department" title="Activity Tracking" />
      <div className={styles.contentInner}>
        
        {/* Highlight Cards */}
        <div className={styles.highlightsGrid}>
          <div className={styles.highlightCard}>
            <div className={styles.highlightTop}>
              <span className={styles.highlightLabel}>Longest Streak</span>
              <span className={`material-symbols-outlined ${styles.highlightIcon}`}>local_fire_department</span>
            </div>
            <div className={styles.highlightValueRow}>
              <span className={styles.highlightValue}>{computedLongestStreak} Days</span>
            </div>
            <p className={styles.highlightNote}>Personal best streak</p>
          </div>

          <div className={styles.highlightCard}>
            <div className={styles.highlightTop}>
              <span className={styles.highlightLabel}>Total Hours Trained</span>
              <span className={`material-symbols-outlined ${styles.highlightIcon}`}>schedule</span>
            </div>
            <div className={styles.highlightValueRow}>
              <span className={styles.highlightValue}>{thisMonthHours}</span>
            </div>
            <p className={styles.highlightNote}>This month</p>
          </div>

          <div className={styles.highlightCard}>
            <div className={styles.highlightTop}>
              <span className={styles.highlightLabel}>Workouts Completed</span>
              <span className={`material-symbols-outlined ${styles.highlightIcon}`}>task_alt</span>
            </div>
            <div className={styles.highlightValueRow}>
              <span className={styles.highlightValue}>{thisMonthExercises} <span className={styles.highlightSub}>total exercises</span></span>
            </div>
            <p className={styles.highlightNote}>This month</p>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className={styles.bottomGrid}>
          {/* Calendar */}
          <section className={styles.calendarCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined">calendar_month</span> Monthly Activity
              </h3>
              <div className={styles.monthNav}>
                <button className={styles.navBtn} onClick={prevMonth}><span className="material-symbols-outlined">chevron_left</span></button>
                <span className={styles.monthLabel}>{calendarData.monthLabel}</span>
                <button className={styles.navBtn} onClick={nextMonth}><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>
            <div className={styles.calendarBody}>
              <div className={styles.calWeekdays}>
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div className={styles.calGrid}>
                {calendarData.cells.map(cell => {
                  if (cell.type === 'empty') return <div key={cell.id} className={`${styles.calDay} ${styles.empty}`}></div>
                  return (
                    <div key={cell.id} className={`${styles.calDay} ${cell.isActive ? styles.calActive : ''} ${cell.isToday ? styles.calToday : ''}`}>
                      {cell.day}
                      {cell.isActive && <div className={styles.calDot}></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          {/* Recent Activity */}
          <section className={styles.activityCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>
                <span className="material-symbols-outlined">history</span> Recent Activity
              </h3>
            </div>
            <div className={styles.activityList}>
              {recentActivity.length > 0 ? recentActivity.map(act => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIconWrap}>
                    <span className="material-symbols-outlined">{act.icon}</span>
                  </div>
                  <div className={styles.activityInfo}>
                    <p className={styles.activityName}>{act.name}</p>
                    <p className={styles.activityMeta}>{act.date} &bull; {act.exCount} exercise{act.exCount !== 1 ? 's' : ''}</p>
                  </div>
                  <div className={styles.activityStats}>
                    <p className={styles.activityDuration}>{act.timeStr}</p>
                    <p className={styles.activityKcal}>{act.kcal} reps</p>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>history</span>
                  <p>No activity yet.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
