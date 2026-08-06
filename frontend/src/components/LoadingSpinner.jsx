export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center gap-3 text-sm font-semibold text-sage-700">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-sage-300 border-t-sage-700" />
      <span>{label}</span>
    </div>
  )
}
