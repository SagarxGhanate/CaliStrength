import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { toLocalDateStr } from '../../utils/dateUtils'
import styles from './WeightReminderPopup.module.css'

export default function WeightReminderPopup() {
  const { appData } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const checkReminder = () => {
      const excludedPaths = ['/login', '/signup', '/onboarding', '/settings', '/weight']
      if (excludedPaths.includes(location.pathname)) {
        setShow(false)
        return
      }

      const now = new Date()
      const todayKey = toLocalDateStr(now)
      
      // Check local storage for dismissal
      const lastDismissed = localStorage.getItem('weight_reminder_dismissed')
      if (lastDismissed === todayKey) {
        setShow(false)
        return
      }

      const weightHistory = appData?.weightHistory || []

      // Check if weight logged today using toLocalDateStr for all date formats
      const loggedToday = weightHistory.some(w => toLocalDateStr(w.date) === todayKey)
      
      if (loggedToday) {
        setShow(false)
        return
      }

      // Neither dismissed nor logged today
      setShow(true)
    }

    // Initial check (delay for UX: 3 seconds as requested)
    const initialTimer = setTimeout(checkReminder, 3000)

    // Check periodically
    const interval = setInterval(checkReminder, 30000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [appData, location.pathname])

  if (!show) return null

  const handleDismiss = () => {
    const todayKey = toLocalDateStr(new Date())
    localStorage.setItem('weight_reminder_dismissed', todayKey)
    setShow(false)
  }

  const handleAddWeight = () => {
    handleDismiss()
    navigate('/weight')
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.iconWrap}>
          <span className="material-symbols-outlined">scale</span>
        </div>
        
        <h2>Log Your Weight!</h2>
        <p>
          Don't forget to add weight regularly to track your progress and keep your AI Coach updated!
        </p>

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleAddWeight}>
            Add Weight
          </button>
          <button className={styles.btnSecondary} onClick={handleDismiss}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}
