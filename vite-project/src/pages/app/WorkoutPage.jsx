import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import AppHeader from '../../components/layout/AppHeader'
import { getTailoredWorkout } from '../../data/workoutData'
import { filterWorkoutExercises } from '../../data/injuryFilter'
import RestTimerPopup from './RestTimerPopup'
import { formatDateStandard } from '../../utils/dateUtils'
import { getTodaySplitKey, getDayNumber } from '../../utils/workoutSplitUtils'
import { isHoldExercise, formatRepsDisplay, getStatLabel } from '../../utils/exerciseUtils'
import styles from './WorkoutPage.module.css'
import restCss from './RestTimerPopup.module.css'

/* ── Exercise Guides (from 2.0 workout.js) ── */
const EXERCISE_GUIDES = {
  "standard push-ups": "Step 1: Start in a high plank, hands slightly wider than shoulders.\nStep 2: Lower body until elbows are at 90°, keeping core tight.\nStep 3: Push back up until arms are fully locked.",
  "push ups": "Step 1: Start in a high plank, hands slightly wider than shoulders.\nStep 2: Lower body until elbows are at 90°, keeping core tight.\nStep 3: Push back up until arms are fully locked.",
  "incline push-ups": "Step 1: Place hands on an elevated surface (bench/chair).\nStep 2: Lower chest to the edge of the surface.\nStep 3: Push back to starting position with straight arms.",
  "decline push-ups": "Step 1: Place feet on a bench/chair, hands on floor.\nStep 2: Lower chest to floor, keeping body in a straight line.\nStep 3: Push up until arms are straight.",
  "pike push-ups": "Step 1: In a downward dog position, hips high, back straight.\nStep 2: Lower head toward the floor between your hands.\nStep 3: Push back up to the starting pike position.",
  "diamond push-ups": "Step 1: Place hands together, index fingers and thumbs touching.\nStep 2: Lower chest to your hands.\nStep 3: Push back up, focusing on tricep activation.",
  "dips": "Step 1: Grip parallel bars and support your weight with straight arms.\nStep 2: Bend elbows to lower body until shoulders are below elbows.\nStep 3: Push back up to the locked-out position.",
  "tricep dips": "Step 1: Grip parallel bars and support your weight with straight arms.\nStep 2: Bend elbows to lower body until shoulders are below elbows.\nStep 3: Push back up to the locked-out position.",
  "bench dips": "Step 1: Sit on a bench, hands on edge. Walk feet out.\nStep 2: Lower hips by bending elbows to 90°.\nStep 3: Push back up using only your triceps.",
  "pull-ups": "Step 1: Hang from a bar with an overhand grip, arms straight.\nStep 2: Pull chest toward the bar by driving elbows down.\nStep 3: Lower yourself slowly back to a dead hang.",
  "pull ups": "Step 1: Hang from a bar with an overhand grip, arms straight.\nStep 2: Pull chest toward the bar by driving elbows down.\nStep 3: Lower yourself slowly back to a dead hang.",
  "chin-ups": "Step 1: Hang from bar with palms facing you (underhand grip).\nStep 2: Pull chin over the bar, squeezing your biceps.\nStep 3: Lower back down under control.",
  "australian pull-ups": "Step 1: Hang under a low bar, body straight, heels on ground.\nStep 2: Pull chest to the bar, keeping body rigid.\nStep 3: Lower back down until arms are straight.",
  "bodyweight rows": "Step 1: Hang under a low bar or rings, body in a plank.\nStep 2: Pull chest to the bar, elbows moving past ribs.\nStep 3: Lower back down under control.",
  "negative pull-ups": "Step 1: Jump or use a step to get chin over the bar.\nStep 2: Lower yourself as slowly as possible (5-10 seconds).\nStep 3: Once at the bottom, reset and repeat.",
  "dead hang": "Step 1: Grip bar overhead and let body hang freely.\nStep 2: Keep core tight and shoulders slightly engaged.\nStep 3: Hold for the specified time.",
  "bodyweight squats": "Step 1: Stand with feet shoulder-width apart.\nStep 2: Sit back and down, keeping chest up and back straight.\nStep 3: Drive through heels to return to standing.",
  "squats": "Step 1: Stand with feet shoulder-width apart.\nStep 2: Sit back and down, keeping chest up and back straight.\nStep 3: Drive through heels to return to standing.",
  "jump squats": "Step 1: Perform a standard squat.\nStep 2: Explode upward into a vertical jump.\nStep 3: Land softly and immediately go into next rep.",
  "reverse lunges": "Step 1: Step one foot back and lower knee toward floor.\nStep 2: Keep front knee aligned over your ankle.\nStep 3: Push off back foot to return to standing.",
  "walking lunges": "Step 1: Step forward and lower back knee toward floor.\nStep 2: Drive through front heel to step into next lunge.\nStep 3: Alternate legs as you move forward.",
  "calf raises": "Step 1: Stand on toes, heels hanging off a step.\nStep 2: Raise heels as high as possible.\nStep 3: Lower heels below the step level and repeat.",
  "glute bridges": "Step 1: Lie on back, knees bent, feet flat on floor.\nStep 2: Drive hips toward ceiling, squeezing glutes hard.\nStep 3: Lower hips back to floor under control.",
  "pistol squats": "Step 1: Stand on one leg, other leg extended forward.\nStep 2: Lower hips into a deep squat on the single leg.\nStep 3: Drive back up to standing without touching the ground.",
  "forearm plank": "Step 1: Rest on forearms and toes, body in a straight line.\nStep 2: Squeeze glutes and abs to keep back flat.\nStep 3: Hold steady and breathe normally.",
  "hollow body hold": "Step 1: Lie on back, legs straight, arms overhead.\nStep 2: Lift legs and shoulders off floor, pressing lower back down.\nStep 3: Hold the 'banana' shape with maximum tension.",
  "lying leg raises": "Step 1: Lie on back, legs straight, hands by sides.\nStep 2: Lift legs until they are vertical, keeping back flat.\nStep 3: Lower legs slowly without touching the floor.",
  "russian twists": "Step 1: Sit with knees bent, feet slightly off floor.\nStep 2: Rotate torso to touch floor on each side.\nStep 3: Keep core engaged and back straight.",
  "v-ups": "Step 1: Lie flat on back with arms extended overhead.\nStep 2: Simultaneously lift torso and legs to touch toes.\nStep 3: Lower back to flat position under control.",
  "hanging knee raises": "Step 1: Hang from a bar, arms straight, core tight.\nStep 2: Pull knees toward your chest.\nStep 3: Lower legs back down without swinging.",
  "mountain climbers": "Step 1: Start in high plank position.\nStep 2: Drive one knee toward chest, then switch quickly.\nStep 3: Keep hips level and move with speed.",
  "bicycle crunches": "Step 1: Lie on back, knees bent, hands behind head.\nStep 2: Bring opposite elbow toward opposite knee while pedaling.\nStep 3: Maintain a steady, controlled rhythm.",
  "superman hold": "Step 1: Lie face down on stomach, arms forward.\nStep 2: Lift chest, arms, and legs off the floor.\nStep 3: Squeeze back and glutes, holding the arch.",
  "wide grip pull-ups": "Step 1: Grip bar wider than shoulders, dead hang.\nStep 2: Pull chest to bar, focusing on lat contraction.\nStep 3: Control the descent back to starting position.",
  "handstand push-ups": "Step 1: Kick up against a wall into a handstand.\nStep 2: Carefully lower head toward the floor.\nStep 3: Press back up until arms are fully locked.",
  "wall handstand hold": "Step 1: Place hands on floor near wall, kick up.\nStep 2: Hold body straight against the wall.\nStep 3: Engage core and shoulders, breathe steadily.",
  "side plank": "Step 1: Lie on one side, stack feet, prop up on forearm.\nStep 2: Lift hips to form a straight line from head to feet.\nStep 3: Hold steady, keeping hips high and core tight.",
  "side plank dips": "Step 1: Get into side plank position on your forearm.\nStep 2: Lower your hips slowly toward the ground.\nStep 3: Push hips back up to the straight line position.",
  "plank jacks": "Step 1: Start in a high plank position, feet together.\nStep 2: Jump feet apart like a jumping jack.\nStep 3: Jump feet back together, keeping core engaged.",
  "burpees": "Step 1: Stand tall, then squat down and place hands on floor.\nStep 2: Jump feet back into plank, do a push-up.\nStep 3: Jump feet forward, then explode up into a jump.",
  "box jumps": "Step 1: Stand facing a sturdy box or platform.\nStep 2: Swing arms and jump up onto the box.\nStep 3: Stand tall on top, then step back down carefully.",
  "bear crawl": "Step 1: Get on all fours, knees hovering off the ground.\nStep 2: Move opposite hand and foot forward together.\nStep 3: Keep back flat and core tight as you crawl.",
  "commando plank": "Step 1: Start in a forearm plank position.\nStep 2: Push up to a high plank one arm at a time.\nStep 3: Lower back down to forearms, alternating lead arm.",
}

