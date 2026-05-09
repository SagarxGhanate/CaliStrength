import { useState, useEffect } from 'react'
import styles from './ConfirmPopup.module.css'

/**
 * Reusable confirmation popup with an optional countdown delay on the confirm button.
 *
 * Props:
 *   icon        – Material Symbols icon name
 *   iconColor   – CSS color for the icon
 *   title       – Popup heading
 *   message     – Body text
 *   confirmText – Label for the confirm button (default: "Confirm")
 *   cancelText  – Label for the cancel button (default: "Cancel")
 *   delaySec    – Seconds to disable confirm button (0 = no delay)
 *   onConfirm   – Callback when confirm is clicked
 *   onCancel    – Callback when cancel / overlay is clicked
 *   variant     – "default" | "danger" (affects confirm button color)
 */
export default function ConfirmPopup({
  icon = 'help',
  iconColor = 'var(--primary)',
  title = 'Are you sure?',
  message = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  delaySec = 0,
  onConfirm,
  onCancel,
  variant = 'default',
}) {
  const [countdown, setCountdown] = useState(delaySec)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const isDisabled = countdown > 0

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.popup} onClick={e => e.stopPropagation()}>
        <div className={styles.iconWrap} style={{ color: iconColor }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={`${styles.btnConfirm} ${variant === 'danger' ? styles.danger : ''}`}
            onClick={onConfirm}
            disabled={isDisabled}
          >
            {isDisabled ? `${confirmText} (${countdown}s)` : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
