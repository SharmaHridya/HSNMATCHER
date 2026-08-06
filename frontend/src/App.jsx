import { useState } from 'react'
import ClassifyPage from './pages/ClassifyPage'
import LookupPage from './pages/LookupPage'
import BulkPage from './pages/BulkPage'
import Disclaimer from './components/Disclaimer'

export default function App() {
  const [page, setPage] = useState('classify')
  const [disclaimer, setDisclaimer] = useState('')
  return <div className="flex min-h-screen flex-col bg-canvas"><header className="border-b border-sage-200 bg-canvas/90 backdrop-blur"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><button onClick={() => setPage('classify')} className="flex items-center gap-3 self-start"><span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-sm font-black text-mint-300">H</span><span className="text-lg font-bold tracking-[-0.04em] text-ink">HSNMatch</span></button><nav aria-label="Primary navigation" className="flex flex-wrap rounded-xl bg-sage-100 p-1">{[['classify', 'Classify description'], ['bulk', 'Bulk CSV'], ['lookup', 'Code lookup']].map(([id, label]) => <button key={id} onClick={() => setPage(id)} className={`rounded-lg px-3 py-2 text-sm font-semibold transition sm:px-4 ${page === id ? 'bg-white text-ink shadow-sm' : 'text-sage-700 hover:text-ink'}`}>{label}</button>)}</nav></div></header><main className="flex-1">{page === 'classify' ? <ClassifyPage onDisclaimer={setDisclaimer} /> : page === 'bulk' ? <BulkPage /> : <LookupPage />}</main><Disclaimer text={disclaimer}/></div>
}
