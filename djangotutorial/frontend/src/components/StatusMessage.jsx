import { TriangleAlert } from 'lucide-react'
export default function StatusMessage({ tone = 'neutral', children }) {
  const error = tone === 'error'
  return <div role={error ? 'alert' : 'status'} className={`flex gap-3 border p-4 text-sm leading-6 ${error ? 'border-confidence-low-fg bg-confidence-low-bg text-confidence-low-fg' : 'border-border bg-white text-ink-muted'}`}>{error && <TriangleAlert size={18} strokeWidth={1.6} className="mt-0.5 shrink-0" />}{children}</div>
}
