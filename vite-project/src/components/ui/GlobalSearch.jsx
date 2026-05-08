import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'
import styles from './GlobalSearch.module.css'

/* ── Exercise Index ── */
const EXERCISES = [
  // Push
  { name: 'Incline Push-ups',      type: 'push', desc: 'Build base pushing strength. Hands on elevated surface.',     path: '/workout' },
  { name: 'Standard Push-ups',     type: 'push', desc: 'Core pushing movement — 3 sets × 15 reps.',                   path: '/workout' },
  { name: 'Dips',                  type: 'push', desc: 'Parallel bars, full range of motion.',                        path: '/workout' },
  { name: 'Decline Push-ups',      type: 'push', desc: 'Upper chest focus. Feet elevated.',                           path: '/workout' },
  { name: 'Pike Push-ups',         type: 'push', desc: 'Shoulder strength builder — progress to HSPU.', img: '/Assets/Pike Pushups.png', path: '/workout' },
  { name: 'Diamond Push-ups',      type: 'push', desc: 'Tricep isolation via close hand placement.',                  path: '/workout' },
  { name: 'Wall Handstand Hold',   type: 'push', desc: 'Shoulder stability — hold 30–60 s.',                          path: '/workout' },
  { name: 'HSPU',                  type: 'push', desc: 'Handstand Push-up — elite overhead strength.',                path: '/workout' },
  // Pull
  { name: 'Australian Pull-ups',   type: 'pull', desc: 'Build pulling foundation — body at 45°.',                     path: '/workout' },
  { name: 'Pull-ups',              type: 'pull', desc: 'Strict form, chin over bar.',                                 path: '/workout' },
  { name: 'Chin-ups',              type: 'pull', desc: 'Supinated grip, bicep focus.',                                path: '/workout' },
  { name: 'Wide Grip Pull-ups',    type: 'pull', desc: 'Lat width development.',                                      path: '/workout' },
  { name: 'Hanging Knee Raises',   type: 'pull', desc: 'Core and hip flexor strength.',                               path: '/workout' },
  { name: 'Dead Hang',             type: 'pull', desc: 'Grip strength and shoulder decompression.',                   path: '/skills' },
  // Legs
  { name: 'Bodyweight Squats',     type: 'legs', desc: 'Full depth, controlled pace.',                                path: '/workout' },
  { name: 'Bulgarian Split Squats',type: 'legs', desc: '10 reps each leg — single leg strength.',                     path: '/workout' },
  { name: 'Jump Squats',           type: 'legs', desc: 'Explosive power development.',                                path: '/workout' },
  { name: 'Pistol Squat',          type: 'legs', desc: 'Assisted or full, each leg — advanced.',                     path: '/skills'  },
  { name: 'Hanging Leg Raises',    type: 'legs', desc: 'Straight legs, controlled hip flexion.',                      path: '/workout' },
  { name: 'Calf Raises',           type: 'legs', desc: 'Slow and controlled for maximum burn.',                       path: '/workout' },
  // Core
  { name: 'Plank Hold',            type: 'core', desc: 'Hold 60 s — maintain hollow body.',                           path: '/workout' },
  { name: 'Hollow Body Hold',      type: 'core', desc: 'Foundation for advanced skills.',                              path: '/workout' },
  { name: 'L-Sit',                 type: 'core', desc: 'Parallel bars or floor — hold 10–30 s.',                     path: '/skills'  },
  { name: 'Dragon Flag',           type: 'core', desc: 'Extreme core strength — keep body rigid.',                    path: '/skills'  },
  // Skills
  { name: 'Handstand',             type: 'push', desc: 'Freestanding balance skill — advanced.',                      path: '/skills'  },
  { name: 'Front Lever',           type: 'pull', desc: 'Elite horizontal pulling strength.',                          path: '/skills'  },
  { name: 'Muscle Up',             type: 'pull', desc: 'Explosive pull + dip transition — elite.',                    path: '/skills'  },
  { name: 'Human Flag',            type: 'push', desc: 'Lateral strength — elite body control.',                      path: '/skills'  },
  { name: 'Full Planche',          type: 'push', desc: 'Full body horizontal lever — elite.',                         path: '/skills'  },
]

const TYPE_ICONS = {
  push: 'sports_gymnastics',
  pull: 'back_hand',
  legs: 'directions_run',
  core: 'fitness_center',
}

