import { useState, useMemo, useRef, useCallback } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import { formatDateStandard, parseStoredDate, toLocalDateStr } from '../../utils/dateUtils'
import styles from './DailyReportPage.module.css'

// Helper: get today's weekday label
function getTodayLabel() {
  return formatDateStandard(new Date())
}


// Helper: get the last 7 logged weights sequentially (no calendar gaps)
function getRecentWeightData(weightHistory) {
  const sorted = [...(weightHistory || [])].sort((a,b) => parseStoredDate(a.date) - parseStoredDate(b.date))
  
  // Deduplicate by date — keep only the latest entry per day
  const unique = []
  const seenDates = new Set()
  for (let i = sorted.length - 1; i >= 0; i--) {
    const dateKey = toLocalDateStr(sorted[i].date)
    if (!seenDates.has(dateKey)) {
      seenDates.add(dateKey)
      unique.unshift(sorted[i])
    }
  }
  
  const recent = unique.slice(-7)
  const today = new Date()
  
  const days = recent.map(entry => {
    const d = parseStoredDate(entry.date)
    const label = d.toLocaleDateString('en-US', { weekday: 'short' })
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
    
    return { label, value: parseFloat(entry.weight), isToday }
  })

  // Pad with empty days at the start if less than 7
  while (days.length < 7) {
    days.unshift({ label: '—', value: null, isToday: false })
  }
  
  return days
}

// Helper: compute streak accurately
function computeStreak(workoutHistory = []) {
  if (!workoutHistory.length) return 0
  const dates = [...new Set(workoutHistory.map(w => {
    const d = parseStoredDate(w.date || w.timestamp)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }))].sort().reverse()
  
  let streak = 0
  let cur = new Date(); cur.setHours(0,0,0,0)
  
  for (const ds of dates) {
    const [year, month, day] = ds.split('-')
    const d = new Date(year, month - 1, day)
    d.setHours(0,0,0,0)
    
    const diffDays = Math.round((cur - d) / 86400000)
    if (diffDays <= 1) { 
      if (diffDays === 1 || streak === 0) streak++; 
      cur = d 
    } else break
  }
  return streak
}

// Helper: get streak badge label based on 7-day tiers
function getStreakBadge(streak) {
  if (streak >= 28) return 'Legend'
  if (streak >= 21) return 'Master'
  if (streak >= 14) return 'Elite'
  if (streak >= 7)  return 'Rising'
  return 'Beginner'
}

