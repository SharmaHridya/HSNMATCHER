export default function SimilaritySparkline({ confidence }) {
  const values = { high: [7, 11, 15, 19, 24], medium: [7, 10, 13, 15, 17], low: [6, 8, 9, 11, 12], unranked: [6, 8, 10, 11, 12] }
  const label = String(confidence || 'unranked').toLowerCase()
  return <div aria-label="Similarity signal" className="hidden items-end gap-1 sm:flex">{(values[label] || values.unranked).map((height, i) => <span key={i} className="w-1 bg-accent/70" style={{ height }} />)}</div>
}
