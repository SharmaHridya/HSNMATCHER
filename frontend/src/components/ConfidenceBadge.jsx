const styles = {
  high: 'border-emerald-300/50 bg-emerald-100 text-emerald-900',
  medium: 'border-amber-300/60 bg-amber-100 text-amber-900',
  low: 'border-rose-300/60 bg-rose-100 text-rose-900',
}

export default function ConfidenceBadge({ confidence }) {
  const label = String(confidence || 'low').toLowerCase()
  const isKnown = Object.hasOwn(styles, label)
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize ${isKnown ? styles[label] : 'border-slate-300 bg-slate-100 text-slate-700'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${label === 'high' ? 'bg-emerald-600' : label === 'medium' ? 'bg-amber-600' : label === 'low' ? 'bg-rose-600' : 'bg-slate-500'}`} />
      {isKnown ? `${label} confidence` : 'Unranked'}
    </span>
  )
}