/* ── Bar Chart ── */
function WeightBarChart({ data }) {
  const values = data.map(d => d.value).filter(v => v !== null)
  const min = values.length ? Math.min(...values) - 1 : 60
  const max = values.length ? Math.max(...values) + 1 : 100
  const range = max - min || 1

  return (
    <div className={styles.barChart}>
      {data.map((day, i) => {
        const pct = day.value !== null ? ((day.value - min) / range) * 70 + 10 : 0
        return (
          <div key={i} className={styles.barCol}>
            <div className={styles.barWrap}>
              {day.value !== null && (
                <div className={`${styles.barTooltip} ${day.isToday ? styles.barTooltipToday : ''}`}>
                  {day.value} kg
                </div>
              )}
              {day.value !== null
                ? <div className={`${styles.bar} ${day.isToday ? styles.barToday : ''}`} style={{ height: `${pct}%` }} />
                : <div className={styles.barEmpty} />
              }
            </div>
            <span className={`${styles.barLabel} ${day.isToday ? styles.barLabelToday : ''}`}>{day.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Log Weight Modal ── */
function LogWeightModal({ currentWeight, onLog, onClose }) {
  const [value, setValue] = useState(currentWeight || '')
  const handle = () => {
    const w = parseFloat(value)
    if (!isNaN(w) && w > 0) { onLog(w); onClose() }
  }
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={e => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Log Today's Weight</h3>
        <input
          type="number"
          step="0.1"
          className={styles.modalInput}
          placeholder="e.g. 74.5"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <div className={styles.modalBtns}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={handle}>Log Weight</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────
   MAIN PAGE
   ───────────────────────────── */
export default function DailyReportPage() {
  const { appData, setAppData } = useApp()
  const navigate = useNavigate()
  const [showLogWeight, setShowLogWeight] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [popupMsg, setPopupMsg] = useState(null)
  const [popupType, setPopupType] = useState('success')
  const [posterDataUrl, setPosterDataUrl] = useState('')
  const canvasRef = useRef(null)

  const { weightHistory = [], workoutHistory = [], longestStreak = 0, profile = {}, allExerciseReps = [] } = appData

  const streak = useMemo(() => computeStreak(workoutHistory), [workoutHistory])
  const last7 = useMemo(() => getRecentWeightData(weightHistory), [weightHistory])
  const todayWeight = last7.find(d => d.isToday)?.value ?? null
  
  const targetDateIso = useMemo(() => {
    const todayKey = toLocalDateStr(new Date())
    
    const hasWorkoutToday = workoutHistory.some(w => {
      return toLocalDateStr(w.date || w.timestamp) === todayKey
    })
    
    if (hasWorkoutToday) return todayKey
    
    // If no workout today, find the most recent one
    if (workoutHistory.length > 0) {
      const lastWorkout = workoutHistory[workoutHistory.length - 1]
      return toLocalDateStr(lastWorkout.date || lastWorkout.timestamp)
    }
    
    return todayKey
  }, [workoutHistory])

  const todayWorkouts = useMemo(() => {
    return workoutHistory.filter(w => {
      return toLocalDateStr(w.date || w.timestamp) === targetDateIso
    })
  }, [workoutHistory, targetDateIso])

  // Today's exercise list from session/workoutHistory
  const todayExercises = useMemo(() => {
    if (!todayWorkouts.length) return []
    const all = []
    todayWorkouts.forEach(w => {
      if (w.exercises) all.push(...w.exercises)
    })
    return all
  }, [todayWorkouts])

  const handleLogWeight = (w) => {
    const todayKey = toLocalDateStr(new Date())
    
    // Check if already logged today
    const alreadyLogged = weightHistory.some(x => toLocalDateStr(x.date) === todayKey)
    
    if (alreadyLogged) {
      setPopupType('error')
      setPopupMsg('User can add weight only once a day.')
      setShowLogWeight(false)
      return
    }

    const entry = { weight: w.toFixed(1), date: todayKey }
    const newHistory = [...weightHistory, entry]
    
    setAppData(prev => ({
      ...prev,
      weightHistory: newHistory,
      longestStreak: Math.max(prev.longestStreak || 0, streak),
    }))
    
    setPopupType('success')
    setPopupMsg('Weight added successfully!')
  }

  const badgeLabel = getStreakBadge(streak)
  const activeTimeDisplay = useMemo(() => {
    const totalSecs = todayWorkouts.reduce((s, w) => s + (w.totalSeconds || 0), 0)
    if (totalSecs === 0) return null
    const m = Math.floor(totalSecs / 60)
    const s = totalSecs % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }, [todayWorkouts])

  // PR Alerts: exercises with highest rep count today + PR info
  const prAlerts = useMemo(() => {
    if (!todayExercises.length) return []
    return todayExercises.slice(0, 2).map(ex => {
      const name = ex.name || ex.exercise || 'Exercise'
      const prEntry = allExerciseReps.find(a => a.name === name)
      const prValue = prEntry?.highestPR || 0
      const exVal = ex.sets ? `${ex.sets} sets` : (ex.reps ? `${ex.reps} reps` : '—')
      
      return {
        name,
        value: `Today: ${exVal} | PR: ${prValue}`
      }
    })
  }, [todayExercises, allExerciseReps])

  const drawRoundRect = (ctx, x, y, w, h, r, fill, stroke) => {
    ctx.beginPath()
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r)
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h)
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r)
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath()
    if(fill){ctx.fillStyle=fill;ctx.fill()}
    if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}
  }

  const handleShare = useCallback(() => {
    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    const w = 1080, h = 1920
    canvas.width = w; canvas.height = h
    const grad = ctx.createLinearGradient(0,0,w,h)
    grad.addColorStop(0,'#1a1a1a'); grad.addColorStop(1,'#2d1b14')
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h)
    const primary = '#ec5b13'
    ctx.fillStyle = 'white'; ctx.font = 'bold 80px "Public Sans",sans-serif'
    ctx.fillText('CaliStrength', 100, 180)
    const dateStr = formatDateStandard(new Date())
    ctx.fillStyle = primary; ctx.font = 'bold 40px "Public Sans",sans-serif'
    ctx.fillText(dateStr, 100, 260)
    ctx.fillStyle = 'white'; ctx.font = '900 85px "Public Sans",sans-serif'
    ctx.fillText('DAILY PERFORMANCE', 100, 380); ctx.fillText('SUMMARY', 100, 470)
    const stats = [
      {label:'WEIGHT',value:(todayWeight||'—')+' kg'},
      {label:'STREAK',value:badgeLabel},
      {label:'ACTIVE TIME',value:(activeTimeDisplay||'0s')},
      {label:'EXERCISES',value:String(todayExercises.length)}
    ]
    let sX=100,sY=600,cW=415,cH=200,gap=50
    stats.forEach((s,i)=>{
      const row=Math.floor(i/2),col=i%2
      const x=sX+(cW+gap)*col,y=sY+(cH+gap)*row
      drawRoundRect(ctx,x,y,cW,cH,30,'rgba(255,255,255,0.05)','rgba(255,255,255,0.1)')
      ctx.fillStyle='#94a3b8';ctx.font='bold 30px "Public Sans",sans-serif';ctx.fillText(s.label,x+40,y+70)
      ctx.fillStyle='white';ctx.font='bold 50px "Public Sans",sans-serif';ctx.fillText(s.value,x+40,y+140)
    })
    ctx.fillStyle='white';ctx.font='bold 60px "Public Sans",sans-serif';ctx.fillText("TODAY'S EXERCISES",100,1150)
    let exY=1250
    todayExercises.slice(0,6).forEach(ex=>{
      const name=ex.name||ex.exercise||'Exercise'
      const sets=ex.sets?`${ex.sets}×${ex.reps||'—'}`:(ex.reps?`${ex.reps} reps`:'—')
      ctx.fillStyle='#cbd5e1';ctx.font='40px "Public Sans",sans-serif';ctx.textAlign='left';ctx.fillText(name,100,exY)
      ctx.fillStyle=primary;ctx.textAlign='right';ctx.fillText(sets,w-100,exY);ctx.textAlign='left'
      ctx.strokeStyle='rgba(255,255,255,0.1)';ctx.beginPath();ctx.moveTo(100,exY+20);ctx.lineTo(w-100,exY+20);ctx.stroke()
      exY+=90
    })
    if(!todayExercises.length){
      ctx.fillStyle='#64748b';ctx.font='40px "Public Sans",sans-serif';ctx.fillText('No workouts logged today',100,1250)
    }
    ctx.fillStyle='#64748b';ctx.font='bold 35px "Public Sans",sans-serif';ctx.textAlign='center'
    ctx.fillText('CALISTRENGTH — MASTER YOUR BODY',w/2,h-100);ctx.textAlign='left'
    setPosterDataUrl(canvas.toDataURL('image/jpeg',0.9))
    setShowShareModal(true)
  },[todayWeight,badgeLabel,activeTimeDisplay,todayExercises])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.download = `CaliStrength_Report_${new Date().toISOString().split('T')[0]}.jpg`
    link.href = canvasRef.current.toDataURL('image/jpeg',0.9)
    link.click()
  }

  const handleNativeShare = async () => {
    try {
      const blob = await(await fetch(canvasRef.current.toDataURL('image/jpeg',0.9))).blob()
      const file = new File([blob],'DailyReport.jpg',{type:'image/jpeg'})
      if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:'CaliStrength Report',text:'Check out my training report! 🔥'})
      } else {
        handleDownload()
      }
    } catch { handleDownload() }
  }

  return (
    <>
      <AppHeader
        icon="summarize"
        title="Daily Report"
        right={
          <div className={styles.headerExtra}>
            <div className={styles.streakPill}>
              <span className="material-symbols-outlined">local_fire_department</span>
              <span><span className={styles.streakCount}>{streak}</span> Day Streak</span>
            </div>
            <button className={styles.shareBtn} onClick={handleShare}>
              <span className="material-symbols-outlined">share</span>Share
            </button>
          </div>
        }
      />

      <div className={styles.contentInner}>
        {/* Page Intro */}
        <div className={styles.pageIntro}>
          <p className={styles.introLabel}>Performance Insight</p>
          <h1 className={styles.introTitle}>Daily Report</h1>
          <p className={styles.introSub}>{getTodayLabel()} — {badgeLabel}</p>
        </div>

        {/* Mobile-only streak + share strip (hidden on desktop) */}
        <div className={styles.mobileHeaderStrip}>
          <div className={styles.streakPill}>
            <span className="material-symbols-outlined">local_fire_department</span>
            <span><span className={styles.streakCount}>{streak}</span> Day Streak</span>
          </div>
          <button className={styles.shareBtn} onClick={handleShare}>
            <span className="material-symbols-outlined">share</span>Share
          </button>
        </div>

        {/* Summary Cards */}
        <div className={`${styles.summaryGrid} animateFadeUp delay1`}>
          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Active Time</p>
            <div className={styles.summaryValue}>
              <span className={styles.summaryNum}>{activeTimeDisplay || '—'}</span>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <p className={styles.summaryLabel}>Exercises Done</p>
            <div className={styles.summaryValue}>
              <span className={styles.summaryNum}>{todayExercises.length || '—'}</span>
              {todayExercises.length > 0 && <span className={styles.summaryUnit}>exercises</span>}
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={styles.summaryCardTop}>
              <p className={styles.summaryLabel}>Weight</p>
              <button className={styles.logNewBtn} onClick={() => setShowLogWeight(true)}>Log New</button>
            </div>
            <div className={styles.summaryValue}>
              <span className={styles.summaryNum}>{todayWeight ?? '—'}</span>
              {todayWeight && <span className={styles.summaryUnit}>kg</span>}
            </div>
          </div>

          <div className={`${styles.summaryCard} ${styles.streakCard}`}>
            <p className={styles.summaryLabelMuted}>STREAK STATUS</p>
            <div className={styles.summaryValue}>
              <span className="material-symbols-outlined" style={{ color: '#ffc800', fontSize: '2rem' }}>military_tech</span>
              <span className={styles.streakBadgeLabel}>{badgeLabel}</span>
            </div>
            <p className={styles.summarySub}>Best: <span>{Math.max(longestStreak, streak)}</span> days</p>
          </div>
        </div>

        {/* Weight Chart + PR Alerts */}
        <div className={`${styles.insightsGrid} animateFadeUp delay2`}>
          {/* Weight Trend */}
          <div className={`${styles.reportCard} ${styles.insightsMain}`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined">monitoring</span>
              <h3>7-Day Weight Trend</h3>
            </div>
            <WeightBarChart data={last7} />
          </div>

          {/* PR Alerts */}
          <div className={`${styles.reportCard} ${styles.prCard}`}>
            <div className={styles.prBgIcon}>
              <span className="material-symbols-outlined">military_tech</span>
            </div>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined">stars</span>
              <h3>PR Alerts</h3>
            </div>
            <div className={styles.prList}>
              {prAlerts.length > 0 ? prAlerts.map((pr, i) => (
                <div key={i} className={styles.prItem}>
                  <div className={`${styles.prItemIcon} ${i === 0 ? styles.prIconGreen : styles.prIconPrimary}`}>
                    <span className="material-symbols-outlined">{i === 0 ? 'timer' : 'reorder'}</span>
                  </div>
                  <div className={styles.prItemInfo}>
                    <p className={styles.prItemLabel}>{pr.name}</p>
                    <p className={styles.prItemValue}>{pr.value}</p>
                  </div>
                </div>
              )) : (
                <div className={styles.prEmpty}>
                  <span className="material-symbols-outlined">fitness_center</span>
                  <p>Complete a workout today to see PR alerts here!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Today's Exercises + Tomorrow's Preview */}
        <div className={`${styles.bottomGrid} animateFadeUp delay3`}>
          {/* Today's Exercises */}
          <div className={`${styles.reportCard} ${styles.exercisesCard}`}>
            <div className={styles.cardHeader}>
              <span className="material-symbols-outlined">list_alt</span>
              <h3>Today's Exercises</h3>
            </div>
            {todayExercises.length > 0 ? (
              <div className={styles.exercisesTwoCol}>
                {todayExercises.map((ex, i) => (
                  <div key={i} className={styles.exRow}>
                    <span className={styles.exName}>{ex.name || ex.exercise || 'Exercise'}</span>
                    <span className={styles.exSets}>
                      {ex.sets ? `${ex.sets}×${ex.reps || '—'}` : (ex.reps ? `${ex.reps} reps` : '—')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.noWorkout}>
                <span className="material-symbols-outlined">fitness_center</span>
                <p>No workout logged today yet.</p>
                <button className={styles.goWorkoutBtn} onClick={() => navigate('/workout')}>
                  Start Workout <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            )}
          </div>

          {/* Tomorrow's Preview */}
          <div className={`${styles.reportCard} ${styles.tomorrowCard}`}>
            <p className={styles.tomorrowLabel}>Tomorrow's Focus</p>
            <div className={styles.tomorrowContent}>
              <div className={styles.tomorrowIconWrap}>
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
              <div>
                <p className={styles.tomorrowTitle}>Keep Pushing Forward</p>
                <p className={styles.tomorrowDesc}>
                  Consistency is key. Plan tomorrow's session to stay on track with your goals.
                </p>
              </div>
            </div>
            <button className={styles.tomorrowBtn} onClick={() => navigate('/workout')}>
              Plan Workout
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* Log Weight Modal */}
      {showLogWeight && (
        <LogWeightModal
          currentWeight={todayWeight}
          onLog={handleLogWeight}
          onClose={() => setShowLogWeight(false)}
        />
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className={styles.shareOverlay} onClick={() => setShowShareModal(false)}>
          <div className={styles.shareContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.shareHeader}>
              <span className={styles.shareTitle}>Share Report Preview</span>
              <button className={styles.shareCloseBtn} onClick={() => setShowShareModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.sharePreview}>
              <p className={styles.sharePreviewHint}>Previewing your daily performance poster.</p>
              {posterDataUrl && (
                <img src={posterDataUrl} alt="Report Poster" className={styles.sharePosterImg} />
              )}
            </div>
            <div className={styles.shareActions}>
              <button className={styles.shareActionBtn} onClick={handleNativeShare}>
                <span className="material-symbols-outlined">ios_share</span>Share Pic
              </button>
              <button className={`${styles.shareActionBtn} ${styles.shareDownloadBtn}`} onClick={handleDownload}>
                <span className="material-symbols-outlined">download</span>Save to Gallery
              </button>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={1080} height={1920} style={{display:'none'}} />

      {/* POPUP MODAL */}
      {popupMsg && (
        <div className={styles.popupOverlay} onClick={() => setPopupMsg(null)}>
          <div className={styles.popupModal} onClick={e => e.stopPropagation()}>
            <div className={styles.popupIcon} style={{ color: popupType === 'success' ? '#22c55e' : '#ef4444' }}>
              <span className="material-symbols-outlined">{popupType === 'success' ? 'check_circle' : 'error'}</span>
            </div>
            <h3>{popupType === 'success' ? 'Success' : 'Notice'}</h3>
            <p>{popupMsg}</p>
            <button onClick={() => setPopupMsg(null)} className={styles.popupBtn}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}
