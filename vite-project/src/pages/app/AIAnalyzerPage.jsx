import{useState,useRef,useEffect,useCallback}from'react'
import AppHeader from'../../components/layout/AppHeader'
import{useApp}from'../../context/AppContext'
import{EXERCISES,getAngle,classifyForm,buildMistakes,selectExerciseKey,requestAICoaching}from'./aiAnalyzerLogic'
import{EXERCISE_DB}from'../../data/exerciseDB'
import styles from'./AIAnalyzerPage.module.css'

const EXERCISE_LIST=EXERCISE_DB.map(ex=>({key:ex.cat,label:ex.name}))

export default function AIAnalyzerPage(){
  const{appData}=useApp()
  const videoRef=useRef(null)
  const canvasRef=useRef(null)
  const poseRef=useRef(null)
  const stateRef=useRef({correct:0,wrong:0,total:0,reps:0,repStage:0,lastAngle:0,mistakeFrames:{},hasVideo:false,isAnalyzing:false,isRecording:false})
  const mediaRecRef=useRef(null)
  const recChunksRef=useRef([])
  const recTimerRef=useRef(null)

  const[status,setStatus]=useState({cls:'idle',text:'Idle'})
  const[stats,setStats]=useState({correct:0,wrong:0,total:0,reps:0,accuracy:'—'})
  const[liveCue,setLiveCue]=useState(null)
  const[angle,setAngle]=useState(0)
  const[showOverlay,setShowOverlay]=useState(false)
  const[showAngle,setShowAngle]=useState(false)
  const[showPlaceholder,setShowPlaceholder]=useState(true)
  const[selectedEx,setSelectedEx]=useState(null)
  const[pulseSearch,setPulseSearch]=useState(false)
  const[searchVal,setSearchVal]=useState('')
  const[suggestions,setSuggestions]=useState([])
  const[analyzeEnabled,setAnalyzeEnabled]=useState(false)
  const[recLabel,setRecLabel]=useState('Record (6s)')
  const[isRecording,setIsRecording]=useState(false)
  const[aiState,setAiState]=useState('idle')
  const[aiText,setAiText]=useState('')
  const[summary,setSummary]=useState(null)
  const[history,setHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem('cs_ana_history')||'[]')}catch{return[]}})
  const[toastMsg,setToastMsg]=useState('')
  const[showToast,setShowToast]=useState(false)
  const lastSessionRef=useRef(null)

  const toast=useCallback((msg)=>{setToastMsg(msg.length>100?msg.slice(0,97)+'…':msg);setShowToast(true);setTimeout(()=>setShowToast(false),8000)},[])

  const updateStats=useCallback(()=>{
    const S=stateRef.current
    let accNum=S.total?((S.correct/S.total)*100):0
    if(accNum>=93) accNum=100
    const acc=S.total?accNum.toFixed(0)+'%':'—'
    setStats({correct:S.correct,wrong:S.wrong,total:S.total,reps:S.reps,accuracy:acc})
  },[])

  const resetStats=useCallback(()=>{
    const S=stateRef.current
    S.correct=0;S.wrong=0;S.total=0;S.reps=0;S.repStage=0;S.lastAngle=0;S.mistakeFrames={}
    updateStats()
  },[updateStats])

  const initPose=useCallback(()=>{
    if(poseRef.current||typeof window.Pose==='undefined')return
    const pose=new window.Pose({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`})
    pose.setOptions({modelComplexity:1,smoothLandmarks:true,enableSegmentation:false,minDetectionConfidence:0.5,minTrackingConfidence:0.5})
    pose.onResults((results)=>{
      if(!results.poseLandmarks||!selectedEx)return
      const lm=results.poseLandmarks
      const cfg=EXERCISES[selectedEx.key]
      if(!cfg)return
      let a=cfg.joints.a,b=cfg.joints.b,c=cfg.joints.c
      const getVis=(j1,j2,j3)=>(lm[j1]?.visibility||0)+(lm[j2]?.visibility||0)+(lm[j3]?.visibility||0)
      const isRight=a%2===0
      const offset=isRight?-1:1
      if(getVis(a+offset,b+offset,c+offset)>getVis(a,b,c)){a+=offset;b+=offset;c+=offset}
      if(!lm[a]||!lm[b]||!lm[c])return
      const ang=getAngle(lm[a],lm[b],lm[c])
      // Compute body alignment angle (shoulder→hip→ankle) if configured
      let bodyAngle=null
      if(cfg.bodyAlign){
        const ba=cfg.bodyAlign
        const ba1=lm[ba.a],ba2=lm[ba.b],ba3=lm[ba.c]
        if(ba1&&ba2&&ba3)bodyAngle=getAngle(ba1,ba2,ba3)
      }
      const S=stateRef.current
      S.lastAngle=ang;S.total++
      const cv=canvasRef.current
      const vid=videoRef.current
      if(cv&&vid){
        cv.width=vid.videoWidth||640;cv.height=vid.videoHeight||360
        const ctx=cv.getContext('2d')
        ctx.clearRect(0,0,cv.width,cv.height)
        ctx.drawImage(results.image,0,0,cv.width,cv.height)
        if(window.drawConnectors&&window.POSE_CONNECTIONS){
          window.drawConnectors(ctx,lm,window.POSE_CONNECTIONS,{color:'rgba(236,91,19,0.75)',lineWidth:2})
          window.drawLandmarks(ctx,lm,{color:'#ff8c42',fillColor:'rgba(236,91,19,0.45)',lineWidth:1,radius:4})
        }
        const jx=lm[b].x*cv.width,jy=lm[b].y*cv.height
        const isGood=(cfg.topThresh&&ang>=cfg.topThresh)||(ang>=cfg.idealMin&&ang<=cfg.idealMax)
        const bodyOk=!cfg.bodyAlign||bodyAngle===null||(bodyAngle>=cfg.bodyAlign.idealMin&&bodyAngle<=cfg.bodyAlign.idealMax)
        ctx.beginPath();ctx.arc(jx,jy,26,0,(ang/180)*Math.PI)
        ctx.strokeStyle=(isGood&&bodyOk)?'rgba(34,197,94,0.9)':'rgba(239,68,68,0.9)';ctx.lineWidth=3;ctx.stroke()
        ctx.fillStyle='rgba(255,255,255,0.95)';ctx.font='bold 11px "Public Sans",sans-serif'
        ctx.fillText(Math.round(ang)+'°',jx+31,jy+4)
      }
      const cue=classifyForm(ang,cfg,S,bodyAngle)
      cfg.mistakes?.forEach(m=>{if(m.check(ang,bodyAngle))S.mistakeFrames[m.id]=(S.mistakeFrames[m.id]||0)+1})
      setAngle(ang);setLiveCue(cue);updateStats()
    })
    poseRef.current=pose
  },[selectedEx,updateStats])

  useEffect(()=>{if(selectedEx)initPose()},[selectedEx,initPose])

  const handleSearch=(val)=>{
    setSearchVal(val)
    if(!val.trim()){setSuggestions([]);return}
    const v=val.toLowerCase()
    setSuggestions(EXERCISE_LIST.filter(e=>e.label.toLowerCase().includes(v)).slice(0,8))
  }

  const handleSelectEx=(ex)=>{
    setSelectedEx({key:ex.key,label:ex.label});setSearchVal('');setSuggestions([])
    resetStats();setStatus({cls:'ready',text:`${ex.label} Selected`})
  }

  const triggerSearchAttention=()=>{
    setPulseSearch(true)
    setTimeout(()=>setPulseSearch(false),1500)
    toast('Please select an exercise first!')
  }

  const handleUpload=(e)=>{
    if(!selectedEx){ e.preventDefault(); return triggerSearchAttention() }
    const f=e.target.files[0];if(!f)return
    const vid=videoRef.current;vid.srcObject=null;vid.src=URL.createObjectURL(f);vid.controls=true
    setShowPlaceholder(false);setStatus({cls:'ready',text:'Video Ready'});setAnalyzeEnabled(true)
    stateRef.current.hasVideo=true
  }

  const handleRecord=async()=>{
    if(!selectedEx) return triggerSearchAttention()
    if(isRecording){clearInterval(recTimerRef.current);if(mediaRecRef.current?.state!=='inactive')mediaRecRef.current.stop();return}
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:false})
      const vid=videoRef.current;vid.srcObject=stream;vid.controls=false;vid.play()
      setShowPlaceholder(false);setIsRecording(true);setStatus({cls:'recording',text:'Recording…'})
      recChunksRef.current=[]
      let secs=6;setRecLabel(`Stop (${secs}s)`)
      recTimerRef.current=setInterval(()=>{secs--;if(secs>0)setRecLabel(`Stop (${secs}s)`);else{clearInterval(recTimerRef.current);if(mediaRecRef.current?.state!=='inactive')mediaRecRef.current.stop()}},1000)
      const mr=new MediaRecorder(stream)
      mr.ondataavailable=e=>{if(e.data.size>0)recChunksRef.current.push(e.data)}
      mr.onstop=()=>{
        stream.getTracks().forEach(t=>t.stop())
        const blob=new Blob(recChunksRef.current,{type:'video/webm'})
        vid.srcObject=null;vid.src=URL.createObjectURL(blob);vid.controls=true
        stateRef.current.hasVideo=true;setIsRecording(false);setRecLabel('Record (6s)')
        setStatus({cls:'ready',text:'Recording saved'});setAnalyzeEnabled(true)
      }
      mr.start();mediaRecRef.current=mr
    }catch{setStatus({cls:'idle',text:'Camera denied'})}
  }

  const handleAnalyze=async()=>{
    if(!stateRef.current.hasVideo||!selectedEx)return
    if(!selectedEx){toast('Please select an exercise first!');return}
    if(!poseRef.current)initPose()
    resetStats();setShowOverlay(true);setShowAngle(true);setAiState('idle');setSummary(null)
    setStatus({cls:'analyzing',text:'Analyzing…'});setLiveCue({cls:'',icon:'smart_toy',msg:'Detecting pose…'})
    setAnalyzeEnabled(false);stateRef.current.isAnalyzing=true
    const vid=videoRef.current;vid.currentTime=0;vid.play()
    const loop=async()=>{
      if(vid.paused||vid.ended){onAnalysisComplete();return}
      if(poseRef.current)await poseRef.current.send({image:vid})
      requestAnimationFrame(loop)
    }
    vid.onplaying=()=>requestAnimationFrame(loop)
  }

  const onAnalysisComplete=useCallback(()=>{
    const S=stateRef.current;S.isAnalyzing=false;setAnalyzeEnabled(true)
    setStatus({cls:'done',text:'Analysis Complete ✔'});updateStats()
    if(!selectedEx)return
    const cfg=EXERCISES[selectedEx.key];if(!cfg)return
    const accRaw=S.total?((S.correct/S.total)*100):0
    const acc=accRaw>=93?'100.0':accRaw.toFixed(1)
    const mistakes=buildMistakes(cfg,S)
    setSummary({label:selectedEx.label,reps:S.reps,correct:S.correct,wrong:S.wrong,accuracy:acc,mistakes,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})})
    const entry={exercise:selectedEx.key,label:selectedEx.label,reps:S.reps,correct:S.correct,wrong:S.wrong,total:S.total,accuracy:acc,mistakes,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
    lastSessionRef.current=entry
    setHistory(prev=>{const n=[entry,...prev].slice(0,12);localStorage.setItem('cs_ana_history',JSON.stringify(n));return n})
    setAiState('loading')
    requestAICoaching(entry).then(reply=>{
      setAiState('done');setAiText(reply)
      setTimeout(()=>toast(reply.split('\n')[0]||'Analysis complete!'),6000)
    }).catch((err)=>{
      setAiState('done');
      if(err.message==='Invalid API Key') setAiText('AI feedback unavailable. Your Groq API Key is invalid or expired. Please update it in the code.')
      else setAiText('AI feedback unavailable. Check your connection.')
    })
  },[selectedEx,updateStats,toast])

  const handleReset=()=>{
    const vid=videoRef.current;vid.pause();vid.src='';vid.srcObject=null;vid.controls=false
    const cv=canvasRef.current;if(cv){cv.width=0;cv.height=0}
    resetStats();stateRef.current.hasVideo=false;stateRef.current.isAnalyzing=false
    setShowPlaceholder(true);setShowOverlay(false);setShowAngle(false);setLiveCue(null)
    setAiState('idle');setAiText('');setSummary(null);setStatus({cls:'idle',text:'Idle'});setAnalyzeEnabled(false)
  }

  const handleClearHistory=()=>{setHistory([]);localStorage.removeItem('cs_ana_history')}
  const handleRedo=()=>{if(lastSessionRef.current){setAiState('loading');requestAICoaching(lastSessionRef.current).then(r=>{setAiState('done');setAiText(r)}).catch(()=>{setAiState('done');setAiText('AI unavailable.')})}}
  const anglePct=Math.min(100,(angle/180)*100)
  const accNum=summary?parseFloat(summary.accuracy):0

  return(<>
    <AppHeader icon="smart_toy" title="Form Analyzer"/>
    <div className={styles.contentInner}>
      <div className={styles.banner}>
        <div className={styles.bannerText}>
          <div className={styles.bannerTag}><span className="material-symbols-outlined">psychology</span>AI Pose Tracking</div>
          <h1 className={styles.bannerTitle}>Analyze Your Form</h1>
          <p className={styles.bannerSub}>Upload or record a video — get real-time pose tracking, rep counting, and AI coaching feedback.</p>
        </div>
        <div className={styles.bannerBadges}>
          <div className={styles.badgeChip}><span className="material-symbols-outlined">videocam</span>Live Detection</div>
          <div className={styles.badgeChip}><span className="material-symbols-outlined">analytics</span>Rep Counter</div>
          <div className={styles.badgeChip}><span className="material-symbols-outlined">emoji_events</span>AI Coaching</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.videoPanel}>
          <div className={styles.vpHeader}>
            <div className={styles.vpHeaderLeft}>
              <span className={styles.panelTitle}><span className="material-symbols-outlined">videocam</span>Video Feed</span>
              <div className={styles.vpStatus}><span className={`${styles.statusDot} ${styles[status.cls]}`}/><span>{status.text}</span></div>
            </div>
            <div className={styles.vpSearchWrap}>
              <div className={`${styles.vpSearchBox} ${pulseSearch?styles.pulseAnimation:''}`}>
                <span className="material-symbols-outlined">search</span>
                <input type="text" className={styles.vpSearchInput} placeholder="Select from 150+ exercises…" value={searchVal}
                  onChange={e=>handleSearch(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&suggestions.length)handleSelectEx(suggestions[0]);if(e.key==='Escape')setSuggestions([])}}
                  onFocus={()=>{if(!searchVal)setSuggestions(EXERCISE_LIST.slice(0,10))}}/>
                {suggestions.length>0&&<div className={styles.vpSuggestions}>{suggestions.map((s,i)=>(
                  <div key={i} className={styles.suggItem} onClick={()=>handleSelectEx(s)}>{s.label}</div>
                ))}</div>}
              </div>
              {selectedEx&&<span className={styles.selectedTag}>{selectedEx.label}</span>}
            </div>
          </div>
          <div className={styles.videoWrap}>
            <video ref={videoRef} playsInline muted className={styles.video}/>
            <canvas ref={canvasRef} className={styles.poseCanvas}/>
            {showPlaceholder&&<div className={styles.placeholder}><span className="material-symbols-outlined">add_a_photo</span><p>No Video Loaded</p><p className={styles.phSub}>Upload a clip or record with your webcam</p></div>}
            {showOverlay&&<div className={styles.overlay}>
              {liveCue&&<div className={`${styles.liveBadge} ${styles[liveCue.cls]||''}`}><span className="material-symbols-outlined">{liveCue.icon}</span><span>{liveCue.msg}</span></div>}
              <div className={styles.repPill}><span className={styles.repNum}>{stats.reps}</span><span className={styles.repLbl}>Reps</span></div>
            </div>}
          </div>
          <div className={styles.controls}>
            <label className={`${styles.ctrlBtn} ${styles.uploadBtn}`}><span className="material-symbols-outlined">upload_file</span>Upload Video<input type="file" accept="video/*" style={{display:'none'}} onClick={e=>{if(!selectedEx){e.preventDefault();triggerSearchAttention()}}} onChange={handleUpload}/></label>
            <button className={`${styles.ctrlBtn} ${styles.recordBtn} ${isRecording?styles.recording:''}`} onClick={handleRecord}><span className="material-symbols-outlined">{isRecording?'stop':'videocam'}</span><span>{recLabel}</span></button>
            <button className={`${styles.ctrlBtn} ${styles.analyzeBtn}`} disabled={!analyzeEnabled||!selectedEx} onClick={handleAnalyze}><span className="material-symbols-outlined">play_circle</span>Analyze</button>
            <button className={`${styles.ctrlBtn} ${styles.resetBtn}`} onClick={handleReset}><span className="material-symbols-outlined">replay</span></button>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.statRow}>
            <div className={`${styles.statChip} ${styles.green}`}><span className="material-symbols-outlined">check_circle</span><div><p className={styles.scLabel}>Correct</p><p className={styles.scVal}>{stats.correct}</p></div></div>
            <div className={`${styles.statChip} ${styles.red}`}><span className="material-symbols-outlined">cancel</span><div><p className={styles.scLabel}>Wrong</p><p className={styles.scVal}>{stats.wrong}</p></div></div>
            <div className={`${styles.statChip} ${styles.orange}`}><span className="material-symbols-outlined">percent</span><div><p className={styles.scLabel}>Accuracy</p><p className={styles.scVal}>{stats.accuracy}</p></div></div>
            <div className={`${styles.statChip} ${styles.blue}`}><span className="material-symbols-outlined">frame_inspect</span><div><p className={styles.scLabel}>Frames</p><p className={styles.scVal}>{stats.total}</p></div></div>
          </div>

          <div className={styles.rtCard}>
            <div className={styles.rtHeader}><span className="material-symbols-outlined">tips_and_updates</span><h3>Real-time Feedback</h3></div>
            <div className={styles.rtBody}>{liveCue?<div className={`${styles.rtLive} ${styles[liveCue.cls]||''}`}><span className="material-symbols-outlined">{liveCue.icon}</span>{liveCue.msg}</div>
              :<div className={styles.rtIdle}><span className="material-symbols-outlined">sports_gymnastics</span><p>Start an analysis to see live form cues</p></div>}</div>
            {showAngle&&<div className={styles.angleBlock}><div className={styles.angleTop}><span>Joint Angle</span><span className={styles.angleBadge}>{Math.round(angle)}°</span></div>
              <div className={styles.angleTrack}><div className={styles.angleFill} style={{width:`${anglePct}%`}}/><div className={styles.angleIdeal}/></div>
              <div className={styles.angleScale}><span>0°</span><span>90°</span><span>180°</span></div></div>}
          </div>

          <div className={styles.aiCard}>
            <div className={styles.aiCardHeader}><div className={styles.aiAvatar}><span className="material-symbols-outlined">psychology</span></div><div><h3>AI Coach</h3><p className={styles.aiCardSub}>Post-session coaching feedback</p></div></div>
            {aiState==='idle'&&<div className={styles.aiIdle}><span className="material-symbols-outlined">hourglass_empty</span><p>Complete your analysis to unlock AI coaching</p></div>}
            {aiState==='loading'&&<div className={styles.aiLoading}><div className={styles.aiDots}><div/><div/><div/></div><p>Generating insights…</p></div>}
            {aiState==='done'&&<div className={styles.aiResult}><div className={styles.aiResultText} dangerouslySetInnerHTML={{__html:aiText.split('\n').filter(l=>l.trim()).map((l,i)=>i===0?`<strong>${l}</strong>`:`<span>${l}</span>`).join('')}}/><button className={styles.aiRedoBtn} onClick={handleRedo}><span className="material-symbols-outlined">refresh</span>Regenerate</button></div>}
          </div>
        </div>
      </div>

      {summary&&<div className={styles.summarySection}>
        <div className={styles.summaryHeader}><div className={styles.summaryTitleBlock}><span className="material-symbols-outlined">assignment_turned_in</span><h3>Session Summary</h3></div>
          <div className={styles.summaryMeta}><span className={styles.sumExTag}>{summary.label}</span><span className={styles.sumTime}>{summary.time}</span></div></div>
        <div className={styles.summaryGrid}>
          <div className={styles.sumStat}><p className={styles.sumStatLabel}>Total Reps</p><p className={styles.sumStatVal}>{summary.reps}</p></div>
          <div className={styles.sumStat}><p className={styles.sumStatLabel}>Correct Frames</p><p className={`${styles.sumStatVal} ${styles.green}`}>{summary.correct}</p></div>
          <div className={styles.sumStat}><p className={styles.sumStatLabel}>Wrong Frames</p><p className={`${styles.sumStatVal} ${styles.red}`}>{summary.wrong}</p></div>
          <div className={styles.sumStat}><p className={styles.sumStatLabel}>Accuracy</p><p className={`${styles.sumStatVal} ${styles.orange}`}>{summary.accuracy}%</p></div>
        </div>
        <div className={styles.sumAccWrap}><div className={styles.sumAccTrack}><div className={styles.sumAccFill} style={{width:`${accNum}%`}}/></div><span className={styles.sumAccPct} style={{color:accNum>=70?'var(--green)':accNum>=40?'var(--primary)':'#ef4444'}}>{accNum}%</span></div>
        {summary.mistakes.length>0&&accNum<95&&<div className={styles.mistakesBlock}><div className={styles.mistakesHeader}><span className="material-symbols-outlined">{accNum>=90?'tips_and_updates':'error_outline'}</span><h4>{accNum>=90?'Form Suggestions':'Detected Issues'}</h4></div>
          <ul className={styles.mistakesList}>{summary.mistakes.map((m,i)=><li key={i}>{m}</li>)}</ul></div>}
      </div>}

      {history.length>0&&<div className={styles.historyCard}>
        <div className={styles.historyTop}><h3><span className="material-symbols-outlined">history</span>Past Sessions</h3><button className={styles.historyClear} onClick={handleClearHistory}><span className="material-symbols-outlined">delete_sweep</span>Clear</button></div>
        <div className={styles.historyList}>{history.map((h,i)=>(
          <div key={i} className={styles.hItem}><div className={styles.hItemTop}><span className={styles.hExBadge}>{h.label}</span><span className={styles.hTime}>{h.time}</span></div>
            <div className={styles.hStats}><div className={styles.hStat}><span className={styles.hStatL}>Reps</span><span className={styles.hStatV}>{h.reps}</span></div>
              <div className={styles.hStat}><span className={styles.hStatL}>Correct</span><span className={styles.hStatV} style={{color:'var(--green)'}}>{h.correct}</span></div>
              <div className={styles.hStat}><span className={styles.hStatL}>Wrong</span><span className={styles.hStatV} style={{color:'#ef4444'}}>{h.wrong}</span></div>
              <div className={styles.hStat}><span className={styles.hStatL}>Acc</span><span className={styles.hStatV}>{h.accuracy}%</span></div></div>
            <div className={styles.hAccBar}><div className={styles.hAccFill} style={{width:`${h.accuracy}%`}}/></div></div>))}</div>
      </div>}
    </div>

    {showToast&&<div className={styles.toast}><div className={styles.toastIcon}><span className="material-symbols-outlined">chat_bubble</span></div>
      <div className={styles.toastBody}><div className={styles.toastTitle}>AI Coach Info</div><div className={styles.toastMsgText}>{toastMsg}</div></div>
      <button className={styles.toastClose} onClick={()=>setShowToast(false)}><span className="material-symbols-outlined">close</span></button></div>}
  </>)
}
