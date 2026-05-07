const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'

// MediaPipe Pose Landmarks:
// 11/12=shoulders, 13/14=elbows, 15/16=wrists, 23/24=hips, 25/26=knees, 27/28=ankles

export const EXERCISES={
  pushup:{label:'Push Up',
    joints:{a:12,b:14,c:16}, // elbow angle (depth)
    idealMin:60,idealMax:115,topThresh:145,downThresh:130,
    bodyAlign:{a:12,b:24,c:28,idealMin:155,idealMax:185}, // shoulder→hip→ankle (body line)
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Perfect form!'},
      tooHigh:{cls:'error',icon:'arrow_downward',msg:'↓ Go lower — full ROM'},
      shallow:{cls:'warning',icon:'warning',msg:'⚠️ Arms not fully extended'},
      adjust:{cls:'warning',icon:'adjust',msg:'⚙️ Adjust body line'},
      hipsHigh:{cls:'error',icon:'warning',msg:'⚠️ Hips too high — straighten body!'},
      hipsSag:{cls:'error',icon:'warning',msg:'⚠️ Hips sagging — engage core!'}},
    mistakes:[
      {id:'depth',label:'Not going deep enough — chest should nearly touch ground',check:a=>a>120,threshold:0.3},
      {id:'lock',label:'Not fully locking out arms at the top',check:a=>a<145,threshold:0.2},
      {id:'hips_high',label:'Hips piked up (mountain pose) — body should be straight like a plank',check:(a,ba)=>ba!==null&&ba<150,threshold:0.2},
      {id:'hips_sag',label:'Hips sagging down (banana back) — tighten core and glutes',check:(a,ba)=>ba!==null&&ba>190,threshold:0.2}]},

  pullup:{label:'Pull Up',
    joints:{a:16,b:14,c:12}, // elbow angle (pull height)
    idealMin:40,idealMax:95,topThresh:140,downThresh:110,
    bodyAlign:{a:12,b:24,c:28,idealMin:160,idealMax:195}, // shoulder→hip→ankle (body swing)
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Chin over bar — great!'},
      tooHigh:{cls:'warning',icon:'arrow_upward',msg:'↑ Pull higher — chin over bar'},
      shallow:{cls:'error',icon:'arrow_downward',msg:'↓ Full dead hang at bottom'},
      adjust:{cls:'warning',icon:'adjust',msg:'⚙️ Engage lats'},
      hipsHigh:{cls:'warning',icon:'warning',msg:'⚠️ Too much kipping — control swing'},
      hipsSag:{cls:'warning',icon:'warning',msg:'⚠️ Body swinging — stay tight'}},
    mistakes:[
      {id:'height',label:'Not pulling high enough — chin should clear the bar',check:a=>a>100,threshold:0.3},
      {id:'descent',label:'Dropping too fast — control the eccentric (3 seconds down)',check:a=>a>150,threshold:0.25},
      {id:'kipping',label:'Body swinging/kipping — keep core tight and legs still',check:(a,ba)=>ba!==null&&(ba<155||ba>200),threshold:0.2}]},

  squat:{label:'Squat',
    joints:{a:24,b:26,c:28}, // knee angle (depth)
    idealMin:60,idealMax:115,topThresh:150,downThresh:130,
    bodyAlign:{a:12,b:24,c:26,idealMin:40,idealMax:90}, // shoulder→hip→knee (torso angle)
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Excellent depth!'},
      tooHigh:{cls:'error',icon:'arrow_downward',msg:'↓ Squat deeper — below parallel'},
      shallow:{cls:'warning',icon:'adjust',msg:'⚙️ Control the descent'},
      adjust:{cls:'warning',icon:'warning',msg:'⚠️ Keep knees tracking over toes'},
      hipsHigh:{cls:'warning',icon:'warning',msg:'⚠️ Leaning too far forward — chest up!'},
      hipsSag:{cls:'warning',icon:'warning',msg:'⚠️ Torso too upright — slight lean is OK'}},
    mistakes:[
      {id:'depth',label:'Not reaching parallel — hips should drop below knees',check:a=>a>120,threshold:0.3},
      {id:'heels',label:'Heels rising off ground — shift weight back',check:a=>a>155,threshold:0.2},
      {id:'lean',label:'Excessive forward lean — keep chest up and proud',check:(a,ba)=>ba!==null&&ba<35,threshold:0.2}]},

  dip:{label:'Dip',
    joints:{a:12,b:14,c:16}, // elbow angle (depth)
    idealMin:70,idealMax:110,topThresh:145,downThresh:130,
    bodyAlign:{a:12,b:24,c:28,idealMin:160,idealMax:190}, // shoulder→hip→ankle (torso lean)
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Perfect dip depth!'},
      tooHigh:{cls:'error',icon:'arrow_downward',msg:'↓ Dip deeper — arms parallel'},
      shallow:{cls:'warning',icon:'adjust',msg:'⚙️ Control tempo — no bouncing'},
      adjust:{cls:'warning',icon:'warning',msg:'⚠️ Keep torso upright'},
      hipsHigh:{cls:'warning',icon:'warning',msg:'⚠️ Too much forward lean!'},
      hipsSag:{cls:'warning',icon:'warning',msg:'⚠️ Stay upright — don\'t arch back'}},
    mistakes:[
      {id:'depth',label:'Not dipping low enough — upper arms should be parallel to ground',check:a=>a>115,threshold:0.3},
      {id:'lock',label:'Not fully locking out at the top — extend arms completely',check:a=>a<145,threshold:0.2},
      {id:'lean',label:'Excessive forward lean — keep torso more upright for tricep focus',check:(a,ba)=>ba!==null&&ba<155,threshold:0.2}]},

  plank:{label:'Plank',
    joints:{a:12,b:24,c:26}, // shoulder→hip→knee (body line)
    idealMin:160,idealMax:180,topThresh:null,downThresh:null,
    bodyAlign:{a:12,b:24,c:28,idealMin:165,idealMax:185}, // shoulder→hip→ankle (full body)
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Perfect plank — hold it!'},
      tooHigh:{cls:'error',icon:'warning',msg:'↓ Hips too high — lower them'},
      shallow:{cls:'error',icon:'warning',msg:'↑ Hips sagging — brace core!'},
      adjust:{cls:'warning',icon:'adjust',msg:'⚙️ Maintain rigid body line'},
      hipsHigh:{cls:'warning',icon:'warning',msg:'⚠️ Pike position — flatten out!'},
      hipsSag:{cls:'error',icon:'warning',msg:'⚠️ Core collapsing — squeeze glutes!'}},
    mistakes:[
      {id:'hips_high',label:'Hips raised too high — body should be a straight line from head to heels',check:a=>a<155,threshold:0.25},
      {id:'sag',label:'Hips sagging — core not engaged, squeeze abs and glutes',check:a=>a>185,threshold:0.2},
      {id:'full_sag',label:'Full body sagging — push floor away, engage everything',check:(a,ba)=>ba!==null&&ba>190,threshold:0.2}]},

  legraise:{label:'Leg Raise',
    joints:{a:12,b:24,c:26}, // shoulder→hip→knee (leg angle)
    idealMin:65,idealMax:110,topThresh:140,downThresh:130,
    bodyAlign:null, // no secondary check needed
    cues:{
      perfect:{cls:'perfect',icon:'check_circle',msg:'✅ Legs at 90° — perfect!'},
      tooHigh:{cls:'warning',icon:'adjust',msg:'⚙️ Control the lowering phase'},
      shallow:{cls:'error',icon:'arrow_upward',msg:'↑ Raise legs higher'},
      adjust:{cls:'warning',icon:'warning',msg:'⚠️ Keep legs straight — no bending'}},
    mistakes:[
      {id:'height',label:'Legs not reaching 90° — raise higher with straight legs',check:a=>a>115,threshold:0.3},
      {id:'swing',label:'Using momentum/swinging — go slow and controlled',check:a=>a>150,threshold:0.2}]},
}

