import { useState, useMemo } from 'react'
import AppHeader from '../../components/layout/AppHeader'
import { useApp } from '../../context/AppContext'
import { formatDateStandard } from '../../utils/dateUtils'
import styles from './WeightPage.module.css'

export default function WeightPage() {
  const { appData, setAppData } = useApp()
  const { weightHistory = [], profile = {}, startDate } = appData
  const [newWeight, setNewWeight] = useState('')
  const [popupMsg, setPopupMsg] = useState(null)
  const [popupType, setPopupType] = useState('success')

  // Derived Data
  const targetWeight = profile.targetWeight || 70.0
  const latestWeight = weightHistory.length > 0 ? parseFloat(weightHistory[weightHistory.length - 1].weight) : 0
  const previousWeight = weightHistory.length > 1 ? parseFloat(weightHistory[weightHistory.length - 2].weight) : latestWeight
  
  const diff = (latestWeight - previousWeight).toFixed(1)
  const diffAbs = Math.abs(diff)
  const targetDiff = Math.abs(latestWeight - targetWeight).toFixed(1)

  // Goal-based color and arrow logic
  const goalStr = (appData.goal || 'fit').toLowerCase()
  let diffColor = styles.textNeu
  let diffIcon = 'trending_flat'

  if (diff > 0) {
    if (goalStr.includes('gain')) { diffColor = styles.textGreen; diffIcon = 'arrow_upward' }
    else if (goalStr.includes('lose') || goalStr.includes('loose')) { diffColor = styles.textRed; diffIcon = 'arrow_upward' }
    else { diffColor = styles.textGreen; diffIcon = 'arrow_upward' } // Stay fit increase -> Green
  } else if (diff < 0) {
    if (goalStr.includes('gain')) { diffColor = styles.textRed; diffIcon = 'arrow_downward' }
    else if (goalStr.includes('lose') || goalStr.includes('loose')) { diffColor = styles.textGreen; diffIcon = 'arrow_downward' }
    else { diffColor = styles.textYellow; diffIcon = 'arrow_downward' } // Stay fit decrease -> Yellow
  }

  // Cycle Status
  const daysPassed = useMemo(() => {
    if (!startDate) return 0
    const start = new Date(startDate)
    const now = new Date()
    return Math.floor((now - start) / (1000 * 60 * 60 * 24))
  }, [startDate])
  
  const targetDays = 30
  const remainingDays = Math.max(0, targetDays - (daysPassed % targetDays))
  const progressPct = ((targetDays - remainingDays) / targetDays) * 100

  // Handle Add Weight
  const handleAddWeight = (e) => {
    e.preventDefault()
    const w = parseFloat(newWeight)
    if (isNaN(w) || w <= 0) return

    const now = new Date()
    const dateStr = formatDateStandard(now)
    
    // Check if logged today
    const alreadyLoggedToday = weightHistory.some(h => h.date === dateStr)
    
    if (alreadyLoggedToday) {
      setPopupType('error')
      setPopupMsg('User can add weight only once a day.')
      setNewWeight('')
      return
    }

    const newHistory = [...weightHistory, { date: dateStr, weight: w.toFixed(1) }]
    const newData = { ...appData, weightHistory: newHistory }
    
    setAppData(newData)
    setNewWeight('')
    setPopupType('success')
    setPopupMsg('Weight added successfully!')
    
    // Also mark the reminder as dismissed so the global popup doesn't show again today
    const localIsoDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().split('T')[0]
    localStorage.setItem('weight_reminder_dismissed', localIsoDate)
  }

  // Chart Data
  const chartBars = useMemo(() => {
    const NUM_BARS = 17 // Match 2.0 HTML exactly
    
    // Dummy state when no history exists to match 2.0 beautiful default graph
    if (weightHistory.length === 0) {
      const dummyHeights = [60, 58, 59, 55, 54, 55, 53, 51, 50, 52, 48, 47, 46, 45, 44, 43, 42.5]
      const dummyDates = ['Feb 01', '', '', 'Feb 08', '', '', 'Feb 15', '', '', 'Feb 22', '', '', 'Mar 01', '', '', '', '']
      return dummyHeights.map((h, i) => ({
        id: `dummy-${i}`,
        height: h,
        weight: i === 0 ? 74.2 : 0,
        label: dummyDates[i] || '',
        active: i >= 13,
        recent: i >= 7 && i < 13
      }))
    }

    const recentHistory = [...weightHistory].slice(-NUM_BARS)
    const weights = recentHistory.map(h => parseFloat(h.weight))
    const minW = Math.min(...weights)
    const maxW = Math.max(...weights)
    const range = Math.max(maxW - minW, 1)
    
    // If all logged weights are the same, display them at 60% height instead of 20% flatline
    const isFlatline = (maxW === minW)

    const bars = []
    const emptyCount = NUM_BARS - recentHistory.length
    
    // Left-pad with empty bars (20% height)
    for (let i = 0; i < emptyCount; i++) {
      bars.push({ id: `empty-${i}`, height: 20, weight: 0, label: '', active: false, recent: false })
    }

    recentHistory.forEach((h, i) => {
      const w = parseFloat(h.weight)
      const height = isFlatline ? 60 : (((w - minW) / range) * 60 + 20)
      const active = i === recentHistory.length - 1
      const recent = !active && i >= recentHistory.length - 4
      
      const reverseIdx = recentHistory.length - 1 - i
      // Match 2.0 logic: "Show date on every 3rd bar from the end"
      const label = reverseIdx % 3 === 0 ? h.date.split(' ').slice(0, 2).join(' ') : '' 
      
      bars.push({ id: `data-${i}`, height, weight: w, label, active, recent })
    })

    return bars
  }, [weightHistory])

  const axisLabels = chartBars.map(b => b.label)

  return (
    <>
      <AppHeader icon="monitor_weight" title="Weight Overview" />
      <div className={styles.container}>
        
        {/* STATS ROW */}
        <div className={styles.statsGrid}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>Cycle Status</p>
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div>
              <p className={styles.cardValue}>Day {daysPassed % targetDays} of {targetDays}</p>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar} style={{ width: `${progressPct}%` }}></div>
              </div>
            </div>
            <p className={`${styles.cardFooterText} ${styles.textPrimary}`}>{remainingDays} days remaining</p>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>Daily Weight</p>
              <span className="material-symbols-outlined">monitor_weight</span>
            </div>
            <p className={styles.cardValue}>{latestWeight || '—'} kg</p>
            {weightHistory.length > 1 && diff !== "0.0" && (
              <div className={diffColor}>
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  {diffIcon}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{diffAbs}Kg from yesterday</span>
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>Target Weight</p>
              <span className="material-symbols-outlined">flag</span>
            </div>
            <p className={styles.cardValue}>{targetWeight.toFixed(1)} kg</p>
            <div className={styles.targetFooter}>
              <p className={styles.cardLabel}>{targetDiff} kg to go</p>
              <button className={styles.setTargetBtn}>
                Set Target <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <p className={styles.cardLabel}>Avg Body Fat</p>
              <span className="material-symbols-outlined">percent</span>
            </div>
            <p className={styles.cardValue}>{profile.bodyFat || '14'}%</p>
            <p className={styles.cardLabel}>Stable last 7 days</p>
          </div>
        </div>

        {/* GRAPH SECTION */}
        <div className={styles.graphSection}>
          <div className={styles.graphHeader}>
            <div className={styles.graphTitle}>
              <h3>Progress Graph</h3>
              <p>Weight trend over the last 30 days</p>
            </div>
            <div className={styles.filterTabs}>
              <button className={`${styles.filterBtn} ${styles.active}`}>1M</button>
              <button className={styles.filterBtn}>3M</button>
              <button className={styles.filterBtn}>6M</button>
              <button className={styles.filterBtn}>YTD</button>
            </div>
          </div>
          
          <div className={styles.chartPlaceholder}>
            {chartBars.map((bar, i) => (
              <div key={bar.id} className={`${styles.bar} ${bar.active ? styles.active : ''} ${bar.recent ? styles.recent : ''}`} style={{ height: `${bar.height}%` }}>
                {bar.weight > 0 && <div className={styles.tooltip}>{bar.weight.toFixed(1)} kg</div>}
              </div>
            ))}
          </div>
          <div className={styles.axisLabels}>
            {axisLabels.map((lbl, i) => <span key={i} style={{ flex: 1, textAlign: 'center' }}>{lbl || '\u00A0'}</span>)}
          </div>
        </div>

        {/* ADD WEIGHT FORM */}
        <div className={styles.addWeightSection}>
          <h3>Add Today's Weight</h3>
          <form className={styles.weightForm} onSubmit={handleAddWeight}>
            <input 
              type="number" 
              step="0.1" 
              className={styles.inpWeight} 
              placeholder="Enter weight (kg)" 
              min="20" 
              max="300" 
              required
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
            />
            <button type="submit" className={styles.btnAdd}>
              <span className="material-symbols-outlined">add</span>
              Add Weight
            </button>
          </form>
          <p className={styles.addWeightNote}>Weight can only be logged once per day</p>
        </div>

        {/* HISTORY TABLE */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3>Weight History</h3>
            <a href="#" className={styles.viewAll}>
              View All <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            </a>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {[...weightHistory].reverse().map((entry, i, arr) => {
                  const prevWeight = i < arr.length - 1 ? parseFloat(arr[i + 1].weight) : null
                  const currentWeight = parseFloat(entry.weight)
                  let diffLabel = '—'
                  let diffClass = styles.diffNeu
                  
                  if (prevWeight !== null) {
                    const diffVal = (currentWeight - prevWeight).toFixed(1)
                    if (diffVal > 0) {
                      diffLabel = `+${diffVal} kg`
                      diffClass = styles.diffPos // Weight gain: Green
                    } else if (diffVal < 0) {
                      diffLabel = `${diffVal} kg`
                      diffClass = styles.diffNeg // Weight loss: Red
                    } else {
                      diffLabel = '0.0 kg'
                    }
                  }

                  return (
                    <tr key={i}>
                      <td>{entry.date}</td>
                      <td className={styles.tdWeight}>{entry.weight} kg</td>
                      <td className={diffClass}>{diffLabel}</td>
                    </tr>
                  )
                })}
                {weightHistory.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                      No weight logged yet — add your first entry above
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* POPUP MODAL */}
      {popupMsg && (
        <div className={styles.popupOverlay} onClick={() => setPopupMsg(null)}>
          <div className={styles.popupModal} onClick={e => e.stopPropagation()}>
            <div className={styles.popupIcon} style={{ color: popupType === 'success' ? '#22c55e' : '#ef4444' }}>
              <span className="material-symbols-outlined">{popupType === 'success' ? 'check_circle' : 'error'}</span>
            </div>
            <h3>{popupType === 'success' ? 'Success' : 'Notice'}</h3>
            <p>{popupMsg}</p>
            <button onClick={() => setPopupMsg(null)} className={styles.popupBtn}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}
