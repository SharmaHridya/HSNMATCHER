import { useState } from 'react'
import ConfidenceBadge from './ConfidenceBadge'
import CorrectionForm from './CorrectionForm'

export default function ResultCard({ result, rank, isUnranked, queryId }) {
  const [showCorrection, setShowCorrection] = useState(false)

  return (
    <article className={`relative overflow-hidden rounded-2xl border bg-white p-5 shadow-card transition sm:p-6 ${isUnranked ? 'border-slate-200' : rank === 1 ? 'border-mint-300 ring-1 ring-mint-200' : 'border-stone-200'}`}>
      <div className={`absolute inset-y-0 left-0 w-1 ${isUnranked ? 'bg-slate-300' : rank === 1 ? 'bg-mint-500' : 'bg-sage-300'}`} />
      <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-sage-500">{isUnranked ? `Similarity match ${rank}` : `Recommendation ${rank}`}</p>
          <h3 className="mt-2 font-mono text-xl font-bold tracking-tight text-ink">{result.code}</h3>
        </div>
        <ConfidenceBadge confidence={isUnranked ? 'unranked' : result.confidence} />
      </div>
      <p className="mt-4 pl-2 text-sm leading-6 text-slate-700">{result.description}</p>
      <div className="mt-5 grid gap-3 border-t border-stone-100 pt-4 pl-2 sm:grid-cols-[auto_1fr] sm:items-start">
        <div><span className="text-xs font-bold uppercase tracking-[0.12em] text-sage-500">GST rate</span><p className="mt-1 text-lg font-bold text-ink">{result.gst_rate ?? '—'}</p></div>
        <div className="sm:border-l sm:border-stone-200 sm:pl-4"><span className="text-xs font-bold uppercase tracking-[0.12em] text-sage-500">Why this match</span><p className="mt-1 text-sm leading-5 text-slate-600">{isUnranked ? 'Explanation unavailable. Displaying similarity-search results only.' : result.reasoning || 'No explanation was returned for this recommendation.'}</p></div>
      </div>
      <div className="mt-5 border-t border-stone-100 pt-4 pl-2">
        <button type="button" onClick={() => setShowCorrection((value) => !value)} className="text-sm font-semibold text-sage-700 transition hover:text-ink">
          {showCorrection ? 'Hide correction form' : 'This isn’t right?'}
        </button>
        {showCorrection ? <CorrectionForm queryId={queryId} resultCode={result.code} /> : null}
      </div>
    </article>
  )
}