/* ── Page Quick Links ── */
const PAGES = [
  { label: 'Overview',      icon: 'grid_view',             path: '/'            },
  { label: 'Workouts',      icon: 'exercise',              path: '/workout'     },
  { label: 'Progress',      icon: 'monitoring',            path: '/progress'    },
  { label: 'Activity',      icon: 'local_fire_department', path: '/activity'    },
  { label: 'Weight',        icon: 'monitor_weight',        path: '/weight'      },
  { label: 'Skills',        icon: 'self_improvement',      path: '/skills'      },
  { label: 'Daily Report',  icon: 'summarize',             path: '/daily-report'},
  { label: 'Form Analyzer', icon: 'smart_toy',             path: '/analyzer'   },
  { label: 'Records (PR)',  icon: 'emoji_events',          path: '/records'     },
  { label: 'Profile',       icon: 'account_circle',        path: '/profile'     },
  { label: 'Settings',      icon: 'settings',              path: '/settings'    },
]

export default function GlobalSearch() {
  const { isSearchOpen, setSearchOpen } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [focus, setFocus] = useState(0)
  const inputRef = useRef(null)

  const results = query.trim().length >= 1
    ? [
        ...PAGES.filter(p => p.label.toLowerCase().includes(query.toLowerCase())).map(p => ({ ...p, kind: 'page' })),
        ...EXERCISES.filter(e => e.name.toLowerCase().includes(query.toLowerCase())).map(e => ({ ...e, kind: 'exercise' })),
      ].slice(0, 9)
    : []

  // Focus input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('')
      setFocus(0)
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isSearchOpen])

  // Keyboard: Escape to close, Arrow keys, Enter
  const handleKey = useCallback((e) => {
    if (!isSearchOpen) return
    if (e.key === 'Escape') { setSearchOpen(false); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocus(f => Math.min(f + 1, results.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setFocus(f => Math.max(f - 1, 0)) }
    if (e.key === 'Enter' && results[focus]) pick(results[focus])
  }, [isSearchOpen, results, focus]) // eslint-disable-line

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  // Reset focus when results change
  useEffect(() => { setFocus(0) }, [query])

  function pick(item) {
    navigate(item.path)
    setSearchOpen(false)
    setQuery('')
  }

  if (!isSearchOpen) return null

  return (
    <div className={styles.overlay} onClick={() => setSearchOpen(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Search Input */}
        <div className={styles.inputRow}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '1.375rem' }}>search</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search exercises, pages, skills..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { setQuery(''); inputRef.current?.focus() }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>close</span>
            </button>
          )}
          <kbd className={styles.kbdEsc}>Esc</kbd>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <ul className={styles.results}>
            {results.map((item, i) => (
              <li
                key={i}
                className={`${styles.resultItem} ${i === focus ? styles.focused : ''}`}
                onClick={() => pick(item)}
                onMouseEnter={() => setFocus(i)}
              >
                <div className={`${styles.resultIcon} ${item.kind === 'exercise' ? styles[item.type] : styles.page}`}>
                  <span className="material-symbols-outlined">
                    {item.kind === 'page' ? item.icon : TYPE_ICONS[item.type] || 'fitness_center'}
                  </span>
                </div>
                <div className={styles.resultText}>
                  <span className={styles.resultName}>{item.name || item.label}</span>
                  {item.desc && <span className={styles.resultDesc}>{item.desc}</span>}
                </div>
                {item.kind === 'exercise' && (
                  <span className={`${styles.typeBadge} ${styles[item.type]}`}>{item.type}</span>
                )}
                {item.kind === 'page' && (
                  <span className={styles.pageBadge}>Page</span>
                )}
              </li>
            ))}
          </ul>
        ) : query.trim().length >= 1 ? (
          <div className={styles.noResults}>
            <span className="material-symbols-outlined">search_off</span>
            <p>No results for "<strong>{query}</strong>"</p>
          </div>
        ) : (
          <div className={styles.hints}>
            <p className={styles.hintsLabel}>Quick Nav</p>
            <div className={styles.hintsGrid}>
              {PAGES.slice(0, 6).map(p => (
                <button key={p.path} className={styles.hintChip} onClick={() => pick(p)}>
                  <span className="material-symbols-outlined">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  )
}
