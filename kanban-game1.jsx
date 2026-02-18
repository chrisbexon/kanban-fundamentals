import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ReferenceLine } from "recharts";

/* ═══════════════════════════════════════════════════════════════════
   KANBAN TRAINING — LESSON 1: THE PENNY GAME (Polished)
   ═══════════════════════════════════════════════════════════════════ */

const TOTAL_ITEMS = 20;
const WORK_STATES = ["mint", "press", "polish", "inspect"];
const STATE_AFTER = { mint: "press", press: "polish", polish: "inspect", inspect: "done" };
const STAGES = [
  { id: "backlog", label: "Backlog", icon: "📥", color: "#64748b", type: "buffer" },
  { id: "mint", label: "Mint", icon: "🔨", color: "#f59e0b", type: "work" },
  { id: "press", label: "Press", icon: "⚙️", color: "#3b82f6", type: "work" },
  { id: "polish", label: "Polish", icon: "✨", color: "#10b981", type: "work" },
  { id: "inspect", label: "Inspect", icon: "🔍", color: "#8b5cf6", type: "work" },
  { id: "done", label: "Done", icon: "✅", color: "#22c55e", type: "buffer" },
];
const BATCH_COLORS = { 1: "#22c55e", 2: "#10b981", 3: "#14b8a6", 4: "#06b6d4", 5: "#3b82f6", 10: "#8b5cf6", 15: "#a855f7", 20: "#f59e0b" };
const getBatchColor = (bs) => BATCH_COLORS[bs] || "#64748b";

// ─── CSS ANIMATIONS ─────────────────────────────────────────────────

const animStyles = `
@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
@keyframes flipCoin { 0% { transform:rotateY(0) scale(1); } 50% { transform:rotateY(90deg) scale(1.2); } 100% { transform:rotateY(180deg) scale(1); } }
@keyframes slideIn { from { opacity:0; transform:translateX(-12px); } to { opacity:1; transform:translateX(0); } }
@keyframes popIn { from { opacity:0; transform:scale(.8); } to { opacity:1; transform:scale(1); } }
@keyframes shimmer { 0% { background-position:-200% 0; } 100% { background-position:200% 0; } }
@keyframes glow { 0%,100% { box-shadow:0 0 8px rgba(34,197,94,.15); } 50% { box-shadow:0 0 20px rgba(34,197,94,.3); } }
.fade-up { animation: fadeUp .5s ease both; }
.fade-in { animation: fadeIn .4s ease both; }
.pop-in { animation: popIn .3s cubic-bezier(.34,1.56,.64,1) both; }
.slide-in { animation: slideIn .4s ease both; }
`;

// ─── QUIZ ───────────────────────────────────────────────────────────

const QUIZ = [
  { id:1, q:"In the simulation, what happened when you used a batch size of 20?",
    opts:["Items flowed through quickly with minimal waiting","Each coin waited for all 19 others before the batch could move forward","The system automatically optimised itself","All stages processed coins simultaneously"],
    ans:1, exp:"With a batch of 20, every coin — even the first one flipped — had to wait for all others to complete before moving. This creates enormous wait time." },
  { id:2, q:"Why did some stages become bottlenecks?",
    opts:["Because the simulation was broken","Because work always takes the same time","Because each coin takes a random amount of time, creating natural variability","Because there were too many stages"],
    ans:2, exp:"Variability is inherent in real work. Each coin took 1–4 ticks at each stage, so some stages naturally accumulated more work." },
  { id:3, q:"What does 'pull system' mean based on what you observed?",
    opts:["Workers pull coins out of a hat","Each stage pushes work forward as fast as possible","Work moves to the next stage only when that stage has capacity","The backlog pushes all items in at once"],
    ans:2, exp:"In a pull system, work moves forward only when the next stage is ready. This prevents overloading and lets each stage maintain quality." },
  { id:4, q:"Looking at the throughput chart, what pattern did you notice with smaller batch sizes?",
    opts:["Items completed in big jumps at the end","Items completed earlier and more steadily throughout","No items completed at all","The chart was identical regardless of batch size"],
    ans:1, exp:"With smaller batches, items start completing earlier and the throughput line rises gradually. Steady, early throughput is a sign of healthy flow." },
  { id:5, q:"Why do we limit Work in Progress (WIP) in Kanban?",
    opts:["To make workers do less","To reduce lead times, expose bottlenecks, and create smooth pull-based flow","Because there aren't enough workers","WIP limits don't affect flow"],
    ans:1, exp:"Limiting WIP is the core Kanban principle. Smaller batches (lower WIP) = faster lead times, less waiting, natural adaptation to bottlenecks." },
];

// ─── ENGINE ─────────────────────────────────────────────────────────

function rndWork() { const w = {}; for (const s of WORK_STATES) w[s] = Math.floor(Math.random() * 4) + 1; return w; }
function makeItems(n) { return Array.from({ length: n }, (_, i) => ({ id: i+1, state:"backlog", wr: rndWork(), wd:{mint:0,press:0,polish:0,inspect:0}, st:null, dt:null, et:0, working:false, jc:false, jm:false })); }

function simTick(prev, bs, tick) {
  let it = prev.map(x => ({...x, jc:false, jm:false, working:false}));
  for (const s of WORK_STATES) { const c = it.filter(x => x.state===s); const w = c.find(x => x.wd[s]<x.wr[s]); if(w){w.wd[s]++;w.working=true;if(w.wd[s]>=w.wr[s])w.jc=true;} }
  for (const s of [...WORK_STATES].reverse()) { const c = it.filter(x => x.state===s); if(!c.length||!c.every(x => x.wd[s]>=x.wr[s]))continue; const ns=STATE_AFTER[s]; if(ns==="done"){for(const x of c){x.state="done";x.dt=tick;x.jm=true;x.et=tick;}} else if(!it.filter(x=>x.state===ns).length){for(const x of c){x.state=ns;x.jm=true;x.et=tick;}} }
  if(!it.filter(x=>x.state==="mint").length){const bl=it.filter(x=>x.state==="backlog").slice(0,bs);for(const x of bl){x.state="mint";x.st=tick;x.jm=true;x.et=tick;}}
  return it;
}

