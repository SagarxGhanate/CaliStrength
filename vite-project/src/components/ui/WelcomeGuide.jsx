import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { toLocalDateStr } from '../../utils/dateUtils'
import styles from './WelcomeGuide.module.css'

const STORAGE_KEY = 'calistrength_welcome_seen'

const STEPS = [
  {
    icon: 'monitor_weight',
    color: '#3b82f6',
    title: 'Log Your Weight Daily',
    desc: 'Start each day by logging your weight on the Daily Report page to track your progress over time.',
  },
  {
    icon: 'fitness_center',
    color: '#ec5b13',
    title: 'Do Your Workout',
    desc: 'Head to the Workout page to complete your daily calisthenics session and log every set.',
  },
  {
    icon: 'monitoring',
    color: '#22c55e',
    title: 'Track Weight & Graphs',
    desc: 'Visit the Weight page to see detailed charts and trends of your body composition over weeks.',
  },
  {
    icon: 'school',
    color: '#a855f7',
    title: 'Learn Skills',
    desc: 'Use the Skill Tree page to learn new calisthenics movements and unlock your next progression.',
  },
  {
    icon: 'support_agent',
    color: '#f59e0b',
    title: 'Got an Injury? Tell the AI',
    desc: 'If you have pain or an injury, tap the AI Coach button and describe it — it will adjust your workout plan safely.',
  },
]

export default function WelcomeGuide() {
  const { appData } = useApp()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    // 1. If already seen on this device, skip
    const seen = localStorage.getItem(STORAGE_KEY)
    if (seen) return

    // 2. Wait until appData is fully loaded from backend
    const profile = appData?.profile
    if (!profile || !profile.email) return // Not fully loaded yet

    // 3. Only show on the EXACT day they joined
    const todayStr = toLocalDateStr(new Date())
    if (profile.startDate && profile.startDate !== todayStr) {
      localStorage.setItem(STORAGE_KEY, '1') // Permanent skip on this device
      return
    }

    // 4. If they have already done a workout, they don't need a welcome guide
    if (appData?.workoutHistory?.length > 0) {
      localStorage.setItem(STORAGE_KEY, '1') // Permanent skip on this device
      return
    }

    const timer = setTimeout(() => setVisible(true), 5000)
    return () => clearTimeout(timer)
  }, [appData])

  const close = () => {
    setExiting(true)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem(STORAGE_KEY, '1')
    }, 300)
  }

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else close()
  }

  const prev = () => {
    if (step > 0) setStep(s => s - 1)
  }

  if (!visible) return null

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div className={`${styles.overlay} ${exiting ? styles.overlayOut : ''}`} onClick={close}>
      <div
        className={`${styles.modal} ${exiting ? styles.modalOut : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button className={styles.closeBtn} onClick={close} aria-label="Close guide">
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Badge */}
        <div className={styles.badge}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.85rem' }}>auto_awesome</span>
          Quick Start Guide
        </div>

        {/* Icon */}
        <div className={styles.iconWrap} style={{ background: current.color + '1a', color: current.color }}>
          <span className="material-symbols-outlined">{current.icon}</span>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h2 className={styles.stepTitle}>{current.title}</h2>
          <p className={styles.stepDesc}>{current.desc}</p>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === step ? styles.dotActive : ''}`}
              onClick={() => setStep(i)}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className={styles.navRow}>
          {step > 0 ? (
            <button className={styles.prevBtn} onClick={prev}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back
            </button>
          ) : (
            <div />
          )}
          <button className={styles.nextBtn} onClick={next} style={{ background: current.color }}>
            {isLast ? 'Get Started!' : 'Next'}
            <span className="material-symbols-outlined">{isLast ? 'rocket_launch' : 'arrow_forward'}</span>
          </button>
        </div>

        {/* Step counter */}
        <p className={styles.counter}>{step + 1} of {STEPS.length}</p>
      </div>
    </div>
  )
}
