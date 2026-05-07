import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useApp } from '../../context/AppContext'
import GlobalSearch from '../ui/GlobalSearch'
import NotificationsPanel from '../ui/NotificationsPanel'
import AIWidget from '../ui/AIWidget'
import WeightReminderPopup from '../ui/WeightReminderPopup'
import styles from './AppLayout.module.css'

export default function AppLayout() {
  const { isSidebarOpen, setSidebarOpen } = useApp()

  return (
    <div className={styles.appContainer}>
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={styles.appBody}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className={styles.mainWrapper}>
          {/* Each page renders its own <AppHeader> with the page-specific title/icon */}
          <main className={styles.mainContent}>
            <Outlet />
          </main>
        </div>
      </div>

      <Footer />

      {/* ── Global Overlays (rendered once, shared across all pages) ── */}
      <GlobalSearch />
      <NotificationsPanel />
      <AIWidget />
      <WeightReminderPopup />
    </div>
  )
}
