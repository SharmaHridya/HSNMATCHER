import { useState } from 'react'
import { lookupHsn } from '../api/hsn'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusMessage from '../components/StatusMessage'

export default function LookupPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      setResult(await lookupHsn(code.trim()))
    } catch (requestError) {
      setError(requestError.message.includes('not found') ? 'No HSN/SAC code was found for that value.' : requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="eyebrow">Direct reference</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Look up a known HSN or SAC code.</h1>
      <p className="mt-5 text-base leading-7 text-slate-600">Retrieve the description and GST rate registered against a code.</p>
      <form onSubmit={handleSubmit} className="mt-9 rounded-2xl border border-sage-200 bg-white p-4 shadow-card sm:p-5">
        <label htmlFor="code" className="text-sm font-bold text-ink">HSN / SAC code</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input id="code" inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. 7324" className="min-w-0 flex-1 rounded-xl border border-sage-300 bg-stone-50 px-4 py-3 font-mono text-ink outline-none placeholder:font-sans placeholder:text-slate-400 focus:border-mint-600 focus:ring-4 focus:ring-mint-100" />
          <button disabled={loading || !code.trim()} className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45">{loading ? 'Looking up…' : 'Look up code'}</button>
        </div>
      </form>
      <div className="mt-7" aria-live="polite">
        {loading && (
          <div className="rounded-2xl border border-sage-200 bg-white p-5 shadow-card">
            <LoadingSpinner label="Looking up the requested code…" />
          </div>
        )}
        {error && <StatusMessage tone="error"><strong>Lookup unavailable.</strong> {error}</StatusMessage>}
        {result && (
          <article className="rounded-2xl border border-mint-300 bg-white p-6 shadow-card">
            <p className="eyebrow">Matched code</p>
            <h2 className="mt-2 font-mono text-3xl font-bold text-ink">{result.code}</h2>
            <p className="mt-5 text-base leading-7 text-slate-700">{result.description}</p>
            <div className="mt-6 border-t border-stone-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-sage-500">GST rate</p>
              <p className="mt-1 text-xl font-bold text-ink">{result.gst_rate ?? 'Not provided'}</p>
            </div>
          </article>
        )}
      </div>
    </section>
  )
}
