export default function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-sage-300 bg-white p-8 text-center shadow-card">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}