function getStats(items) {
  const d=items.filter(x=>x.dt!==null); if(!d.length)return null;
  const ct=d.map(x=>x.dt-x.st), ac=ct.reduce((a,b)=>a+b,0)/ct.length;
  const wt=d.map(x=>{const tw=WORK_STATES.reduce((s,st)=>s+x.wr[st],0);return Math.max(0,(x.dt-x.st)-tw);}), aw=wt.reduce((a,b)=>a+b,0)/wt.length;
  const ld={}; for(const s of WORK_STATES) ld[s]=items.reduce((sum,x)=>sum+x.wr[s],0);
  const bn=Object.entries(ld).sort((a,b)=>b[1]-a[1])[0];
  return { done:d.length, first:Math.min(...d.map(x=>x.dt)), all:d.length===TOTAL_ITEMS?Math.max(...d.map(x=>x.dt)):null, ac:ac.toFixed(1), aw:Math.max(0,aw).toFixed(1), bn:bn[0] };
}

function throughputData(snap, ticks) { const d=[]; for(let t=0;t<=ticks;t++) d.push({tick:t,done:snap.filter(x=>x.dt!==null&&x.dt<=t).length}); return d; }
function itemBreakdown(snap) { return snap.filter(x=>x.dt!==null).map(x=>{const tw=WORK_STATES.reduce((s,st)=>s+x.wr[st],0);return{id:x.id,cycleTime:x.dt-x.st,workTime:tw,waitTime:Math.max(0,(x.dt-x.st)-tw)};}).sort((a,b)=>a.id-b.id); }

// ─── SHARED UI ──────────────────────────────────────────────────────

const mono = "'JetBrains Mono',monospace";
const sans = "'Outfit',sans-serif";
const ttStyle = { contentStyle:{background:"#1e293b",border:"1px solid #334155",borderRadius:8,fontSize:11,fontFamily:mono}, labelStyle:{color:"#94a3b8"}, itemStyle:{color:"#e2e8f0"} };

function Shell({ children }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(170deg,#060a14 0%,#0c1425 40%,#10182a 100%)", color:"#e2e8f0", fontFamily:sans }}>
      <style>{animStyles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ maxWidth:1140, margin:"0 auto", padding:"20px 16px" }}>
        {children}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:4 }}>
      <div style={{ width:8, height:40, borderRadius:4, background:"linear-gradient(180deg,#f59e0b,#3b82f6,#10b981,#8b5cf6)", flexShrink:0 }} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:3, color:"#3b4963" }}>Kanban Training · Lesson 1</div>
        <h1 style={{ fontSize:"clamp(20px,4vw,26px)", fontWeight:800, margin:0, background:"linear-gradient(135deg,#f1f5f9,#94a3b8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>The Penny Game: Batch Size & Flow</h1>
      </div>
    </div>
  );
}

function Nav({ step, labels, onNav, canAdv }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, padding:"0 0 14px", marginBottom:18, borderBottom:"1px solid rgba(255,255,255,0.05)", overflowX:"auto" }}>
      {labels.map((l, i) => {
        const act=i===step, dn=i<step, ok=i<=step||(i===step+1&&canAdv);
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex:i<labels.length-1?1:"none", minWidth:"fit-content" }}>
            <button onClick={()=>ok&&onNav(i)} style={{
              display:"flex", alignItems:"center", gap:6, padding:"6px 10px", borderRadius:8,
              border:"none", background:act?"rgba(59,130,246,0.12)":"transparent",
              cursor:ok?"pointer":"default", opacity:ok?1:.35, transition:"all .25s", whiteSpace:"nowrap",
            }}>
              <div style={{
                width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700, fontFamily:mono, flexShrink:0,
                background:dn?"#22c55e":act?"#3b82f6":"#1e293b",
                color:dn||act?"#fff":"#475569",
                border:act?"2px solid #60a5fa":dn?"2px solid #22c55e":"2px solid #334155",
                transition:"all .3s",
              }}>{dn?"✓":i+1}</div>
              <span style={{ fontSize:12, fontWeight:act?700:500, color:act?"#e2e8f0":dn?"#94a3b8":"#475569", transition:"color .2s" }}>{l}</span>
            </button>
            {i<labels.length-1 && <div style={{ flex:1, height:2, margin:"0 2px", minWidth:12, background:dn?"rgba(34,197,94,.3)":"rgba(255,255,255,0.04)", borderRadius:1, transition:"background .4s" }} />}
          </div>
        );
      })}
    </div>
  );
}

function Btn({ onClick, children, primary, disabled, small }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding:small?"7px 14px":primary?"11px 28px":"11px 20px", borderRadius:10,
      border:primary?"none":"2px solid rgba(255,255,255,0.08)",
      background:primary?(disabled?"#334155":"linear-gradient(135deg,#3b82f6,#6366f1)"):"transparent",
      color:primary?"#fff":"#94a3b8", fontWeight:700, fontSize:small?12:14, fontFamily:sans,
      cursor:disabled?"not-allowed":"pointer",
      boxShadow:primary&&!disabled?"0 4px 14px rgba(59,130,246,0.2)":"none",
      opacity:disabled?.5:1, transition:"all .25s",
    }}>{children}</button>
  );
}

function StepHeader({ tag, tagColor, title, desc }) {
  return (
    <div className="fade-up" style={{ marginBottom:16 }}>
      <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:2, color:tagColor, marginBottom:6 }}>{tag}</div>
      <h2 style={{ fontSize:"clamp(18px,3.5vw,24px)", fontWeight:800, margin:"0 0 6px", color:"#e2e8f0", lineHeight:1.3 }}>{title}</h2>
      {desc && <p style={{ fontSize:13, color:"#64748b", margin:0, lineHeight:1.55, maxWidth:700 }}>{desc}</p>}
    </div>
  );
}

