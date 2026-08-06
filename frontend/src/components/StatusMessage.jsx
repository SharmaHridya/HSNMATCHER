export default function StatusMessage({ tone = 'neutral', children }) {
  const colors = tone === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-sage-200 bg-sage-50 text-sage-800'
  return <div role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${colors}`}>{children}</div>
}
