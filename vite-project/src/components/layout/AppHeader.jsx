import { useMemo, useRef, useEffect } from 'react'
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
 *   showSearch    – If true, displays the global search icon button on phone
 *   onSearchClick – If provided, overrides the default GlobalSearch open behavior
 *
 *   Inline search mode (phone only):
 *   searchActive    – boolean, when true the title is replaced with a search input
 *   searchValue     – controlled input value
 *   onSearchChange  – (value) => void
 *   onSearchClose   – () => void, closes inline search
 *   searchPlaceholder – placeholder text
 */
export default function AppHeader({
  icon, title, right, hideOnDesktop,
  showSearch = false, onSearchClick,
  searchActive = false, searchValue = '', onSearchChange, onSearchClose, searchPlaceholder = 'Search...',
}) {
  const { setSidebarOpen, setSearchOpen, setNotifOpen, appData, readNotifications = [] } = useApp()
  const inlineInputRef = useRef(null)

  // Compute unread notification count from data
  const notifCount = useMemo(() => {
    if (!appData) return 0
    const allNotifs = computeNotifications(appData)
    const unreadCount = allNotifs.filter(n => !readNotifications.includes(n.id)).length
    return Math.min(unreadCount, 9)
  }, [appData, readNotifications])

  // Auto-focus inline search input when activated
  useEffect(() => {
    if (searchActive) {
      setTimeout(() => inlineInputRef.current?.focus(), 150)
    }
  }, [searchActive])

  return (
    <header className={`${styles.header} ${hideOnDesktop ? styles.hideOnDesktop : ''}`}>
      {/* Left: Hamburger (mobile only) + Icon + Title  OR  inline search */}
      <div className={styles.headerLeft}>
        <button
          className={`${styles.iconBtn} ${styles.mobileOnly}`}
          id="mobileMenuBtn"
          onClick={() => setSidebarOpen(open => !open)}
          aria-label="Open navigation"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* When inline search is active on phone, replace title with input */}
        {searchActive ? (
          <div className={styles.inlineSearchWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.15rem', color: 'var(--text-tertiary)' }}>search</span>
            <input
              ref={inlineInputRef}
              className={styles.inlineSearchInput}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={e => onSearchChange?.(e.target.value)}
            />
            {searchValue && (
              <button className={styles.inlineSearchClear} onClick={() => onSearchChange?.('')}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>close</span>
              </button>
            )}
            <button className={styles.inlineSearchClear} onClick={onSearchClose} title="Close search">
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>arrow_back</span>
            </button>
          </div>
        ) : (
          <>
            {icon && (
              <span className={`material-symbols-outlined ${styles.headerIcon}`}>
                {icon}
              </span>
            )}
            <h2 className={styles.headerTitle}>{title}</h2>
          </>
        )}
      </div>

      {/* Right: Desktop/Tablet slot + Search + Notification */}
      <div className={styles.headerRight}>
        {/* Extras slot (e.g. big search bar) — hidden on phones */}
        {right && <div className={styles.hideOnPhone}>{right}</div>}

        {/* Search button — hidden when inline search is active, or on PC/Tablet if `right` is present */}
        {showSearch && !searchActive && (
          <button
            className={`${styles.iconBtn} ${right ? styles.phoneOnly : ''}`}
            onClick={onSearchClick || (() => setSearchOpen(true))}
            aria-label="Search"
            title="Search"
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