function Card({ children, style: s, glow, accent }) {
  return (
    <div style={{
      background: accent ? `rgba(${accent},.04)` : "rgba(255,255,255,0.015)",
      borderRadius:14, padding:"18px 20px",
      border: accent ? `1px solid rgba(${accent},.12)` : "1px solid rgba(255,255,255,0.05)",
      animation: glow ? "glow 2s ease infinite" : "none",
      ...s,
    }}>{children}</div>
  );
}

function Footer() {
  return (
    <div style={{ marginTop:32, padding:"10px 0", borderTop:"1px solid rgba(255,255,255,0.04)", fontSize:10, color:"#1e293b", display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:4 }}>
      <span>Kanban Simulation Training Platform</span>
      <span>Based on the Kanban Guide</span>
    </div>
  );
}

// ─── STEP 1: INTRO ─────────────────────────────────────────────────

function IntroStep({ onNext }) {
  return (
    <div className="fade-up" style={{ maxWidth:740 }}>
      <StepHeader tag="Introduction" tagColor="#3b82f6" title="Why does batch size matter?" />

      <div style={{
        width:"100%", aspectRatio:"16/9", borderRadius:14,
        background:"linear-gradient(135deg,rgba(59,130,246,0.08),rgba(139,92,246,0.05))",
        border:"1px solid rgba(59,130,246,0.15)", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", marginBottom:24, position:"relative", overflow:"hidden", cursor:"pointer",
      }}>
        <div style={{ position:"absolute", inset:0, background:"radial-gradient(circle at 30% 40%,rgba(59,130,246,0.06) 0%,transparent 60%)" }} />
        <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(59,130,246,0.15)", border:"2px solid rgba(59,130,246,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:10, transition:"transform .2s" }}>▶</div>
        <span style={{ fontSize:13, color:"#64748b", fontWeight:600 }}>Video: Introduction to Flow & Batch Size</span>
        <span style={{ fontSize:11, color:"#475569", marginTop:4 }}>3:45</span>
      </div>

      <div style={{ fontSize:14, color:"#94a3b8", lineHeight:1.8, display:"flex", flexDirection:"column", gap:14 }}>
        <p style={{ margin:0 }}>Imagine you're running a coin workshop. Each coin must pass through four stages: <strong style={{ color:"#f59e0b" }}>Mint</strong>, <strong style={{ color:"#3b82f6" }}>Press</strong>, <strong style={{ color:"#10b981" }}>Polish</strong>, and <strong style={{ color:"#8b5cf6" }}>Inspect</strong>. One worker handles each stage, processing coins one at a time.</p>
        <p style={{ margin:0 }}>The traditional approach is <strong style={{ color:"#e2e8f0" }}>large batches</strong>: send all 20 coins to Mint, wait for all 20 to finish, then move them all to Press. It feels efficient — everyone stays busy. But what happens to the first coin? It sits idle waiting for the other 19.</p>
        <p style={{ margin:0 }}>Now add reality: each coin takes a <strong style={{ color:"#e2e8f0" }}>different amount of time</strong> at each stage. With large batches, the whole group moves at the speed of the <em>slowest</em> coin.</p>
        <Card accent="139,92,246">
          <div style={{ fontSize:13, fontWeight:700, color:"#a78bfa", marginBottom:8 }}>💡 Key Concepts You'll Explore</div>
          <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7 }}>
            <strong style={{ color:"#c4b5fd" }}>Batch size</strong> — how many items move together. <strong style={{ color:"#c4b5fd" }}>Lead time</strong> — start to finish for one item. <strong style={{ color:"#c4b5fd" }}>Cycle time</strong> — time in the system. <strong style={{ color:"#c4b5fd" }}>WIP</strong> — items started but not finished. <strong style={{ color:"#c4b5fd" }}>Pull system</strong> — work moves only when ready. <strong style={{ color:"#c4b5fd" }}>Throughput</strong> — items completed per unit of time.
          </div>
        </Card>
      </div>
      <div style={{ marginTop:28, display:"flex", justifyContent:"flex-end" }}><Btn primary onClick={onNext}>Start the Simulation →</Btn></div>
    </div>
  );
}

// ─── STEP 2: GAME ──────────────────────────────────────────────────

function Coin({ item, sc }) {
  const isW=sc.type==="work", isD=sc.id==="done", c=sc.color, sid=sc.id;
  let p=0,comp=false;
  if(isW){p=item.wr[sid]>0?item.wd[sid]/item.wr[sid]:0; comp=item.wd[sid]>=item.wr[sid];}
  let bg,bdr,tc,sh;
  if(isD){bg="linear-gradient(135deg,#fbbf24,#f59e0b)";bdr="2px solid #fbbf24";tc="#1e293b";sh=item.jm?"0 0 16px rgba(251,191,36,0.5)":"0 0 6px rgba(251,191,36,0.2)";}
  else if(isW&&comp){bg=`${c}30`;bdr=`2px solid ${c}77`;tc=c;sh=item.jc?`0 0 14px ${c}55`:"none";}
  else if(isW&&item.working){bg=`linear-gradient(135deg,${c}dd,${c}99)`;bdr=`2px solid ${c}`;tc="#fff";sh=`0 0 12px ${c}44`;}
  else if(isW){bg="#172035";bdr="2px solid #253352";tc="#3e5070";sh="none";}
  else{bg="#121b2e";bdr="2px solid #1a2540";tc="#4b5e7a";sh="none";}

  const anim = item.jc ? "flipCoin .4s cubic-bezier(.34,1.56,.64,1)" : item.jm ? "popIn .3s cubic-bezier(.34,1.56,.64,1)" : "none";

  return (
    <div style={{ width:42, height:42, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, fontFamily:mono, background:bg, border:bdr, color:tc, boxShadow:sh, animation:anim, position:"relative", transition:"background .3s, border .3s, color .3s, box-shadow .3s" }}>
      {item.id}
      {isW&&!comp&&item.wr[sid]>0&&(
        <svg style={{ position:"absolute", top:-2, left:-2, width:46, height:46, transform:"rotate(-90deg)", pointerEvents:"none" }}>
          <circle cx="23" cy="23" r="19" fill="none" stroke={`${c}1a`} strokeWidth="2.5"/>
          <circle cx="23" cy="23" r="19" fill="none" stroke={c} strokeWidth="2.5" strokeDasharray={`${p*119.4} 119.4`} strokeLinecap="round" style={{ transition:"stroke-dasharray .35s ease" }}/>
        </svg>
      )}
      {isW&&!comp&&<div style={{ position:"absolute", bottom:-7, fontSize:7, fontFamily:mono, color:item.working?c:"#2a3a55", fontWeight:700, background:"#0a1020", padding:"0 3px", borderRadius:3, lineHeight:1.3, transition:"color .2s" }}>{item.wd[sid]}/{item.wr[sid]}</div>}
      {isW&&comp&&<div style={{ position:"absolute", top:-3, right:-3, width:12, height:12, borderRadius:"50%", background:"#22c55e", border:"2px solid #0a1020", display:"flex", alignItems:"center", justifyContent:"center", fontSize:6, color:"#fff" }}>✓</div>}
    </div>
  );
}

