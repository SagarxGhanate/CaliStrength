import { useState, useEffect, useRef, useCallback } from 'react'
import { isHoldExercise } from '../../utils/exerciseUtils'
import css from './RestTimerPopup.module.css'

const RADIUS = 80
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function RestTimerPopup({ restDuration, exerciseName, targetReps, onFinish, onClose }) {
  const [timeLeft, setTimeLeft] = useState(restDuration)
  const [paused, setPaused] = useState(false)
  const [repsValue, setRepsValue] = useState('')
  const [repsLogged, setRepsLogged] = useState(false)
  const [savedReps, setSavedReps] = useState(null) // reps saved by Add button
  const [inputGlow, setInputGlow] = useState(false)
  const [skipWarning, setSkipWarning] = useState(false)
  const finishing = useRef(false)
  const inputRef = useRef(null)

  // Detect hold exercises using shared utility
  const isHold = isHoldExercise(exerciseName, targetReps)

  const inputLabel = isHold ? 'LOG HOLD TIME (SEC)' : 'LOG REPS FOR THIS SET'

  // Countdown timer
  useEffect(() => {
    if (paused || timeLeft <= 0) return
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000)
    return () => clearInterval(id)
  }, [paused, timeLeft])

  // When timer hits 0: auto-finish only if reps logged, otherwise hold user here
  const repsLoggedRef = useRef(false)
  repsLoggedRef.current = repsLogged

  useEffect(() => {
    if (timeLeft <= 0 && !finishing.current) {
      if (repsLoggedRef.current) {
        // Reps already logged — auto-close and move to next set
        finishing.current = true
        setTimeout(() => handleFinish(), 300)
      } else {
        // Reps NOT logged — keep popup open, glow input, show warning permanently
        setInputGlow(true)
        setSkipWarning(true)
        if (inputRef.current) inputRef.current.focus()
      }
    }
  }, [timeLeft])

  // Add saves reps — if timer already expired, auto-close and proceed
  const handleAddReps = useCallback(() => {
    if (repsLogged) return
    const val = parseInt(repsValue) || parseInt(targetReps) || 10
    setSavedReps(val)
    setRepsLogged(true)
    setInputGlow(false)
    // If timer already hit 0, auto-finish now
    if (timeLeft <= 0) {
      finishing.current = true
      setTimeout(() => onFinish(val), 300)
    }
  }, [repsValue, repsLogged, targetReps, timeLeft, onFinish])

  // Actually close the popup and send reps to parent
  const handleFinish = useCallback(() => {
    const val = savedReps !== null ? savedReps : (parseInt(repsValue) || parseInt(targetReps) || 0)
    onFinish(val)
  }, [repsValue, savedReps, targetReps, onFinish])

  const handleSkip = () => {
    if (finishing.current) return
    // Block skip if reps not logged yet
    if (!repsLogged) {
      setSkipWarning(true)
      setInputGlow(true)
      if (inputRef.current) inputRef.current.focus()
      setTimeout(() => setSkipWarning(false), 2500)
      return
    }
    finishing.current = true
    handleFinish()
  }

  const handlePause = () => {
    setPaused(p => {
      if (!p && !repsLogged) {
        // Pausing — glow the input to remind user
        setInputGlow(true)
        if (inputRef.current) inputRef.current.focus()
      }
      return !p
    })
  }

  const offset = CIRCUMFERENCE - (timeLeft / restDuration) * CIRCUMFERENCE
  const isWarning = timeLeft <= 3 && timeLeft > 0

  return (
    <div className={css.overlay}>
      <div className={css.box}>
        <button className={css.closeBtn} onClick={() => {
          if (repsLogged && savedReps !== null) {
            onClose(savedReps)
          } else {
            onClose()
          }
        }}>
          <span className="material-symbols-outlined">close</span>
        </button>

        {/* Header */}
        <div className={css.header}>
          <span className="material-symbols-outlined">hourglass_top</span>
          <p className={css.label}>RECOVERY TIME</p>
        </div>

        {/* Circular Timer */}
        <div className={css.ringWrap}>
          <svg className={css.ringSvg} viewBox="0 0 180 180">
            <circle className={css.ringBg} cx="90" cy="90" r={RADIUS} />
            <circle
              className={`${css.ringFill} ${isWarning ? css.ringFillWarning : ''}`}
              cx="90" cy="90" r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
            />
          </svg>
          <h2 className={css.timerText}>{timeLeft}S</h2>
        </div>

        {/* Log Reps Card */}
        <div className={css.logCard}>
          <p className={css.logLabel}>{inputLabel}</p>
          <div className={css.inputGroup}>
            <input
              ref={inputRef}
              type="number"
              className={`${css.repsInput} ${inputGlow && !repsLogged ? css.repsInputGlow : ''}`}
              placeholder={String(targetReps)}
              value={repsValue}
              onChange={e => setRepsValue(e.target.value)}
              disabled={repsLogged}
              autoFocus
            />
            <button
              className={`${css.addBtn} ${repsLogged ? css.addedBtn : ''}`}
              onClick={handleAddReps}
              disabled={repsLogged}
            >
              {repsLogged ? 'Added' : 'Add'}
            </button>
          </div>
          <p className={`${css.addedMsg} ${repsLogged ? css.addedMsgVisible : ''}`}>
            {isHold ? '✓ Time Added!' : '✓ Reps Added!'}
          </p>
        </div>

        {/* Skip Warning */}
        {skipWarning && (
          <div className={css.skipWarning}>
            <span className="material-symbols-outlined" style={{fontSize:'1rem'}}>warning</span>
            {isHold ? 'Please log your hold time first!' : 'Please log your reps first!'}
          </div>
        )}

        {/* Action Buttons */}
        <div className={css.actions}>
          <button
            className={`${css.pauseBtn} ${paused ? css.pauseResumed : ''}`}
            onClick={handlePause}
          >
            <span className="material-symbols-outlined">{paused ? 'play_arrow' : 'pause'}</span>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button className={css.skipBtn} onClick={handleSkip}>
            <span className="material-symbols-outlined">fast_forward</span>
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
