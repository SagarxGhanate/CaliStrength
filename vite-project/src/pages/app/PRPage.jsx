import { useState, useMemo, useEffect, useRef } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { formatDateStandard } from '../../utils/dateUtils'
import styles from './PRPage.module.css'

const DEFAULT_SUGGESTIONS = [
  { group: 'Push', items: ['Pushups', 'Diamond Pushups', 'Dips'] },
  { group: 'Pull', items: ['Pull-ups', 'Australian Pull-ups', 'Chin-ups'] },
  { group: 'Core', items: ['Plank', 'Crunches'] },
  { group: 'Legs', items: ['Squats', 'Lunges'] }
]

export default function PRPage() {
  const { appData } = useApp()
  const { allExerciseReps = [] } = appData
  const [selectedEx, setSelectedEx] = useState('')
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [progressRange, setProgressRange] = useState('1M') // '1W', '1M', 'ALL'
  const searchRef = useRef(null)

  // Derived Data
  const sortedExercises = useMemo(() => {
    return [...allExerciseReps].sort((a, b) => (b.highestPR || 0) - (a.highestPR || 0))
  }, [allExerciseReps])

  const topExercises = sortedExercises.slice(0, 5)


  // Handle clicking outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Chart Data
  const activeExData = sortedExercises.find(ex => ex.name.toLowerCase() === selectedEx.toLowerCase())
  
  const chartBars = useMemo(() => {
    let daysArr = []
    const now = new Date()
    now.setHours(0,0,0,0)

    if (progressRange === '1W') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        daysArr.push(d)
      }
    } else if (progressRange === '1M') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        daysArr.push(d)
      }
    } else if (progressRange === 'ALL') {
      // If there's an active exercise, use its history start date
      let labels = []
      if (activeExData && activeExData.daysLogged) {
        labels = Object.keys(activeExData.daysLogged).sort((a, b) => new Date(a) - new Date(b))
      }
      
      if (labels.length > 0) {
        let startD = new Date(labels[0])
        startD.setHours(0,0,0,0)
        let curr = new Date(startD)
        if ((now - startD) < 86400000 * 5) curr.setDate(curr.getDate() - 2)
        while (curr <= now) {
          daysArr.push(new Date(curr))
          curr.setDate(curr.getDate() + 1)
        }
      } else {
        // Default to last 30 days if ALL is selected but no data
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now)
          d.setDate(d.getDate() - i)
          daysArr.push(d)
        }
      }
    }

    const dataPts = daysArr.map((d, i) => {
      // WorkoutPage uses this exact format for saving:
      const dateKey = formatDateStandard(d)
      
      let val = 0
      if (activeExData && activeExData.daysLogged) {
        const dayData = activeExData.daysLogged[dateKey]
        val = dayData ? (dayData.maxSetReps || dayData.reps || 0) : 0
      }
      
      let label = ''
      if (progressRange === '1W') {
        label = d.toLocaleDateString('en-US', { weekday: 'short' })[0]
      } else if (progressRange === '1M') {
        if (i % 5 === 0 || i === daysArr.length - 1) {
          label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      } else if (progressRange === 'ALL') {
        if (i % Math.ceil(daysArr.length / 7) === 0 || i === daysArr.length - 1) {
          label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      }

      return {
        id: i,
        val,
        date: formatDateStandard(d),
        axisLabel: label,
        active: i === daysArr.length - 1
      }
    })

    if (dataPts.length === 0) return []

    const maxVal = Math.max(...dataPts.map(d => d.val), 5) // ensure min height scale
    
    return dataPts.map(pt => ({
      ...pt,
      height: (pt.val / maxVal) * 100 // 0 to 100%
    }))
  }, [activeExData, progressRange])

  // Suggestions Logic
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return null // Return null to indicate we should show default groups
    
    const query = searchQuery.toLowerCase()
    const matches = new Set()
    
    // Check logged exercises
    sortedExercises.forEach(ex => {
      if (ex.name.toLowerCase().includes(query)) matches.add(ex.name)
    })
    
    // Check default exercises
    DEFAULT_SUGGESTIONS.forEach(group => {
      group.items.forEach(item => {
        if (item.toLowerCase().includes(query)) matches.add(item)
      })
    })
    
    return Array.from(matches)
  }, [searchQuery, sortedExercises])

  const handleSelectExercise = (exName) => {
    setSelectedEx(exName)
    setSearchQuery(exName)
    setIsSearchFocused(false)
  }

  return (
    <>
      <AppHeader icon="emoji_events" title="Personal Records" />
      
      <div className={styles.container}>
        <div className={styles.prHeader}>
          <h2 className={styles.sectionTitle}>Strength Progression</h2>
          <p className={styles.sectionSubtitle}>Track your Personal Records and Max Reps over time</p>
        </div>

        {sortedExercises.length === 0 ? (
          <div className={styles.noDataMsg}>No exercise data logged yet. Start a workout to see your PRs!</div>
        ) : (
          <div className={styles.prGrid}>
            <div className={styles.chartCard}>
              <div className={styles.chartHeader}>
                <div className={styles.chartControls} ref={searchRef} style={{ margin: 0 }}>
                  <div className={styles.searchContainer}>
                    <div className={styles.searchInputWrap}>
                      <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                      <input 
                        type="text" 
                        className={styles.searchInput}
                        placeholder="Search exercise..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                      />
                    </div>
                    
                    {isSearchFocused && (
                      <div className={styles.suggestionsDropdown}>
                        {filteredSuggestions === null ? (
                          // Show default groups
                          DEFAULT_SUGGESTIONS.map((group, idx) => (
                            <div key={idx}>
                              <div className={styles.suggestionGroupLabel}>{group.group}</div>
                              {group.items.map(item => (
                                <div 
                                  key={item} 
                                  className={styles.suggestionItem}
                                  onClick={() => handleSelectExercise(item)}
                                >
                                  <span className="material-symbols-outlined">fitness_center</span>
                                  {item}
                                </div>
                              ))}
                            </div>
                          ))
                        ) : filteredSuggestions.length > 0 ? (
                          // Show filtered list
                          filteredSuggestions.map(item => (
                            <div 
                              key={item} 
                              className={styles.suggestionItem}
                              onClick={() => handleSelectExercise(item)}
                            >
                              <span className="material-symbols-outlined">fitness_center</span>
                              {item}
                            </div>
                          ))
                        ) : (
                          <div className={styles.suggestionItem} style={{ color: 'var(--text-tertiary)', cursor: 'default' }}>
                            No exercises found matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.filterTabs}>
                  <button className={`${styles.filterBtn} ${progressRange === '1W' ? styles.active : ''}`} onClick={() => setProgressRange('1W')}>1W</button>
                  <button className={`${styles.filterBtn} ${progressRange === '1M' ? styles.active : ''}`} onClick={() => setProgressRange('1M')}>1M</button>
                  <button className={`${styles.filterBtn} ${progressRange === 'ALL' ? styles.active : ''}`} onClick={() => setProgressRange('ALL')}>All Time</button>
                </div>
              </div>
              
              <div className={styles.chartPlaceholder} style={{ gap: progressRange === 'ALL' ? '2px' : '8px' }}>
                {chartBars.map((bar) => (
                  <div 
                    key={bar.id} 
                    className={`${styles.bar} ${bar.active ? styles.active : ''}`} 
                    style={{ height: `${Math.max(bar.height, 2)}%`, opacity: bar.val > 0 ? 1 : 0.3 }}
                  >
                    {bar.val > 0 && <div className={styles.tooltip}>{bar.val} reps</div>}
                    <div className={styles.axisLabel}>{bar.axisLabel}</div>
                  </div>
                ))}
                {!selectedEx && (
                  <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', padding: '0.75rem 1.5rem', borderRadius: '2rem', backdropFilter: 'blur(4px)', color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
                    Search and select an exercise to view its progression.
                  </div>
                )}
              </div>
            </div>

            <div className={styles.prListCard}>
              <h3 className={styles.cardTitle}>All-Time Records</h3>
              <div className={styles.prList}>
                {topExercises.map(ex => {
                  const dates = Object.keys(ex.daysLogged || {})
                  const latestDateStr = dates.length > 0 ? dates.sort().reverse()[0] : null
                  let latestDate = 'Never'
                  if (latestDateStr) {
                    latestDate = formatDateStandard(new Date(latestDateStr))
                  }

                  return (
                    <div 
                      key={ex.name} 
                      className={styles.prItem}
                      onClick={() => handleSelectExercise(ex.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.prIcon}>
                        <span className="material-symbols-outlined">emoji_events</span>
                      </div>
                      <div className={styles.prInfo}>
                        <p className={styles.prName}>{ex.name}</p>
                        <p className={styles.prDate}>Last updated: {latestDate}</p>
                      </div>
                      <div className={styles.prValue}>{ex.highestPR || 0}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