function Col({ sc, items, wip, all }) {
  const isW=sc.type==="work", sid=sc.id;
  const cc=isW?items.filter(x=>x.wd[sid]>=x.wr[sid]).length:0;
  const af=isW&&items.length>0&&cc===items.length;
  const ns=STATE_AFTER[sid];
  const blocked=af&&ns&&ns!=="done"&&all.filter(x=>x.state===ns).length>0;

  return (
    <div style={{ flex:sid==="backlog"||sid==="done"?"1 1 88px":"1 1 78px", minWidth:68, background:isW?"rgba(255,255,255,0.022)":"rgba(255,255,255,0.01)", borderRadius:12, padding:"12px 7px 10px", display:"flex", flexDirection:"column", alignItems:"center", gap:5, border:blocked?"1px solid rgba(239,68,68,0.35)":isW?`1px solid ${sc.color}15`:"1px solid rgba(255,255,255,0.035)", position:"relative", transition:"border .3s, background .3s" }}>
      {wip!==null&&<div style={{ position:"absolute", top:-11, right:-5, background:`linear-gradient(135deg,${sc.color},${sc.color}bb)`, color:"#fff", fontSize:8, fontWeight:800, borderRadius:7, padding:"2px 7px", fontFamily:mono, boxShadow:`0 2px 8px ${sc.color}33`, letterSpacing:.3 }}>{wip}</div>}
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:15, marginBottom:2, lineHeight:1 }}>{sc.icon}</div>
        <div style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:.5, color:sc.color }}>{sc.label}</div>
      </div>
      <div style={{ fontSize:8, fontFamily:mono, color:"#3e5070", fontWeight:600 }}>
        {sid==="backlog"?`${items.length} waiting`:sid==="done"?`${items.length}/${TOTAL_ITEMS}`:isW&&items.length?`${cc}/${items.length} flipped`:isW?"idle":""}
      </div>
      {blocked&&<div className="pulse" style={{ fontSize:7, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, color:"#ef4444", background:"rgba(239,68,68,0.08)", borderRadius:4, padding:"2px 7px", animation:"pulse 1.5s ease infinite" }}>blocked ↓</div>}
      {isW&&items.length>0&&!af&&cc>0&&<div style={{ fontSize:7, fontWeight:700, textTransform:"uppercase", letterSpacing:.8, color:"#f59e0b", background:"rgba(245,158,11,0.06)", borderRadius:4, padding:"2px 7px" }}>flipping...</div>}
      <div style={{ display:"flex", flexWrap:"wrap", gap:5, justifyContent:"center", flex:1, alignContent:"start", marginTop:3 }}>
        {items.map(x=><Coin key={x.id} item={x} sc={sc}/>)}
      </div>
    </div>
  );
}

