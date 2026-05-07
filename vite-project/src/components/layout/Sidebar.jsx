import { NavLink } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import styles from './Sidebar.module.css'
import darkLogo from '../../assets/Logo/Dark theme logo.png'
import lightLogo from '../../assets/Logo/Light theme logo.png'

const NAV_LINKS = [
  { to: '/',             icon: 'grid_view',             label: 'Overview' },
  { to: '/workout',      icon: 'exercise',              label: 'Workouts' },
  { to: '/progress',     icon: 'monitoring',            label: 'Progress' },
  { to: '/activity',     icon: 'local_fire_department', label: 'Activity' },
  { to: '/skills',       icon: 'self_improvement',      label: 'Skills' },
  { to: '/analyzer',     icon: 'smart_toy',             label: 'Form Analyzer' },
  { to: '/daily-report', icon: 'summarize',             label: 'Daily Report' },
  { to: '/settings',     icon: 'settings',              label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const { theme } = useApp();
  
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      {/* Logo */}
      <div className={styles.sidebarHeader}>
        <img src={theme === 'dark' ? darkLogo : lightLogo} alt="CaliStrength Logo" className={styles.logo} />
      </div>

      {/* Nav Links */}
      <nav className={styles.navSection}>
        {NAV_LINKS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
          >
            <span className="material-symbols-outlined">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer Links */}
      <div className={styles.sidebarFooter}>
        <NavLink to="/records" onClick={onClose} className={styles.footerLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            emoji_events
          </span>
          Personal Records
        </NavLink>
        <NavLink to="/profile" onClick={onClose} className={styles.footerLink}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            account_circle
          </span>
          My Profile
        </NavLink>
      </div>
    </aside>
  )
}
