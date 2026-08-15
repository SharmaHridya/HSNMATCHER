import { useState } from 'react'
import { ScanSearch, FileSpreadsheet, Hash } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import ClassifyPage from './pages/ClassifyPage'
import LookupPage from './pages/LookupPage'
import BulkPage from './pages/BulkPage'
import Disclaimer from './components/Disclaimer'
import Hero from './pages/Hero'

const tabs=[['classify','Classify',ScanSearch],['bulk','Bulk Upload',FileSpreadsheet],['lookup','Lookup',Hash]]
const naturalEase = [0.22, 1, 0.36, 1]
const ambientDots = Array.from({ length: 28 }, (_, index) => {
  const x = 7 + ((index * 13) % 84)
  const y = 8 + ((index * 17) % 78)
  const driftX = ((index % 5) - 2) * 12
  const driftY = ((index % 4) - 1.5) * 12
  return { x, y, driftX, driftY, duration: 25 + (index % 15), delay: (index % 9) * 0.8 }
})

function AppShell({ children, tone }) {
  return <div className={`relative min-h-screen text-ink ${tone === 'sand' ? 'bg-canvas-sand' : tone === 'sage' ? 'bg-canvas-sage' : 'bg-primary'}`}><div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${tone === 'sand' ? 'ambient-sand bg-canvas-sand' : tone === 'sage' ? 'ambient-sage bg-canvas-sage' : 'bg-primary'}`}><div className="ambient-grid absolute inset-0 opacity-80" /><svg className="absolute inset-0 h-full w-full opacity-100" preserveAspectRatio="none" aria-hidden="true">{ambientDots.slice(0, -1).map((dot, index) => <line key={index} x1={`${dot.x}%`} y1={`${dot.y}%`} x2={`${ambientDots[index + 1].x}%`} y2={`${ambientDots[index + 1].y}%`} stroke="rgba(47,72,88,0.03)" strokeWidth="1" />)}</svg><div className="absolute inset-0">{ambientDots.map((dot, index) => <span key={index} className="ambient-dot" style={{ left: `${dot.x}%`, top: `${dot.y}%`, ['--drift-x']: `${dot.driftX}px`, ['--drift-y']: `${dot.driftY}px`, ['--duration']: `${dot.duration}s`, ['--delay']: `${dot.delay}s` }}/>)}</div></div><div className="relative z-10">{children}</div></div>
}

export default function App(){const [page,setPage]=useState('home'),[disclaimer,setDisclaimer]=useState(''),[seed,setSeed]=useState(''); const goClassify=(text='')=>{setSeed(text);setPage('classify')}; const tone=page==='bulk'?'sand':page==='home'?'primary':'sage'; return <AppShell tone={tone}><header className="sticky top-0 z-20 border-b border-white/10 bg-primary/95 text-[#F6F4EF] backdrop-blur-sm"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"><button onClick={()=>setPage('home')} className="flex items-center gap-2"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 3h11l6 6-6 6H3z" stroke="#4F7869" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="7" cy="7" r="1.5" fill="#B5563C"/></svg><span className="font-display text-lg font-normal tracking-tight text-[#F6F4EF]">HSNMatch</span></button><nav className="hidden h-full items-center gap-6 sm:flex" aria-label="Primary navigation">{tabs.map(([id,label,Icon])=><button key={id} onClick={()=>setPage(id)} className={`relative flex h-full items-center gap-2 text-sm transition-colors ${page===id?'text-[#F6F4EF]':'text-[#F6F4EF]/60 hover:text-[#F6F4EF]'}`}><Icon size={16}/>{label}{page===id&&<motion.span layoutId="activeTab" className="absolute inset-x-0 bottom-0 h-[0.5px] bg-accent-2" transition={{duration:.2,ease:naturalEase}}/>}</button>)}</nav><span className="hidden rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-[#F6F4EF]/70 lg:block">⚬ Local embeddings · LLM reasoning</span></div></header><main className="flex-1 pb-16 sm:pb-0"><AnimatePresence mode="wait"><motion.div key={page} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-8}} transition={{duration:.2,ease:naturalEase}}>{page==='home'?<Hero onClassify={goClassify}/>:page==='classify'?<ClassifyPage onDisclaimer={setDisclaimer} initialDescription={seed}/>:page==='bulk'?<BulkPage/>:<LookupPage/>}</motion.div></AnimatePresence></main><Disclaimer text={disclaimer}/></AppShell>}