function GameStep({ runs, setRuns, snaps, setSnaps, onNext, onBack }) {
  const [bs,setBs]=useState(20);
  const [cb,setCb]=useState("");
  const [items,setItems]=useState(()=>makeItems(TOTAL_ITEMS));
  const [tick,setTick]=useState(0);
  const [on,setOn]=useState(false);
  const [spd,setSpd]=useState(280);
  const tr=useRef(null);
  const allD=items.every(x=>x.state==="done");
  const st=getStats(items);

  useEffect(()=>{
    if(on&&!allD){tr.current=setTimeout(()=>{setTick(t=>{const nt=t+1;setItems(p=>simTick(p,bs,nt));return nt;});},spd);return()=>clearTimeout(tr.current);}
    if(on&&allD&&st){setOn(false);setRuns(p=>[...p,{bs,...st}]);setSnaps(p=>[...p,{bs,items:items.map(x=>({...x})),ticks:tick}]);}
  },[on,tick,allD,spd,bs,st,setRuns,setSnaps,items]);

  const start=()=>{setItems(makeItems(TOTAL_ITEMS));setTick(0);setOn(true);};
  const reset=()=>{setOn(false);setItems(makeItems(TOTAL_ITEMS));setTick(0);};
  const selBs=(s)=>{setBs(s);setCb("");reset();};
  const getI=(sid)=>items.filter(x=>x.state===sid);
  const dc=getI("done").length;
  const enough=runs.length>=2;
  const bnSt=(()=>{let mx=0,bn=null;for(const s of WORK_STATES){const r=items.filter(x=>x.state===s).reduce((sm,x)=>sm+Math.max(0,x.wr[s]-x.wd[s]),0);if(r>mx){mx=r;bn=s;}}return STAGES.find(s=>s.id===bn);})();

  return (
    <div className="fade-up">
      <StepHeader tag="Simulation" tagColor="#3b82f6" title="Run the Penny Game"
        desc={enough?"You've run multiple simulations. Run more or continue to analyse your results.":"Run at least 2 simulations with different batch sizes to compare."} />

      {/* Controls — wraps on mobile */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", padding:"12px 14px", marginBottom:14, background:"rgba(255,255,255,0.015)", borderRadius:12, border:"1px solid rgba(255,255,255,0.05)" }}>
        <span style={{ fontSize:9, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:"#4b5c78" }}>Batch</span>
        <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
          {[20,10,5,2,1].map(s=>(
            <button key={s} onClick={()=>selBs(s)} disabled={on} style={{
              padding:"6px 14px", borderRadius:8, border:bs===s?"2px solid #3b82f6":"2px solid rgba(255,255,255,0.06)",
              background:bs===s?"rgba(59,130,246,0.1)":"transparent", color:bs===s?"#60a5fa":"#4b5c78",
              fontWeight:700, fontSize:13, fontFamily:mono, cursor:on?"not-allowed":"pointer", opacity:on?.5:1, transition:"all .2s", minWidth:40, textAlign:"center",
            }}>{s}</button>
          ))}
        </div>
        <div style={{ display:"flex", gap:4, alignItems:"center" }}>
          <input type="number" min="1" max="20" placeholder="1-20" value={cb} onChange={e=>setCb(e.target.value)} disabled={on}
            style={{ width:52, padding:"6px 8px", borderRadius:8, border:"2px solid rgba(255,255,255,0.06)", background:"transparent", color:"#e2e8f0", fontSize:13, fontFamily:mono, outline:"none" }} />
          <button onClick={()=>{const v=parseInt(cb);if(v>=1&&v<=20){setBs(v);reset();}}} disabled={on||!cb}
            style={{ padding:"6px 10px", borderRadius:7, border:"2px solid rgba(255,255,255,0.06)", background:"transparent", color:"#4b5c78", fontSize:9, fontWeight:700, cursor:"pointer", textTransform:"uppercase" }}>Go</button>
        </div>
        <div style={{ flex:"1 0 100%", height:0 }} className="break-mobile" /> {/* force wrap on mobile */}
        <div style={{ display:"flex", gap:6, alignItems:"center", flex:1, justifyContent:"flex-end", flexWrap:"wrap" }}>
          <span style={{ fontSize:8, color:"#3b4963", fontWeight:700, textTransform:"uppercase" }}>Speed</span>
          <input type="range" min={40} max={650} step={20} value={690-spd} onChange={e=>setSpd(690-parseInt(e.target.value))} style={{ width:65, accentColor:"#3b82f6" }} />
          <button onClick={()=>{if(!allD){const nt=tick+1;setItems(p=>simTick(p,bs,nt));setTick(nt);}}} disabled={on||allD}
            style={{ padding:"6px 12px", borderRadius:8, border:"2px solid rgba(255,255,255,0.06)", background:"transparent", color:on||allD?"#1e293b":"#64748b", fontSize:11, fontWeight:700, cursor:on||allD?"not-allowed":"pointer", fontFamily:mono }}>Step ▸</button>
          {!on?(
            <button onClick={allD?start:tick>0?()=>setOn(true):start} style={{ padding:"7px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#3b82f6,#6366f1)", color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 3px 12px rgba(59,130,246,0.2)", transition:"box-shadow .2s" }}>
              {allD?"▶ New Run":tick>0?"▶ Resume":"▶ Start"}
            </button>
          ):(
            <button onClick={()=>setOn(false)} style={{ padding:"7px 20px", borderRadius:10, border:"none", background:"#1a2540", color:"#64748b", fontWeight:700, fontSize:13, cursor:"pointer" }}>⏸ Pause</button>
          )}
          <button onClick={reset} style={{ padding:"6px 14px", borderRadius:8, border:"1px solid rgba(255,255,255,0.06)", background:"transparent", color:"#334155", fontWeight:600, fontSize:11, cursor:"pointer" }}>Reset</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ height:3, background:"rgba(255,255,255,0.03)", borderRadius:2, marginBottom:14, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(dc/TOTAL_ITEMS)*100}%`, background:"linear-gradient(90deg,#f59e0b,#3b82f6,#10b981,#22c55e)", borderRadius:2, transition:"width .35s ease" }} />
      </div>

      {/* Stats */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
        {[{l:"Tick",v:tick},{l:"Batch",v:bs,a:true},{l:"Done",v:`${dc}/${TOTAL_ITEMS}`,g:allD},
          ...(st?[{l:"1st Item",v:st.first},{l:"Avg Cycle",v:st.ac},{l:"Avg Wait",v:st.aw}]:[]),
          ...(bnSt&&tick>0&&!allD?[{l:"Bottleneck",v:`${bnSt.icon} ${bnSt.label}`,w:true}]:[]),
        ].map((s,i)=>(
          <div key={i} className="pop-in" style={{
            background:s.w?"rgba(245,158,11,0.06)":s.a?"rgba(59,130,246,0.06)":"rgba(255,255,255,0.018)",
            borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:80,
            border:s.w?"1px solid rgba(245,158,11,0.12)":s.a?"1px solid rgba(59,130,246,0.12)":"1px solid rgba(255,255,255,0.04)",
            animation:s.g?"glow 2s ease infinite":"none", animationDelay:`${i*50}ms`,
          }}>
            <div style={{ fontSize:20, fontWeight:800, fontFamily:mono, color:s.g?"#34d399":s.w?"#fbbf24":s.a?"#60a5fa":"#e2e8f0", lineHeight:1 }}>{s.v}</div>
            <div style={{ fontSize:8, color:"#4b5c78", textTransform:"uppercase", letterSpacing:.7, marginTop:4, fontWeight:700 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Board */}
      <div style={{ display:"flex", gap:6, marginBottom:16, padding:12, background:"rgba(255,255,255,0.008)", borderRadius:16, border:"1px solid rgba(255,255,255,0.035)", overflowX:"auto", minHeight:220, WebkitOverflowScrolling:"touch" }}>
        {STAGES.map(sc=><Col key={sc.id} sc={sc} items={getI(sc.id)} wip={WORK_STATES.includes(sc.id)?bs:null} all={items}/>)}
      </div>

      {/* Finished */}
      {allD&&tick>0&&(
        <Card accent="34,197,94" style={{ marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"#34d399", marginBottom:4 }}>✓ Batch {bs} complete — {tick} ticks</div>
          <div style={{ fontSize:13, color:"#6ee7b7", lineHeight:1.5 }}>
            {bs>=10?"Try a smaller batch to see the difference.":bs>1?"Try single-piece flow (batch 1) for the ultimate comparison.":"Single-piece flow — peak flow."}
          </div>
        </Card>
      )}

      {/* Comparison */}
      {runs.length>0&&(
        <Card style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:1.2, color:"#94a3b8", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ width:6,height:6,borderRadius:"50%",background:"#3b82f6",display:"inline-block" }}/>Run Comparison
          </div>
          <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:mono, minWidth:460 }}>
              <thead><tr style={{ color:"#3e5070", fontSize:8, textTransform:"uppercase", letterSpacing:1 }}>
                {["Batch","1st Item","All Done","Avg Cycle","Avg Wait","Bottleneck"].map((h,i)=><th key={h} style={{ padding:"6px 8px", textAlign:i===0?"left":"right", fontWeight:700 }}>{h}</th>)}
              </tr></thead>
              <tbody>{runs.map((r,i)=>{
                const si=STAGES.find(s=>s.id===r.bn); const bf=Math.min(...runs.map(x=>x.first)); const ba=Math.min(...runs.map(x=>x.all||Infinity));
                return(
                  <tr key={i} style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding:"10px 8px",fontWeight:700,color:"#e2e8f0",fontSize:15 }}>{r.bs}</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",color:r.first===bf&&runs.length>1?"#34d399":"#64748b",fontWeight:r.first===bf&&runs.length>1?700:400 }}>{r.first}</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",color:r.all===ba&&runs.length>1?"#34d399":"#64748b",fontWeight:r.all===ba&&runs.length>1?700:400 }}>{r.all}</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",color:"#64748b" }}>{r.ac}</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",color:"#64748b" }}>{r.aw}</td>
                    <td style={{ padding:"10px 8px",textAlign:"right",color:si?.color,fontWeight:600 }}>{si?.icon} {si?.label}</td>
                  </tr>);
              })}</tbody>
            </table>
          </div>
          {runs.length>=2&&(()=>{ const sr=[...runs].sort((a,b)=>a.first-b.first); const f=sr[0],sl=sr[sr.length-1]; const pct=sl.first>0?Math.round(((sl.first-f.first)/sl.first)*100):0;
            return <div style={{ marginTop:12,padding:"10px 16px",background:"rgba(16,185,129,0.04)",borderRadius:10,border:"1px solid rgba(16,185,129,0.1)",fontSize:12,color:"#6ee7b7",lineHeight:1.6 }}>
              <strong>Insight:</strong> Batch {f.bs} delivered the first item <strong>{pct}% faster</strong> than batch {sl.bs}. Smaller batches pull work through, adapting to bottlenecks naturally.
            </div>;
          })()}
          <button onClick={()=>{setRuns([]);setSnaps([]);}} style={{ marginTop:10,padding:"4px 12px",borderRadius:6,border:"1px solid rgba(255,255,255,0.05)",background:"transparent",color:"#253352",fontSize:9,cursor:"pointer",fontWeight:600 }}>Clear runs</button>
        </Card>
      )}

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:20, flexWrap:"wrap", gap:10 }}>
        <Btn onClick={onBack}>← Intro</Btn>
        <Btn primary onClick={onNext} disabled={!enough}>{enough?"Analyse Results →":`Run ${2-runs.length} more to continue`}</Btn>
      </div>
    </div>
  );
}

// ─── STEP 3: DEBRIEF ───────────────────────────────────────────────

function ChartCard({ title, desc, children }) {
  return (
    <Card>
      <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:4 }}>{title}</div>
      {desc&&<div style={{ fontSize:12, color:"#4b5c78", marginBottom:14, lineHeight:1.55 }}>{desc}</div>}
      {children}
    </Card>
  );
}

function DebriefStep({ runs, snaps, onNext, onBack }) {
  const sorted=[...runs].sort((a,b)=>a.bs-b.bs);
  const sm=sorted[0], lg=sorted[sorted.length-1];
  const maxT=Math.max(...snaps.map(s=>s.ticks),1);
  const tpSeries=snaps.map(s=>({bs:s.bs,data:throughputData(s.items,s.ticks),color:getBatchColor(s.bs)}));
  const merged=[]; for(let t=0;t<=maxT;t++){const pt={tick:t};tpSeries.forEach((s,i)=>{const d=s.data.find(d=>d.tick===t);pt[`b${s.bs}_${i}`]=d?d.done:(t>s.data[s.data.length-1]?.tick?TOTAL_ITEMS:0);});merged.push(pt);}
  const cyD=runs.map(r=>({name:`Batch ${r.bs}`,bs:r.bs,ct:parseFloat(r.ac),wt:parseFloat(r.aw),color:getBatchColor(r.bs)}));
  const lgSnap=snaps.find(s=>s.bs===lg?.bs), smSnap=snaps.find(s=>s.bs===sm?.bs);
  const lgBd=lgSnap?itemBreakdown(lgSnap.items):[], smBd=smSnap?itemBreakdown(smSnap.items):[];
  const ltD=snaps.map(s=>{const d=s.items.filter(x=>x.dt!==null);return{bs:s.bs,cts:d.map(x=>x.dt-x.st),color:getBatchColor(s.bs)};});

  return (
    <div className="fade-up" style={{ maxWidth:900 }}>
      <StepHeader tag="Debrief" tagColor="#10b981" title="Analysing Your Results"
        desc="Let's visualise what happened. These are the same flow charts Kanban teams use to understand and improve their systems." />

      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <ChartCard title="📈 Cumulative Throughput" desc="Items completed over time. Large batches: flat then jumps. Small batches: steady and early — healthy flow.">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={merged} margin={{top:5,right:10,bottom:20,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
              <XAxis dataKey="tick" stroke="#3e5070" tick={{fontSize:10,fontFamily:mono}} label={{value:"Tick",position:"insideBottom",offset:-8,style:{fontSize:10,fill:"#3e5070"}}} />
              <YAxis stroke="#3e5070" tick={{fontSize:10,fontFamily:mono}} domain={[0,TOTAL_ITEMS]} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}} />
              {tpSeries.map((s,i)=><Line key={i} type="stepAfter" dataKey={`b${s.bs}_${i}`} stroke={s.color} strokeWidth={2.5} dot={false} name={`Batch ${s.bs}`} />)}
              <ReferenceLine y={TOTAL_ITEMS} stroke="#22c55e1a" strokeDasharray="3 3"/>
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="⏱ Average Cycle Time vs Wait Time" desc="Cycle time = total time in system. Wait time = idle time. The red reveals pure waste.">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cyD} margin={{top:5,right:10,bottom:20,left:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
              <XAxis dataKey="name" stroke="#3e5070" tick={{fontSize:10,fontFamily:mono}} />
              <YAxis stroke="#3e5070" tick={{fontSize:10,fontFamily:mono}} label={{value:"Ticks",angle:-90,position:"insideLeft",style:{fontSize:10,fill:"#3e5070"}}} />
              <Tooltip {...ttStyle} />
              <Legend wrapperStyle={{fontSize:11,paddingTop:8}} />
              <Bar dataKey="ct" name="Cycle Time" radius={[4,4,0,0]}>{cyD.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={.75}/>)}</Bar>
              <Bar dataKey="wt" name="Wait Time" radius={[4,4,0,0]}>{cyD.map((_,i)=><Cell key={i} fill="#ef4444" fillOpacity={.45}/>)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {lgBd.length>0&&smBd.length>0&&lg.bs!==sm.bs&&(
          <ChartCard title="🔍 Work Time vs Wait Time — Per Item" desc={`Each bar = one coin. Green = processing. Red = waiting. Batch ${lg.bs} (left) vs ${sm.bs} (right).`}>
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {[{label:`Batch ${lg.bs}`,data:lgBd,color:getBatchColor(lg.bs)},{label:`Batch ${sm.bs}`,data:smBd,color:getBatchColor(sm.bs)}].map((set,si)=>(
                <div key={si} style={{ flex:"1 1 280px", minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:set.color, marginBottom:8, textAlign:"center" }}>{set.label}</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={set.data} margin={{top:5,right:5,bottom:15,left:0}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
                      <XAxis dataKey="id" stroke="#3e5070" tick={{fontSize:9,fontFamily:mono}} label={{value:"Coin #",position:"insideBottom",offset:-6,style:{fontSize:9,fill:"#3e5070"}}}/>
                      <YAxis stroke="#3e5070" tick={{fontSize:9,fontFamily:mono}}/>
                      <Tooltip {...ttStyle}/>
                      <Bar dataKey="workTime" name="Work" stackId="a" fill="#22c55e" fillOpacity={.65}/>
                      <Bar dataKey="waitTime" name="Wait" stackId="a" fill="#ef4444" fillOpacity={.45} radius={[3,3,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {ltD.length>0&&(
          <ChartCard title="📊 Lead Time Distribution" desc="Large batches: items cluster at the same high value. Small batches: shorter, more varied — reflecting actual work.">
            <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
              {ltD.map((run,ri)=>{
                const mn=Math.min(...run.cts), mx=Math.max(...run.cts);
                const bk=[]; for(let v=mn;v<=mx;v++)bk.push({value:v,count:run.cts.filter(c=>c===v).length});
                return(
                  <div key={ri} style={{ flex:"1 1 240px", minWidth:0 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:run.color, marginBottom:8, textAlign:"center" }}>Batch {run.bs}</div>
                    <ResponsiveContainer width="100%" height={150}>
                      <BarChart data={bk} margin={{top:5,right:5,bottom:15,left:0}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
                        <XAxis dataKey="value" stroke="#3e5070" tick={{fontSize:9,fontFamily:mono}} label={{value:"Lead Time",position:"insideBottom",offset:-6,style:{fontSize:9,fill:"#3e5070"}}}/>
                        <YAxis stroke="#3e5070" tick={{fontSize:9,fontFamily:mono}} allowDecimals={false}/>
                        <Tooltip {...ttStyle}/>
                        <Bar dataKey="count" name="Items" radius={[3,3,0,0]}>{bk.map((_,i)=><Cell key={i} fill={run.color} fillOpacity={.65}/>)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}

        <Card accent="139,92,246">
          <div style={{ fontSize:14, fontWeight:700, color:"#a78bfa", marginBottom:10 }}>💡 The Kanban Principle</div>
          <div style={{ fontSize:13, color:"#c4b5fd", lineHeight:1.75 }}>
            <strong>Stop starting, start finishing.</strong> By limiting work in progress, you reduce lead times, expose bottlenecks, and create smoother flow. These charts — throughput, cycle time, lead time distribution — are the same tools Kanban teams use daily. In the next lessons, you'll apply them to real Kanban boards.
          </div>
        </Card>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, flexWrap:"wrap", gap:10 }}>
        <Btn onClick={onBack}>← Simulation</Btn>
        <Btn primary onClick={onNext}>Take the Quiz →</Btn>
      </div>
    </div>
  );
}

// ─── STEP 4: QUIZ ──────────────────────────────────────────────────

function QuizStep({ onBack }) {
  const [ans,setAns]=useState({});
  const [done,setDone]=useState(false);
  const sel=(qid,oi)=>{if(!done)setAns(p=>({...p,[qid]:oi}));};
  const allA=QUIZ.every(q=>ans[q.id]!==undefined);
  const score=QUIZ.filter(q=>ans[q.id]===q.ans).length;
  const pct=Math.round((score/QUIZ.length)*100);
  const pass=pct>=80;

  return (
    <div className="fade-up" style={{ maxWidth:740 }}>
      <StepHeader tag="Knowledge Check" tagColor="#8b5cf6" title="Quiz: Batch Size & Flow"
        desc="Test your understanding. You need 80% to pass." />

      <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
        {QUIZ.map((q,qi)=>{
          const picked=ans[q.id]!==undefined;
          const ok=done&&ans[q.id]===q.ans;
          const bad=done&&picked&&ans[q.id]!==q.ans;
          return(
            <div key={q.id} className="slide-in" style={{
              background:done?(ok?"rgba(34,197,94,0.04)":bad?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.015)"):"rgba(255,255,255,0.015)",
              borderRadius:14, padding:"18px 20px", animationDelay:`${qi*80}ms`,
              border:done?(ok?"1px solid rgba(34,197,94,0.2)":bad?"1px solid rgba(239,68,68,0.2)":"1px solid rgba(255,255,255,0.05)"):"1px solid rgba(255,255,255,0.05)",
              transition:"background .3s, border .3s",
            }}>
              <div style={{ fontSize:14, fontWeight:700, color:"#e2e8f0", marginBottom:14, lineHeight:1.5 }}>
                <span style={{ color:"#4b5c78", marginRight:8, fontFamily:mono }}>{qi+1}.</span>{q.q}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {q.opts.map((opt,oi)=>{
                  const isSel=ans[q.id]===oi;
                  const showOk=done&&oi===q.ans;
                  const showBad=done&&isSel&&oi!==q.ans;
                  return(
                    <button key={oi} onClick={()=>sel(q.id,oi)} style={{
                      padding:"12px 16px", borderRadius:10, textAlign:"left",
                      border:showOk?"2px solid #22c55e":showBad?"2px solid #ef4444":isSel?"2px solid #3b82f6":"2px solid rgba(255,255,255,0.06)",
                      background:showOk?"rgba(34,197,94,0.06)":showBad?"rgba(239,68,68,0.06)":isSel?"rgba(59,130,246,0.06)":"transparent",
                      color:showOk?"#6ee7b7":showBad?"#fca5a5":isSel?"#93c5fd":"#8b9bb5",
                      fontSize:13, fontWeight:isSel?600:400, cursor:done?"default":"pointer", lineHeight:1.5,
                      transition:"all .2s",
                    }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", justifyContent:"center",
                        width:22, height:22, borderRadius:"50%", marginRight:12, flexShrink:0,
                        fontSize:10, fontWeight:700, fontFamily:mono, verticalAlign:"middle",
                        background:showOk?"#22c55e":showBad?"#ef4444":isSel?"#3b82f6":"#151d30",
                        color:isSel||showOk||showBad?"#fff":"#3e5070",
                        border:!isSel&&!showOk&&!showBad?"2px solid #253352":"none",
                        transition:"all .2s",
                      }}>{showOk?"✓":showBad?"✗":String.fromCharCode(65+oi)}</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {done&&<div className="fade-in" style={{
                marginTop:12, padding:"10px 14px", borderRadius:10,
                background:ok?"rgba(34,197,94,0.04)":"rgba(59,130,246,0.04)",
                border:ok?"1px solid rgba(34,197,94,0.08)":"1px solid rgba(59,130,246,0.08)",
                fontSize:12, color:ok?"#6ee7b7":"#93c5fd", lineHeight:1.6,
              }}>{q.exp}</div>}
            </div>
          );
        })}
      </div>

      {!done?(
        <div style={{ marginTop:24, display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <Btn onClick={onBack}>← Debrief</Btn>
          <Btn primary onClick={()=>setDone(true)} disabled={!allA}>
            {allA?"Submit Answers":`Answer all ${QUIZ.length} questions`}
          </Btn>
        </div>
      ):(
        <div style={{ marginTop:24 }}>
          <div className="pop-in" style={{
            background:pass?"rgba(34,197,94,0.05)":"rgba(245,158,11,0.05)",
            borderRadius:16, padding:"24px 28px",
            border:pass?"1px solid rgba(34,197,94,0.18)":"1px solid rgba(245,158,11,0.18)",
            textAlign:"center",
          }}>
            <div style={{ fontSize:52, fontWeight:800, fontFamily:mono, color:pass?"#34d399":"#fbbf24", lineHeight:1 }}>{pct}%</div>
            <div style={{ fontSize:16, fontWeight:700, color:pass?"#34d399":"#fbbf24", marginTop:6, marginBottom:8 }}>
              {pass?"Lesson Complete!":"Almost There"}
            </div>
            <div style={{ fontSize:13, color:"#8b9bb5", lineHeight:1.55, maxWidth:400, margin:"0 auto" }}>
              {pass?`You scored ${score}/${QUIZ.length}. Solid understanding of batch size, flow, and pull systems.`:`You scored ${score}/${QUIZ.length}. Review the explanations above and try again — 80% needed.`}
            </div>
            {!pass&&<button onClick={()=>{setAns({});setDone(false);}} style={{ marginTop:16, padding:"10px 24px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#f59e0b,#ef4444)", color:"#fff", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 4px 12px rgba(239,68,68,0.15)" }}>Retry Quiz</button>}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:18, flexWrap:"wrap", gap:10 }}>
            <Btn onClick={onBack}>← Debrief</Btn>
            {pass&&<Btn primary disabled>Next Lesson: WIP Limits & Work Item Age →</Btn>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────

export default function KanbanLesson1() {
  const [step,setStep]=useState(0);
  const [runs,setRuns]=useState([]);
  const [snaps,setSnaps]=useState([]);
  const labels=["Intro","Simulation","Debrief","Quiz"];
  const enough=runs.length>=2;
  const canAdv=(t)=>{if(t<=step)return true;if(t===1)return true;if(t>=2)return enough;return false;};

  return (
    <Shell>
      <Header />
      <Nav step={step} labels={labels} onNav={setStep} canAdv={canAdv(step+1)} />
      {step===0&&<IntroStep onNext={()=>setStep(1)}/>}
      {step===1&&<GameStep runs={runs} setRuns={setRuns} snaps={snaps} setSnaps={setSnaps} onNext={()=>setStep(2)} onBack={()=>setStep(0)}/>}
      {step===2&&<DebriefStep runs={runs} snaps={snaps} onNext={()=>setStep(3)} onBack={()=>setStep(1)}/>}
      {step===3&&<QuizStep onBack={()=>setStep(2)}/>}
      <Footer />
    </Shell>
  );
}
