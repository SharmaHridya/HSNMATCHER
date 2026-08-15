import { useEffect, useState } from 'react'
import { ArrowRight, ScanSearch } from 'lucide-react'
import { classifyDescription } from '../api/hsn'
import ResultCard from '../components/ResultCard'
import HsnCode from '../components/HsnCode'
import StatusMessage from '../components/StatusMessage'

const isUnranked = (r) => String(r?.confidence || '').toLowerCase() === 'unranked'

function SkeletonCard() {
  return (
    <div className="border border-border bg-surface p-5">
      <div className="flex justify-between">
        <HsnCode value="000000" />
        <span className="h-7 w-24 bg-slate-100" />
      </div>
      <div className="mt-5 h-4 w-3/4 bg-slate-100" />
      <div className="mt-3 h-4 w-1/2 bg-slate-100" />
      <div className="mt-5 border-t border-border pt-4">
        <div className="h-3 w-20 bg-slate-100" />
      </div>
    </div>
  )
}

export default function ClassifyPage({ onDisclaimer, initialDescription = '' }) {
  const [description, setDescription] = useState(initialDescription)
  const [results, setResults] = useState(null)
  const [queryId, setQueryId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialDescription) setDescription(initialDescription)
  }, [initialDescription])

  async function submit(event) {
    event.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError('')
    setResults(null)

    try {
      const result = await classifyDescription(description.trim())
      setResults(result.ranked || [])
      setQueryId(result.query_id || null)
      if (result.disclaimer) onDisclaimer(result.disclaimer)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="max-w-3xl">
        <div className="flex items-center gap-2 text-primary">
          <ScanSearch size={18} />
          <p className="eyebrow !text-primary">Classification workspace</p>
        </div>
        <h1 className="display-heading mt-4 text-4xl font-medium leading-[1.08] text-ink sm:text-5xl">
          Classify with a clearer starting point.
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-ink-muted">
          Describe the item as it appears on an invoice. HSNMatch returns the strongest classifications with a concise rationale.
        </p>
      </div>

      <form onSubmit={submit} className="mt-9 rounded-lg border border-border bg-surface p-3 shadow-sm">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={800}
          rows={3}
          placeholder="Describe a product or service — material, function, and category help."
          className="block w-full resize-none border-0 bg-transparent p-2 leading-6 outline-none placeholder:text-ink-muted/70"
        />
        <div className="mt-2 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-ink-muted">{description.length} / 800</span>
          <button disabled={loading || !description.trim()} className="primary-button inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:opacity-45">
            {loading ? (
              <>
                <span className="spinner h-3.5 w-3.5 rounded-full border-2 border-white/35 border-t-white" />
                Matching…
              </>
            ) : (
              <>
                Match classification <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-7 space-y-3" aria-live="polite">
        {loading && [1, 2, 3].map((item) => <SkeletonCard key={item} />)}
        {error && (
          <StatusMessage tone="error">
            <span><strong>Classification service is unavailable.</strong> {error}</span>
          </StatusMessage>
        )}
        {!loading && !error && results?.length === 0 && (
          <StatusMessage>
            <span>Try adding more product detail — material, function, or category.</span>
          </StatusMessage>
        )}
        {results?.map((result, index) => (
          <ResultCard key={`${result.code}-${index}`} result={result} rank={index + 1} isUnranked={isUnranked(result)} queryId={queryId} />
        ))}
      </div>
    </section>
  )
}
