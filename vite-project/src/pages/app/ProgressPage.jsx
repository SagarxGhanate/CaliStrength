import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import AppHeader from '../../components/layout/AppHeader'
import { formatDateStandard, toLocalDateStr, parseStoredDate } from '../../utils/dateUtils'
import styles from './ProgressPage.module.css'

export default function ProgressPage() {
  const { appData } = useApp()
  const { workoutHistory = [], weightHistory = [] } = appData || {}

  // --- STATS CALCULATION ---
  const sessions = workoutHistory.length
  const totalReps = workoutHistory.reduce((acc, w) => acc + (w.totalReps || 0), 0)
  const totalSeconds = workoutHistory.reduce((acc, w) => acc + (w.totalSeconds || (w.duration ? w.duration * 60 : 0)), 0)
  
  let avgDurationStr = '0m'
  if (sessions > 0) {
    const avgSecs = Math.round(totalSeconds / sessions)
    const m = Math.floor(avgSecs / 60)
    const s = avgSecs % 60
    avgDurationStr = m > 0 ? `${m}m` : `${s}s`
  }

  const [progressRange, setProgressRange] = useState('1W') // '1W', '1M', 'ALL'
  
  // --- PROGRESS CHART (Weekly/Monthly/All-Time) ---
  const chartDataProgress = useMemo(() => {
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
      const year = now.getFullYear()
      const month = now.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let i = 1; i <= daysInMonth; i++) {
        daysArr.push(new Date(year, month, i))
      }
    } else if (progressRange === 'ALL') {
      let startD = new Date(now.getFullYear(), now.getMonth(), 1)
      if (appData.startDate) {
        const sd = parseStoredDate(appData.startDate)
        if (!isNaN(sd.getTime())) startD = new Date(sd.getFullYear(), sd.getMonth(), 1)
      } else if (workoutHistory.length > 0) {
        const sorted = [...workoutHistory].sort((a,b) => parseStoredDate(a.date) - parseStoredDate(b.date))
        const oldest = parseStoredDate(sorted[0].date)
        if (!isNaN(oldest.getTime())) startD = new Date(oldest.getFullYear(), oldest.getMonth(), 1)
      }
      if (startD > now) startD = new Date(now.getFullYear(), now.getMonth(), 1)
      
      let curr = new Date(startD)
      while (curr <= now) {
        daysArr.push(new Date(curr))
        curr.setDate(curr.getDate() + 1)
      }
    }

    // Build a map of YYYY-MM-DD → total reps from workoutHistory
    const repsMap = {}
    workoutHistory.forEach(w => {
      const key = toLocalDateStr(w.date)
      repsMap[key] = (repsMap[key] || 0) + (w.totalReps || 0)
    })
    
    const days = daysArr.map((d, index) => {
      const dateKey = toLocalDateStr(d)
      const dateDisplay = formatDateStandard(d)
      let dayName = ''
      
      if (progressRange === '1W') {
        dayName = d.toLocaleDateString('en-US', { weekday: 'short' })[0]
      } else if (progressRange === '1M') {
        const dateNum = d.getDate()
        dayName = (dateNum === 1 || dateNum % 5 === 0) ? dateNum.toString() : ''
      } else if (progressRange === 'ALL') {
        if (d.getDate() === 1) dayName = d.toLocaleDateString('en-US', { month: 'short' })
      }
      
      return {
        label: dayName,
        date: dateDisplay,
        reps: repsMap[dateKey] || 0,
        isToday: d.getTime() === now.getTime()
      }
    })
    
    const maxReps = Math.max(...days.map(d => d.reps), 10)
    return { days, maxReps }
  }, [workoutHistory, progressRange, appData.startDate])

  // --- MUSCLE FOCUS DONUT ---
  const donutData = useMemo(() => {
    let push = 0, pull = 0, legs = 0, core = 0
    workoutHistory.forEach(w => {
      if (w.split === 'push') push++
      else if (w.split === 'pull') pull++
      else if (w.split === 'legs') legs++
      else if (w.split === 'core') core++
    })
    const total = push + pull + legs + core || 1 // prevent div by zero
    
    // Circumference of r=65 is 2 * PI * 65 ≈ 408.4
    const C = 408.4
    
    // Percentages
    const pPush = push / total
    const pPull = pull / total
    const pLegs = legs / total
    const pCore = core / total

    // Offsets
    // Push starts at 0
    const pushOffset = C - (C * pPush)
    
    // Pull starts after Push
    const pullOffset = C - (C * pPull)
    const pullStart = C * pPush
    
    // Legs starts after Pull
    const legsOffset = C - (C * pLegs)
    const legsStart = pullStart + (C * pPull)
    
    // Core starts after Legs
    const coreOffset = C - (C * pCore)
    const coreStart = legsStart + (C * pLegs)

    return {
      totalReal: push + pull + legs + core,
      stats: [
        { name: 'Push', pct: Math.round(pPush * 100), offset: pushOffset, start: 0, color: 'var(--color-push, #3b82f6)' },
        { name: 'Pull', pct: Math.round(pPull * 100), offset: pullOffset, start: pullStart, color: 'var(--color-pull, #ef4444)' },
        { name: 'Legs', pct: Math.round(pLegs * 100), offset: legsOffset, start: legsStart, color: 'var(--color-legs, #eab308)' },
        { name: 'Core', pct: Math.round(pCore * 100), offset: coreOffset, start: coreStart, color: 'var(--color-core, #22c55e)' }
      ]
    }
  }, [workoutHistory])

  // --- RECENT ACTIVITY (Last 5) ---
  const recentWorkouts = [...workoutHistory].reverse().slice(0, 5)

  // --- WEIGHT HISTORY (Last 10 + Chart data) ---
  const sortedWeights = useMemo(() => {
    const sorted = [...weightHistory].sort((a, b) => parseStoredDate(a.date) - parseStoredDate(b.date))
    // Deduplicate by date — keep only the latest entry per day
    const unique = []
    const seen = new Set()
    for (let i = sorted.length - 1; i >= 0; i--) {
      const dateKey = toLocalDateStr(sorted[i].date)
      if (!seen.has(dateKey)) {
        seen.add(dateKey)
        unique.unshift(sorted[i])
      }
    }
    return unique
  }, [weightHistory])
  const recentWeights = [...sortedWeights].reverse().slice(0, 5)
  
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [weightRange, setWeightRange] = useState('1M') // '1W', '1M', 'ALL'

  // Chart calculation
  const chartData = useMemo(() => {
    if (sortedWeights.length === 0) return null
    
    let pts = []
    const now = new Date()
    now.setHours(0,0,0,0)
    
    if (weightRange === '1W') {
      const oneWeekAgo = new Date(now)
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 6)
      pts = sortedWeights.filter(w => parseStoredDate(w.date) >= oneWeekAgo && parseStoredDate(w.date) <= new Date())
    } else if (weightRange === '1M') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      pts = sortedWeights.filter(w => {
        const d = parseStoredDate(w.date)
        return d >= startOfMonth && d <= endOfMonth
      })
    } else {
      let startD = new Date(now.getFullYear(), now.getMonth(), 1)
      if (appData.startDate) {
        const sd = parseStoredDate(appData.startDate)
        if (!isNaN(sd.getTime())) startD = new Date(sd.getFullYear(), sd.getMonth(), 1)
      } else if (weightHistory.length > 0) {
        const oldest = parseStoredDate(sortedWeights[0].date)
        if (!isNaN(oldest.getTime())) startD = new Date(oldest.getFullYear(), oldest.getMonth(), 1)
      }
      pts = sortedWeights.filter(w => parseStoredDate(w.date) >= startD)
    }
    
    // Fallback if no points in range
    if (pts.length === 0) pts = sortedWeights.slice(-2)
    
    let minW = Math.min(...pts.map(p => parseFloat(p.weight)))
    let maxW = Math.max(...pts.map(p => parseFloat(p.weight)))
    
    // Target an exact buffer of at least 2kg above and below even if difference is 0.1kg
    if (maxW - minW < 1.0) {
      const center = (maxW + minW) / 2
      minW = center - 2
      maxW = center + 2
    } else {
      const buffer = (maxW - minW) * 0.25
      minW -= buffer
      maxW += buffer
    }

    const w = 800
    const h = 320
    const paddingLeft = 60
    const paddingRight = 40
    const paddingTop = 40
    const paddingBottom = 40

    const xStep = pts.length > 1 ? (w - paddingLeft - paddingRight) / (pts.length - 1) : 0
    const scaleY = (val) => h - paddingBottom - ((val - minW) / (maxW - minW)) * (h - paddingTop - paddingBottom)

    const points = pts.map((pt, i) => {
      let x = paddingLeft + i * xStep
      if (pts.length === 1) x = w / 2
      const y = scaleY(parseFloat(pt.weight))
      return { x, y, weight: pt.weight, date: pt.date }
    })

    // Smooth Curve Engine
    let lineD = ''
    if (points.length === 1) {
      lineD = `M ${points[0].x - 15},${points[0].y} L ${points[0].x + 15},${points[0].y}`
    } else {
      lineD = `M ${points[0].x},${points[0].y}`
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2
        lineD += ` C ${xc},${points[i].y} ${xc},${points[i+1].y} ${points[i+1].x},${points[i+1].y}`
      }
    }

    let areaD = ''
    if (points.length === 1) {
      areaD = `M ${points[0].x - 15},${points[0].y} L ${points[0].x + 15},${points[0].y} L ${points[0].x + 15},${h - paddingBottom} L ${points[0].x - 15},${h - paddingBottom} Z`
    } else {
      areaD = lineD + ` L ${points[points.length - 1].x},${h - paddingBottom} L ${points[0].x},${h - paddingBottom} Z`
    }

    // Grid lines (Horizontal)
    const gridLines = []
    const steps = 4
    for (let i = 0; i <= steps; i++) {
      const labelVal = maxW - (i * ((maxW - minW) / steps))
      const y = scaleY(labelVal)
      gridLines.push({ y, label: labelVal.toFixed(1) })
    }

    // X-Axis labels
    const xLabels = points.filter((p, i) => 
      i === 0 || i === points.length - 1 || pts.length < 8 || i % Math.ceil(pts.length / 5) === 0
    ).map(p => ({ x: p.x, label: p.date.toUpperCase() }))

    return { points, lineD, areaD, gridLines, xLabels, h, paddingBottom, paddingLeft, w, paddingRight }
  }, [sortedWeights])

  return (
    <>
      <AppHeader icon="monitoring" title="Progress" />
      <div className={styles.contentInner}>
        
        {/* STATS ROW */}
        <div className={`${styles.statsRow} animateFadeUp delay1`}>
          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className="material-symbols-outlined">fitness_center</span>
              <p className={styles.statLabel}>Sessions</p>
            </div>
            <p className={styles.statValue}>{sessions}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className="material-symbols-outlined">rebase_edit</span>
              <p className={styles.statLabel}>Total Reps</p>
            </div>
            <p className={styles.statValue}>{totalReps}</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statCardTop}>
              <span className="material-symbols-outlined">timer</span>
              <p className={styles.statLabel}>Avg. Duration</p>
            </div>
            <p className={styles.statValue}>{avgDurationStr}</p>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className={`${styles.chartsRow} animateFadeUp delay2`}>
          
          {/* Dynamic Progress */}
          <section className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <div>
                <p className={styles.chartSubtitle}>
                  {progressRange === '1W' ? 'Weekly' : progressRange === '1M' ? 'Monthly' : '90-Day'} Progress
                </p>
                <p className={styles.chartValue}>
                  {chartDataProgress.days.reduce((a, d) => a + d.reps, 0)} Reps
                </p>
              </div>
              <div className={styles.filterTabs}>
                <button className={`${styles.filterBtn} ${progressRange === '1W' ? styles.active : ''}`} onClick={() => setProgressRange('1W')}>1W</button>
                <button className={`${styles.filterBtn} ${progressRange === '1M' ? styles.active : ''}`} onClick={() => setProgressRange('1M')}>1M</button>
                <button className={`${styles.filterBtn} ${progressRange === 'ALL' ? styles.active : ''}`} onClick={() => setProgressRange('ALL')}>All Time</button>
              </div>
            </div>
            <div className={styles.barChart} style={{ gap: progressRange === 'ALL' ? '1px' : (progressRange === '1M' ? '2px' : '0.5rem') }}>
              {chartDataProgress.days.map((day, i) => (
                <div key={i} className={styles.barCol}>
                  <div className={styles.barTooltip}>
                    <span style={{ color: 'var(--text-secondary)' }}>{day.date}</span><br />
                    <span style={{ color: 'var(--primary)', fontSize: '0.8125rem' }}>{day.reps} Reps</span>
                  </div>
                  <div 
                    className={`${styles.barFill} ${day.isToday ? styles.barActive : ''}`} 
                    style={{ height: `${Math.max((day.reps / chartDataProgress.maxReps) * 100, 5)}%`, borderRadius: progressRange === 'ALL' ? '1px 1px 0 0' : '4px 4px 0 0' }}
                  ></div>
                  {day.label && <span className={`${styles.barLabel} ${day.isToday ? styles.activeLabel : ''}`}>{day.label}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Muscle Focus */}
          <section className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Muscle Focus</h2>
            <div className={styles.donutWrapper}>
              <div className={styles.donutContainer}>
                <svg className={styles.donutSvg} viewBox="0 0 160 160">
                  <circle className={styles.donutTrack} cx="80" cy="80" r="65" fill="transparent" strokeWidth="14" />
                  {donutData.stats.map((stat, i) => (
                    <circle 
                      key={i}
                      cx="80" cy="80" r="65" 
                      fill="transparent" 
                      strokeWidth="14" 
                      strokeDasharray="408.4" 
                      strokeDashoffset={stat.offset}
                      style={{ stroke: stat.color, transform: `rotate(${stat.start}deg)`, transformOrigin: 'center' }}
                    />
                  ))}
                </svg>
                <div className={styles.donutLabel}>
                  <span className={styles.donutSub}>Total</span>
                  <span className={styles.donutPct}>{donutData.totalReal}</span>
                </div>
              </div>
              <div className={styles.donutLegend}>
                {donutData.stats.map((stat, i) => (
                  <div key={i} className={styles.legendItem}>
                    <div className={styles.legendDot} style={{backgroundColor: stat.color}}></div>
                    <span>{stat.name} ({stat.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* RECENT ACTIVITY */}
        <section className={`${styles.tableSection} animateFadeUp delay3`}>
          <div className={styles.tableHeader}>
            <h3>Recent Activity</h3>
            <Link to="/activity" className={styles.viewAll}>
              See all activity <span className="material-symbols-outlined" style={{fontSize: 16}}>chevron_right</span>
            </Link>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{width: '33.33%'}}>Workout</th>
                  <th style={{width: '33.33%'}}>Date</th>
                  <th style={{width: '33.33%'}}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {recentWorkouts.length > 0 ? recentWorkouts.map((w, i) => (
                  <tr key={i}>
                    <td>{w.label} - {w.split}</td>
                    <td>{w.date}</td>
                    <td>{Math.round((w.totalSeconds || 0) / 60)} min</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" style={{color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem'}}>
                      No workouts logged yet — your recent activity will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* WEIGHT HISTORY */}
        <section className={`${styles.tableSection} animateFadeUp delay4`}>
          <div className={styles.tableHeader}>
            <h3>Weight History</h3>
            <Link to="/weight" className={styles.viewAll}>
              View All <span className="material-symbols-outlined" style={{fontSize: 16}}>chevron_right</span>
            </Link>
          </div>
          <div className={styles.tableWrapper}>
            <table>
              <thead>
                <tr>
                  <th style={{width: '33.33%'}}>Date</th>
                  <th style={{width: '33.33%'}}>Weight</th>
                  <th style={{width: '33.33%'}}>Difference</th>
                </tr>
              </thead>
              <tbody>
                {recentWeights.length > 0 ? recentWeights.map((w, i) => {
                  let diffLabel = '--'
                  let diffClass = styles.diffNeu
                  if (i < recentWeights.length - 1) {
                    const prev = recentWeights[i + 1].weight
                    const diff = w.weight - prev
                    if (diff > 0) { diffLabel = `+${diff.toFixed(1)} kg`; diffClass = styles.diffPos }
                    else if (diff < 0) { diffLabel = `${diff.toFixed(1)} kg`; diffClass = styles.diffNeg }
                    else { diffLabel = '0.0 kg' }
                  }
                  
                  return (
                    <tr key={i}>
                      <td>{w.date}</td>
                      <td className={styles.tdWeight}>{w.weight} kg</td>
                      <td className={diffClass}>{diffLabel}</td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="3" style={{color: 'var(--text-tertiary)', fontStyle: 'italic', textAlign: 'center', padding: '2rem'}}>
                      No weight logged yet — add your first entry on the Weight page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* WEIGHT CHART */}
        {chartData && (
          <section className={styles.tableSection} style={{ border: 'none', background: 'transparent' }}>
            <div className={styles.tableHeader} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderBottom: 'none', borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className={styles.chartHeader} style={{ flex: 1 }}>
                <div>
                  <p className={styles.chartSubtitle}>
                    {weightRange === '1W' ? 'Weekly' : weightRange === '1M' ? 'Monthly' : 'All Time'} Weight Trend
                  </p>
                </div>
                <div className={styles.filterTabs}>
                  <button className={`${styles.filterBtn} ${weightRange === '1W' ? styles.active : ''}`} onClick={() => setWeightRange('1W')}>1W</button>
                  <button className={`${styles.filterBtn} ${weightRange === '1M' ? styles.active : ''}`} onClick={() => setWeightRange('1M')}>1M</button>
                  <button className={`${styles.filterBtn} ${weightRange === 'ALL' ? styles.active : ''}`} onClick={() => setWeightRange('ALL')}>All Time</button>
                </div>
              </div>
            </div>
            <div className={styles.chartContainer} style={{ position: 'relative', marginTop: 0, borderRadius: '0 0 var(--radius-xl) var(--radius-xl)', borderTop: 'none' }}>
              <svg viewBox="0 0 800 320" style={{width: '100%', height: 'auto', display: 'block', overflow: 'visible'}}>
                <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <g id="grid">
                {chartData.gridLines.map((line, i) => (
                  <g key={`grid-${i}`}>
                    <line x1={chartData.paddingLeft} x2={chartData.w - chartData.paddingRight} y1={line.y} y2={line.y} stroke="var(--border-main)" strokeDasharray="4" />
                    <text x={chartData.paddingLeft - 10} y={line.y + 4} fill="var(--text-tertiary)" fontSize="14" fontWeight="600" textAnchor="end">{line.label} kg</text>
                  </g>
                ))}
                {/* X Axis Labels */}
                {chartData.xLabels.map((lbl, i) => (
                  <text key={`x-${i}`} x={lbl.x} y={chartData.h - 15} fill="var(--text-tertiary)" fontSize="14" fontWeight="600" textAnchor="middle">{lbl.label}</text>
                ))}
              </g>

              {/* Paths */}
              <path d={chartData.areaD} fill="url(#gradient)" />
              <path d={chartData.lineD} fill="none" stroke="var(--primary)" strokeWidth="3" />
              
              {/* Points */}
              <g id="points">
                {chartData.points.map((p, i) => (
                  <circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredPoint?.i === i ? "8" : "5"} 
                    fill="var(--primary)" 
                    stroke={hoveredPoint?.i === i ? "#ffffff" : "var(--bg-card)"} 
                    strokeWidth={hoveredPoint?.i === i ? "3" : "2"}
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(236,91,19,0.8))",
                      transition: "all 0.2s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={() => setHoveredPoint({ ...p, i })}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            </svg>

            {/* Tooltip */}
            <div 
              className={styles.chartTooltip}
              style={{
                position: 'absolute',
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: '0.5rem',
                border: '1px solid rgba(236,91,19,0.3)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                opacity: hoveredPoint ? 1 : 0,
                transition: 'opacity 0.2s',
                zIndex: 100,
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                // Base left on SVG viewbox ratio approximation (simplification for React inline positioning)
                left: hoveredPoint ? `calc(${(hoveredPoint.x / 800) * 100}% - 40px)` : '0',
                top: hoveredPoint ? `calc(${(hoveredPoint.y / 320) * 100}% - 60px)` : '0',
                transform: 'translate(-50%, -100%)'
              }}
            >
              {hoveredPoint && (
                <>
                  <strong style={{color: 'var(--text-tertiary)', fontSize: '0.75rem', textTransform: 'uppercase'}}>{hoveredPoint.date}</strong><br/>
                  <span style={{fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)'}}>{hoveredPoint.weight} kg</span>
                </>
              )}
            </div>
            </div>
          </section>
        )}

      </div>
    </>
  )
}