export function getAngle(a,b,c){
  const rad=Math.atan2(c.y-b.y,c.x-b.x)-Math.atan2(a.y-b.y,a.x-b.x)
  let deg=Math.abs((rad*180)/Math.PI)
  if(deg>180)deg=360-deg
  return deg
}

export function classifyForm(angle,cfg,S,bodyAngle){
  const{idealMin,idealMax,topThresh,downThresh,cues}=cfg
  if(!cues){S.correct++;return{cls:'perfect',icon:'visibility',msg:'Tracking…'}}

  // Check body alignment first — if body position is wrong, flag it (but not too strict)
  if(bodyAngle!==null&&cfg.bodyAlign){
    if(bodyAngle<cfg.bodyAlign.idealMin&&cues.hipsHigh){S.wrong++;return cues.hipsHigh}
    if(bodyAngle>cfg.bodyAlign.idealMax&&cues.hipsSag){S.wrong++;return cues.hipsSag}
  }

  let cue=cues.adjust,isCorrect=false
  if(topThresh&&angle>=topThresh){isCorrect=true;cue={cls:'perfect',icon:'check_circle',msg:'Form ready'}}
  else if(angle>=idealMin&&angle<=idealMax){isCorrect=true;cue=cues.perfect}
  else if(topThresh&&angle<idealMin){isCorrect=true;cue=cues.perfect}
  else if(angle>idealMax&&angle<(topThresh||180)){isCorrect=true;cue={cls:'',icon:'sync',msg:'Moving…'}}
  if(isCorrect)S.correct++;else S.wrong++

  if(!topThresh){if(isCorrect)cue=cues.perfect}
  else{
    switch(S.repStage){
      case 0:if(angle<downThresh)S.repStage=1;break
      case 1:if(angle<=idealMax)S.repStage=2;if(angle>topThresh)S.repStage=0;break
      case 2:if(angle>idealMax+15)S.repStage=3;break
      case 3:if(angle>=topThresh){S.reps++;S.repStage=0;cue={cls:'perfect',icon:'plus_one',msg:'Rep counted!'}}
        if(angle<idealMax)S.repStage=2;break
    }
  }
  return cue
}

