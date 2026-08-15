const styles = {
  high: 'bg-confidence-high-bg text-confidence-high-fg',
  medium: 'bg-confidence-medium-bg text-confidence-medium-fg',
  low: 'bg-confidence-low-bg text-confidence-low-fg',
  unranked: 'bg-confidence-unranked-bg text-confidence-unranked-fg',
}

export default function ConfidenceBadge({ confidence, level }) {
  const label = String(level || confidence || 'unranked').toLowerCase()
  const known = Object.hasOwn(styles, label) ? label : 'unranked'

  return (
    <span className={`relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[.08em] ${known === 'high' ? 'badge-high' : ''} ${styles[known]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {known === 'unranked' ? 'Unranked' : `${known} confidence`}
    </span>
  )
}