// Fallback guide generator for exercises not in the dictionary
function getExerciseGuide(name) {
  const guide = EXERCISE_GUIDES[name.toLowerCase()]
  if (guide) return guide
  // Generate a simple generic guide
  const cleanName = name.replace(/[-_]/g, ' ')
  return `Step 1: Get into the starting position for ${cleanName}.\nStep 2: Perform the movement with controlled form, engaging the target muscles.\nStep 3: Return to the starting position smoothly and repeat for the required reps.`
}

export default function WorkoutPage() {
  const { appData, setAppData } = useApp()
  const [activeTab, setActiveTab] = useState('exercises')

  // Timer state
  const [activeExercise, setActiveExercise] = useState(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showRestPopup, setShowRestPopup] = useState(false)
  const [exerciseDone, setExerciseDone] = useState(false) // all sets done flag
  const [doneInfo, setDoneInfo] = useState(null) // { sets, totalReps }
  const [getReadySeconds, setGetReadySeconds] = useState(null) // 3s countdown before set
  const [showTomorrow, setShowTomorrow] = useState(false)
  const [injuryRefreshCount, setInjuryRefreshCount] = useState(0) // Trigger re-renders

  // Injury animation state
  const prevExerciseNamesRef = useRef(null)
  const [newExerciseNames, setNewExerciseNames] = useState(new Set())
  const [injuryToast, setInjuryToast] = useState(null)

  // Determine current workout cycle — uses same shared utility as OverviewPage
  const currentWorkoutInfo = useMemo(() => {
    if (!appData) return null
    
    let goal = appData.goal || 'fit'
    const customPlan = getTailoredWorkout(appData)

    // Use the shared split key so both pages always agree
    const splitKey = getTodaySplitKey(appData)

    // Apply injury filter to remove/modify exercises based on active injuries
    const workoutData = filterWorkoutExercises(customPlan[splitKey] || customPlan.push)
    
    // Day number
    const dayNumber = getDayNumber(appData)

    return { goal, splitKey, workoutData, dayNumber }
  }, [appData, injuryRefreshCount])

  // Tomorrow's workout
  const tomorrowInfo = useMemo(() => {
    if (!appData) return null
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const splitKey = getTodaySplitKey(appData, tomorrow)
    if (splitKey === 'rest') return { splitKey: 'rest', label: 'Rest Day', exercises: [] }
    const customPlan = getTailoredWorkout(appData)
    const data = filterWorkoutExercises(customPlan[splitKey] || customPlan.push)
    return { splitKey, label: data.label || splitKey, exercises: data.exercises || [], duration: data.duration, intensity: data.intensity }
  }, [appData, injuryRefreshCount])

  // Listen for injury updates and capture pre-change state for animation
  useEffect(() => {
    const handleUpdate = (e) => {
      console.log('[WorkoutPage] injuryUpdate event received:', e?.detail)
      // Show toast based on the command detail
      const detail = e?.detail
      if (detail) {
        const part = detail.part || 'affected area'
        if (detail.command === 'ADD_INJURY') {
          setInjuryToast({ icon: 'swap_horiz', message: `Exercises updated \u2014 ${part} injury accommodated`, type: 'remove' })
        } else if (detail.command === 'ADD_LIGHT_INJURY') {
          setInjuryToast({ icon: 'accessibility_new', message: `Light mode \u2014 ${part} exercises reduced`, type: 'light' })
        } else if (detail.command === 'CLEAR_INJURY') {
          setInjuryToast({ icon: 'check_circle', message: `${part} fully restored \u2014 full power!`, type: 'clear' })
        } else if (detail.command === 'CLEAR_ALL_INJURIES') {
          setInjuryToast({ icon: 'check_circle', message: 'All injuries cleared \u2014 full workout restored!', type: 'clear' })
        }
      }
      setInjuryRefreshCount(c => c + 1)
    }
    window.addEventListener('injuryUpdate', handleUpdate)
    return () => window.removeEventListener('injuryUpdate', handleUpdate)
  }, [])

  // After re-render, compare old vs new exercise names to identify new/replaced exercises
  useEffect(() => {
    if (!currentWorkoutInfo || !prevExerciseNamesRef.current) return
    const newNames = new Set()
    const currentNames = currentWorkoutInfo.workoutData.exercises.map(ex => ex.name)
    currentNames.forEach(name => {
      if (!prevExerciseNamesRef.current.has(name)) {
        newNames.add(name)
      }
    })
    if (newNames.size > 0) {
      setNewExerciseNames(newNames)
      // Clear animation class after animation completes
      setTimeout(() => setNewExerciseNames(new Set()), 2500)
    }
    prevExerciseNamesRef.current = null
  }, [currentWorkoutInfo])

  // Auto-dismiss injury toast
  useEffect(() => {
    if (!injuryToast) return
    const timer = setTimeout(() => setInjuryToast(null), 4500)
    return () => clearTimeout(timer)
  }, [injuryToast])

  // Track completed sets in local state (or ideally in context if we want it to persist across reloads on the same day)
  const [sessionProgress, setSessionProgress] = useState({})

  // Initialize session progress from today's history if available
  useEffect(() => {
    if (!currentWorkoutInfo || !appData) return
    const today = formatDateStandard(new Date())
    const todayLog = appData.workoutHistory?.find(w => w.date === today)
    
    const initProgress = {}
    currentWorkoutInfo.workoutData.exercises.forEach(ex => {
      let completedSets = 0
      if (todayLog && todayLog.exercises) {
        const loggedEx = todayLog.exercises.find(e => e.name === ex.name)
        if (loggedEx) {
          completedSets = loggedEx.sets || 0
        }
      }
      initProgress[ex.name] = completedSets
    })
    setSessionProgress(initProgress)
  }, [currentWorkoutInfo, appData])

  // Get Ready Countdown Logic
  useEffect(() => {
    let interval = null
    if (getReadySeconds !== null && getReadySeconds > 0) {
      interval = setInterval(() => setGetReadySeconds(s => s - 1), 1000)
    } else if (getReadySeconds === 0) {
      setGetReadySeconds(null)
      setTimerActive(true) // Start the actual set timer
    }
    return () => clearInterval(interval)
  }, [getReadySeconds])

  // Timer Logic (count UP only — rest is handled by RestTimerPopup)
  useEffect(() => {
    let interval = null
    if (timerActive && getReadySeconds === null) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive, getReadySeconds])

  const startSetSequence = () => {
    setGetReadySeconds(3)
  }

  if (!currentWorkoutInfo) return null

  const { workoutData, splitKey, dayNumber } = currentWorkoutInfo
  const { exercises, cardio, warmup, cooldown, label, subtitle, duration, intensity } = workoutData

  const handleStartSet = (ex) => {
    setActiveExercise(ex)
    setTimerSeconds(0)
    setTimerActive(false)
    setShowRestPopup(false)
    setExerciseDone(false)
    setDoneInfo(null)
    setGetReadySeconds(null)
  }

  // Called when user clicks "Complete" on a set — show rest popup
  const handleCompleteSet = () => {
    setTimerActive(false)
    // Show the rest timer popup (reps will be logged there)
    setShowRestPopup(true)
  }

  // Save one set worth of data to appData
  const saveSetToAppData = useCallback((exName, repsNum, seconds) => {
    const today = formatDateStandard(new Date())
    const newAppData = { ...appData }
    if (!newAppData.workoutHistory) newAppData.workoutHistory = []
    if (!newAppData.allExerciseReps) newAppData.allExerciseReps = []

    let todayLog = newAppData.workoutHistory.find(w => w.date === today)
    if (!todayLog) {
      todayLog = { date: today, split: splitKey, label, duration, totalReps: 0, totalSeconds: 0, exercises: [] }
      newAppData.workoutHistory.push(todayLog)
    }
    todayLog.totalReps += repsNum
    todayLog.totalSeconds += seconds

    let exDaily = todayLog.exercises.find(e => e.name === exName)
    if (!exDaily) {
      exDaily = { name: exName, sets: 0, reps: 0, totalReps: 0, duration: 0 }
      todayLog.exercises.push(exDaily)
    }
    exDaily.sets += 1
    exDaily.totalReps += repsNum
    exDaily.duration += seconds
    exDaily.reps = Math.round(exDaily.totalReps / (exDaily.sets || 1))

    let exEntry = newAppData.allExerciseReps.find(e => e.name === exName)
    if (!exEntry) {
      exEntry = { name: exName, totalReps: 0, highestPR: 0, daysLogged: {} }
      newAppData.allExerciseReps.push(exEntry)
    }
    if (!exEntry.daysLogged) exEntry.daysLogged = {}
    if (!exEntry.daysLogged[today]) exEntry.daysLogged[today] = { reps: 0, duration: 0 }
    exEntry.daysLogged[today].reps += repsNum
    exEntry.daysLogged[today].duration += seconds
    if (exEntry.daysLogged[today].reps > (exEntry.highestPR || 0)) exEntry.highestPR = exEntry.daysLogged[today].reps
    exEntry.totalReps += repsNum

    // Legacy Support: workoutHoursPerDay
    if (!newAppData.workoutHoursPerDay) newAppData.workoutHoursPerDay = []
    let dailyHours = newAppData.workoutHoursPerDay.find(h => h.date === today)
    if (!dailyHours) {
      dailyHours = { date: today, seconds: 0, minutes: 0 }
      newAppData.workoutHoursPerDay.push(dailyHours)
    }
    dailyHours.seconds = (dailyHours.seconds || 0) + seconds
    dailyHours.minutes = Math.floor(dailyHours.seconds / 60)

    // Legacy Support: workoutRepsPerDay
    if (!newAppData.workoutRepsPerDay) newAppData.workoutRepsPerDay = []
    let dailyReps = newAppData.workoutRepsPerDay.find(r => r.date === today)
    if (!dailyReps) {
      dailyReps = { date: today, reps: 0 }
      newAppData.workoutRepsPerDay.push(dailyReps)
    }
    dailyReps.reps += repsNum

    setAppData(newAppData)
  }, [appData, setAppData, splitKey, label, duration])

  // Called when rest popup closes (Skip clicked or timer runs out)
  const handleRestFinish = useCallback((reps) => {
    setShowRestPopup(false)
    const exName = activeExercise.name
    const actualReps = parseInt(reps) || parseInt(activeExercise.reps) || 10

    // Save this set's data
    saveSetToAppData(exName, actualReps, timerSeconds)

    // Increment completed sets
    const currentCompleted = sessionProgress[exName] || 0
    const newCompleted = currentCompleted + 1
    setSessionProgress(prev => ({ ...prev, [exName]: newCompleted }))

    if (newCompleted >= activeExercise.sets) {
      // All sets done — show done block
      const totalReps = actualReps * newCompleted
      setDoneInfo({ sets: newCompleted, totalReps })
      setExerciseDone(true)
    } else {
      // More sets — auto-start next set timer sequence
      setTimerSeconds(0)
      startSetSequence()
    }
  }, [activeExercise, sessionProgress, timerSeconds, saveSetToAppData])

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <>
      <AppHeader 
        icon="exercise" 
        title="Workouts" 
        showSearch
        right={
          <div className={styles.searchBox}>
            <span className="material-symbols-outlined">search</span>
            <input type="text" placeholder="Search workouts..." />
          </div>
        }
      />
      <div className={styles.contentInner}>
      
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.programTag}>
            <span className="material-symbols-outlined">local_fire_department</span>
            {appData.goal} Program
          </div>
          <h1 className={styles.pageTitle}>Day {dayNumber}: {label}</h1>
          <p className={styles.pageSubtitle}>{subtitle}</p>
        </div>
        <div className={styles.pageActions}>
          <Link to="/analyzer" className={styles.btnAnalyze}>
            <span className="material-symbols-outlined">smart_toy</span>
            Analyze Form
          </Link>
          <button className={styles.btnStart} onClick={() => {
            const firstEx = exercises[0]
            if (firstEx) handleStartSet(firstEx)
          }}>
            <span className="material-symbols-outlined">play_arrow</span>
            Start Workout
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <span className="material-symbols-outlined">schedule</span>
          </div>
          <div>
            <p className={styles.summaryLabel}>Duration</p>
            <p className={styles.summaryValue}>{duration} min</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryIcon}>
            <span className="material-symbols-outlined">bolt</span>
          </div>
          <div>
            <p className={styles.summaryLabel}>Intensity</p>
            <p className={styles.summaryValue}>{intensity}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsBar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'exercises' ? styles.active : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          Exercise List
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'warmup' ? styles.active : ''}`}
          onClick={() => setActiveTab('warmup')}
        >
          Warm-up & Cardio
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'cooldown' ? styles.active : ''}`}
          onClick={() => setActiveTab('cooldown')}
        >
          Cool-down
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'exercises' && (
        <div className={styles.exerciseList}>
          {exercises.map((ex, idx) => {
            const completed = sessionProgress[ex.name] || 0
            const isFinished = completed >= ex.sets

            return (
              <div key={ex.name} className={`${styles.exerciseCard} ${isFinished ? styles.completed : ''} ${newExerciseNames.has(ex.name) ? styles.exerciseCardNew : ''}`}
                style={newExerciseNames.has(ex.name) ? { animationDelay: `${idx * 0.1}s` } : {}}
              >
                <div className={styles.exerciseImgWrap}>
                  {ex.img ? (
                    <img src={ex.img} alt={ex.name} />
                  ) : (
                    <div className={styles.exerciseImgPlaceholder}>
                      <span className="material-symbols-outlined">fitness_center</span>
                    </div>
                  )}
                  <div className={`${styles.exerciseImgOverlay} ${isFinished ? styles.completedOverlay : ''}`}></div>
                </div>
                
                <div className={styles.exerciseInfo}>
                  <h3 className={styles.exerciseName} style={isFinished ? {color: '#22c55e'} : {}}>{ex.name}</h3>
                  <p className={styles.exerciseDesc}>{ex.desc}</p>
                  
                  <div className={styles.setTracker}>
                    <span className={styles.setTrackerLabel}>Sets: {completed}/{ex.sets}</span>
                    <div className={styles.setDots}>
                      {Array.from({length: ex.sets}).map((_, i) => (
                        <span key={i} className={`${styles.setDot} ${i < completed ? styles.done : ''}`}></span>
                      ))}
                    </div>
                  </div>

                  {isFinished ? (
                    <button className={`${styles.exerciseStartBtn} ${styles.completed}`}>
                      <span className="material-symbols-outlined">check_circle</span> Completed
                    </button>
                  ) : (
                    <button className={styles.exerciseStartBtn} onClick={() => handleStartSet(ex)}>
                      <span className="material-symbols-outlined">play_arrow</span> Start Set
                    </button>
                  )}
                </div>

                <div className={styles.exerciseStats}>
                  <div className={styles.exerciseStat}>
                    <p className={styles.statLabel}>Sets</p>
                    <p className={styles.statVal}>{ex.sets}</p>
                  </div>
                  <div className={styles.exerciseStat}>
                    <p className={styles.statLabel}>{getStatLabel(ex.name, ex.reps)}</p>
                    <p className={styles.statVal}>{isHoldExercise(ex.name, ex.reps) ? formatRepsDisplay(ex.name, ex.reps) : ex.reps}</p>
                  </div>
                  <button className={styles.infoBtn}>
                    <span className="material-symbols-outlined">info</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === 'warmup' && (
        <div className={styles.exerciseList}>
          <div className={styles.workoutDayLabel}>Cardio</div>
          {cardio.length > 0 ? cardio.map((item, idx) => (
            <div key={idx} className={styles.simpleExerciseRow}>
              <span className="material-symbols-outlined">directions_run</span>
              <span className={styles.simpleExerciseName}>{item.name}</span>
              <span className={styles.simpleExerciseDetail}>{item.detail}</span>
            </div>
          )) : <p>No cardio for today.</p>}
          
          <div className={styles.workoutDayLabel} style={{marginTop: '1rem'}}>Warm-up</div>
          {warmup.length > 0 ? warmup.map((item, idx) => (
            <div key={idx} className={styles.simpleExerciseRow}>
              <span className="material-symbols-outlined">accessibility_new</span>
              <span className={styles.simpleExerciseName}>{item.name}</span>
              <span className={styles.simpleExerciseDetail}>{item.detail}</span>
            </div>
          )) : <p>No warm-up for today.</p>}
        </div>
      )}

      {activeTab === 'cooldown' && (
        <div className={styles.exerciseList}>
          <div className={styles.workoutDayLabel}>Cool-down</div>
          {cooldown.length > 0 ? cooldown.map((item, idx) => (
            <div key={idx} className={styles.simpleExerciseRow}>
              <span className="material-symbols-outlined">self_improvement</span>
              <span className={styles.simpleExerciseName}>{item.name}</span>
              <span className={styles.simpleExerciseDetail}>{item.detail}</span>
            </div>
          )) : <p>No cool-down for today.</p>}
        </div>
      )}

      {/* Tomorrow's Schedule Card */}
      {tomorrowInfo && (
        <div className={styles.tomorrowCard} onClick={() => setShowTomorrow(true)}>
          <div className={styles.tomorrowLeft}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>event</span>
            <div>
              <p className={styles.tomorrowTitle}>Tomorrow's Schedule</p>
              <p className={styles.tomorrowSplit}>
                {tomorrowInfo.splitKey === 'rest'
                  ? '🛌 Rest Day — recover & recharge'
                  : `${tomorrowInfo.label} · ${tomorrowInfo.exercises.length} exercises`}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: 'var(--text-tertiary)' }}>chevron_right</span>
        </div>
      )}

      {/* Tomorrow's Schedule Popup */}
      {showTomorrow && tomorrowInfo && (
        <div className={styles.tomorrowOverlay} onClick={() => setShowTomorrow(false)}>
          <div className={styles.tomorrowModal} onClick={e => e.stopPropagation()}>
            <div className={styles.tomorrowModalHeader}>
              <div>
                <h3>Tomorrow's Workout</h3>
                <p>{tomorrowInfo.splitKey === 'rest' ? 'Rest Day' : `${tomorrowInfo.label}`}
                  {tomorrowInfo.duration ? ` · ${tomorrowInfo.duration} min` : ''}
                  {tomorrowInfo.intensity ? ` · ${tomorrowInfo.intensity}` : ''}
                </p>
              </div>
              <button className={styles.tomorrowClose} onClick={() => setShowTomorrow(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            {tomorrowInfo.splitKey === 'rest' ? (
              <div className={styles.tomorrowRestMsg}>
                <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--primary)', opacity: 0.5 }}>self_improvement</span>
                <p>Tomorrow is a rest day. Let your muscles recover and come back stronger! 💪</p>
              </div>
            ) : (
              <div className={styles.tomorrowExList}>
                {tomorrowInfo.exercises.map((ex, i) => (
                  <div key={i} className={styles.tomorrowExRow}>
                    <div className={styles.tomorrowExNum}>{i + 1}</div>
                    {ex.img && <img src={ex.img} alt={ex.name} className={styles.tomorrowExImg} />}
                    <div className={styles.tomorrowExInfo}>
                      <p className={styles.tomorrowExName}>{ex.name}</p>
                      <p className={styles.tomorrowExMeta}>{ex.sets} Sets × {formatRepsDisplay(ex.name, ex.reps)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timer Modal */}
      {activeExercise && (
        <div className={styles.exerciseModalOverlay}>
          <div className={styles.exerciseModal}>
            {/* Banner */}
            {!exerciseDone && activeExercise.img && (
              <div className={styles.exerciseModalBanner}>
                <img src={activeExercise.img} alt={activeExercise.name} />
              </div>
            )}
            <div className={styles.exerciseModalHeader}>
              <div>
                <h3 className={styles.exerciseModalName}>{activeExercise.name}</h3>
                <p className={styles.exerciseModalSets}>
                  {`${sessionProgress[activeExercise.name] || 0}/${activeExercise.sets} sets done — ${activeExercise.sets - (sessionProgress[activeExercise.name] || 0)} remaining`}
                </p>
              </div>
              <button className={styles.exerciseModalClose} onClick={() => {
                setActiveExercise(null)
                setTimerActive(false)
                setExerciseDone(false)
              }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className={styles.exerciseModalBody}>
              {exerciseDone && doneInfo ? (
                /* ── Done Block ── */
                <div className={restCss.doneBlock}>
                  <p className={restCss.doneText}>
                    💪 "{activeExercise.name}" complete!
                  </p>
                  <p className={restCss.doneSub}>
                    {doneInfo.sets} sets done — {isHoldExercise(activeExercise.name, activeExercise.reps) ? `${doneInfo.totalReps}s total hold time` : `${doneInfo.totalReps} total reps`}
                  </p>
                  <button className={restCss.doneBtn} onClick={() => {
                    setActiveExercise(null)
                    setExerciseDone(false)
                  }}>
                    <span className="material-symbols-outlined">check_circle</span>
                    Close
                  </button>
                </div>
              ) : (
                <>
                  {/* Guide */}
                  <div className={restCss.guideBox}>
                    <p className={restCss.guideTitle}>Guide:</p>
                    <p className={restCss.guideText}>
                      {getExerciseGuide(activeExercise.name).split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}
                    </p>
                  </div>

                  {/* Timer Ring */}
                  <div className={styles.timerRingWrap}>
                    <svg className={styles.timerRingSvg}>
                      <circle className={styles.timerRingBg} cx="50%" cy="50%" r="60" />
                      <circle 
                        className={styles.timerRingFill} 
                        cx="50%" cy="50%" r="60" 
                        style={{ strokeDashoffset: 377 - ((timerSeconds % 60) / 60) * 377 }} 
                      />
                    </svg>
                    <div className={styles.timerDisplay}>
                      <span className={styles.timerSeconds}>{timerSeconds}</span>
                      <span className={styles.timerLabel}>
                        {!timerActive && timerSeconds === 0 ? 'READY' : 
                         !timerActive && timerSeconds > 0 ? 'PAUSED' : 'WORKING'}
                      </span>
                    </div>
                  </div>

                  {/* Buttons */}
                  {!timerActive && timerSeconds === 0 && getReadySeconds === null ? (
                    <button className={styles.timerStartBtn} onClick={startSetSequence}>
                      <span className="material-symbols-outlined">play_arrow</span>
                      Start Workout
                    </button>
                  ) : getReadySeconds === null ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                      <button 
                        className={`${styles.timerPauseBtn} ${!timerActive ? styles.timerPauseBtnActive : ''}`} 
                        onClick={() => setTimerActive(!timerActive)}
                        style={{ width: '100%', gap: '0.5rem' }}
                      >
                        <span className="material-symbols-outlined">{timerActive ? 'pause' : 'play_arrow'}</span>
                        {timerActive ? 'Pause' : 'Resume'}
                      </button>
                      <div className={styles.timerActions} style={{display: 'flex'}}>
                        <button className={styles.timerResetBtn} onClick={() => {
                          setTimerSeconds(0)
                          setTimerActive(false)
                        }}>
                          <span className="material-symbols-outlined">replay</span> Reset
                        </button>
                        <button className={styles.timerCompleteBtn} onClick={handleCompleteSet}>
                          <span className="material-symbols-outlined">check</span> Completed
                        </button>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Get Ready Popup Overlay */}
      {getReadySeconds !== null && (
        <div className={restCss.overlay} style={{ zIndex: 30000 }}>
          <div className={restCss.box} style={{ padding: '3rem', width: 'auto' }}>
            <div className={restCss.header}>
              <p className={restCss.label} style={{ fontSize: '1rem' }}>GET READY</p>
            </div>
            <div className={restCss.ringWrap} style={{ width: '120px', height: '120px' }}>
              <svg className={restCss.ringSvg} viewBox="0 0 180 180">
                <circle className={restCss.ringBg} cx="90" cy="90" r="80" />
                <circle
                  className={restCss.ringFill}
                  cx="90" cy="90" r="80"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={(2 * Math.PI * 80) - (getReadySeconds / 3) * (2 * Math.PI * 80)}
                />
              </svg>
              <h2 className={restCss.timerText} style={{ fontSize: '3rem' }}>{getReadySeconds}</h2>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Popup Overlay */}
      {showRestPopup && activeExercise && (
        <RestTimerPopup
          restDuration={appData.restTime || 30}
          exerciseName={activeExercise.name}
          targetReps={activeExercise.reps}
          onFinish={handleRestFinish}
          onClose={(loggedReps) => {
            // If user entered reps, save the set before closing
            if (loggedReps) {
              handleRestFinish(loggedReps)
            } else {
              setShowRestPopup(false)
              setTimerSeconds(0)
              setTimerActive(false)
            }
          }}
        />
      )}

    </div>

    {/* Injury Change Toast */}
    {injuryToast && (
      <div className={styles.injuryToast} data-type={injuryToast.type}>
        <span className="material-symbols-outlined">{injuryToast.icon}</span>
        <span>{injuryToast.message}</span>
        <button className={styles.injuryToastClose} onClick={() => setInjuryToast(null)}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    )}
    </>
  )
}