export function buildMistakes(cfg,S){
  if(!cfg.mistakes)return[]
  return cfg.mistakes.filter(m=>{
    const frames=S.mistakeFrames[m.id]||0
    return S.total>0&&(frames/S.total)>=m.threshold
  }).map(m=>m.label)
}

export function selectExerciseKey(name){
  return name.toLowerCase().replace(/[\s-]/g,'')
}

export async function requestAICoaching(session){
  let userName='Athlete'
  try{const d=JSON.parse(localStorage.getItem('caliStrengthData'))||{};const p=d.profile||{};if(p.name)userName=p.name.split(' ')[0]}catch{}

  const mistakeTxt=session.mistakes.length
    ?session.mistakes.map((m,i)=>`${i+1}. ${m}`).join('\n')
    :'No form issues detected — excellent technique!'

  const prompt=`You are a knowledgeable, supportive calisthenics coach giving POST-SESSION feedback.

USER: ${userName}
EXERCISE: ${session.label}
REPS COMPLETED: ${session.reps}
FORM ACCURACY: ${session.accuracy}%
DETECTED FORM ISSUES:
${mistakeTxt}

INSTRUCTIONS:
Write a short 3-4 sentence coaching note. No markdown, no bullet points.
1. Address ${userName} by name. Mention the exercise.
2. If issues were detected, explain SPECIFICALLY what body parts need correction (e.g. "your hips were rising during the movement" or "your arms weren't fully extending at the top"). Be specific about the body part and what was wrong.
3. If no issues, praise their form with specific detail (e.g. "your body line stayed perfectly straight" or "great depth on every rep").
4. Give ONE actionable tip to improve next session.
5. End with a short motivational line.
Keep it personal, specific, and encouraging. Never be generic.`

  const res=await fetch('https://api.groq.com/openai/v1/chat/completions',{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${GROQ_KEY}`},
    body:JSON.stringify({model:GROQ_MODEL,max_tokens:400,temperature:0.7,
      messages:[{role:'system',content:'You are an expert calisthenics and bodyweight fitness coach. You analyze form data from AI pose tracking. Give specific, body-part-focused feedback. Be encouraging but honest about form issues. Always mention which body part needs work.'},{role:'user',content:prompt}]})
  })
  const data=await res.json()
  if(data.error){
    if(data.error.code==='invalid_api_key') throw new Error('Invalid API Key')
    throw new Error(data.error.message)
  }
  return data.choices?.[0]?.message?.content?.trim()||'Great effort! Keep pushing.'
}
