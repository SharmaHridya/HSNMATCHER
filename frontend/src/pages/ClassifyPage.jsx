import { useState } from 'react'
import { classifyDescription } from '../api/hsn'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ResultCard from '../components/ResultCard'
import StatusMessage from '../components/StatusMessage'

function isUnrankedResult(result) {
  return String(result?.confidence || '').trim().toLowerCase() === 'unranked'
}

export default function ClassifyPage({ onDisclaimer }) {
  const [description, setDescription] = useState('')
  const [results, setResults] = useState(null)
  const [queryId, setQueryId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!description.trim()) return

    setLoading(true)
    setError('')
    setResults(null)
    setQueryId(null)

    try {
      const response = await classifyDescription(description.trim())
      const responseResults = response.ranked || []
      setResults(responseResults)
      setQueryId(response.query_id || null)
      if (response.disclaimer) onDisclaimer(response.disclaimer)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const unranked = results?.some((result) => isUnrankedResult(result))

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow">GST classification assistant</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Find a defensible starting point for your HSN/SAC classification.</h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">HSNMatch combines semantic vector search with an LLM review, so each suggestion comes with its confidence and rationale.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-9 rounded-2xl border border-sage-200 bg-white p-4 shadow-card sm:p-5">
        <label htmlFor="description" className="text-sm font-bold text-ink">Product or service description</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Stainless steel kitchen sink" className="min-w-0 flex-1 rounded-xl border border-sage-300 bg-stone-50 px-4 py-3 text-ink outline-none placeholder:text-slate-400 focus:border-mint-600 focus:ring-4 focus:ring-mint-100" />
          <button disabled={loading || !description.trim()} className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45">{loading ? 'Classifying…' : 'Classify'}</button>
        </div>
      </form>
      <div className="mt-7 space-y-4" aria-live="polite">
        {loading && (
          <div className="rounded-2xl border border-sage-200 bg-white p-5 shadow-card">
            <LoadingSpinner label="Searching the HSN index and reviewing the closest matches…" />
          </div>
        )}
        {error && <StatusMessage tone="error"><strong>Classification unavailable.</strong> {error}</StatusMessage>}
        {!loading && !error && results && results.length === 0 && (
          <EmptyState title="No matches found" description="No matching codes were returned. Try a more specific product or service description." />
        )}
        {unranked && <StatusMessage><strong>LLM review unavailable.</strong> Explanation unavailable. Displaying similarity-search results only.</StatusMessage>}
        {results?.map((result, index) => (
          <ResultCard key={`${result.code}-${index}`} result={result} rank={index + 1} queryId={queryId} isUnranked={isUnrankedResult(result)} />
        ))}
      </div>
    </section>
  )
}
