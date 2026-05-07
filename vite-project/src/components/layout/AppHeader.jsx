import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './AppHeader.module.css'
import { computeNotifications } from '../ui/NotificationsPanel'

/**
 * Standard app header used on all protected pages.
 * Props:
 *   icon          – Material Symbol name (e.g. "exercise")
 *   title         – Page title string
 *   right         – Optional JSX for extra right-side content (desktop only)
 *   hideOnDesktop – If true, header is hidden on ≥1025px (desktop pages with sidebar)
 *   showSearch    – If true, displays the global search icon button
 */
export default function AppHeader({ icon, title, right, hideOnDesktop, showSearch = false }) {
  const { setSidebarOpen, setSearchOpen, setNotifOpen, appData, readNotifications = [] } = useApp()

  // Compute unread notification count from data
  const notifCount = useMemo(() => {
    if (!appData) return 0
    const allNotifs = computeNotifications(appData)
    const unreadCount = allNotifs.filter(n => !readNotifications.includes(n.id)).length
    return Math.min(unreadCount, 9)
  }, [appData, readNotifications])

  return (
    <header className={`${styles.header} ${hideOnDesktop ? styles.hideOnDesktop : ''}`}>
      {/* Left: Hamburger (mobile only) + Icon + Title */}
      <div className={styles.headerLeft}>
        <button
          className={`${styles.iconBtn} ${styles.mobileOnly}`}
          id="mobileMenuBtn"
          onClick={() => setSidebarOpen(open => !open)}
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {icon && (
          <span className={`material-symbols-outlined ${styles.headerIcon}`}>
            {icon}
          </span>
        )}
        <h2 className={styles.headerTitle}>{title}</h2>
      </div>

      {/* Right: Desktop/Tablet slot + Search + Notification */}
      <div className={styles.headerRight}>
        {/* Extras slot (e.g. big search bar) — hidden on phones */}
        {right && <div className={styles.hideOnPhone}>{right}</div>}

        {/* Global Search button — hidden on PC/Tablet if `right` is present */}
        {showSearch && (
          <button
            className={`${styles.iconBtn} ${right ? styles.phoneOnly : ''}`}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            title="Search (exercises, pages)"
          >
            <span className="material-symbols-outlined">search</span>
          </button>
        )}

        {/* Notification bell with badge */}
        <button
          className={styles.iconBtn}
          onClick={() => setNotifOpen(open => !open)}
          aria-label="Notifications"
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <span className="material-symbols-outlined">
            {notifCount > 0 ? 'notifications_active' : 'notifications'}
          </span>
          {notifCount > 0 && (
            <span className={styles.notifBadge}>{notifCount}</span>
          )}
        </button>
      </div>
    </header>
  )
}
