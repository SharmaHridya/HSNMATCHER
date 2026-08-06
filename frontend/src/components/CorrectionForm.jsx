import { useState } from 'react'
import { submitCorrection } from '../api/hsn'

export default function CorrectionForm({ queryId, resultCode, onSuccess }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    if (!code.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await submitCorrection(queryId, code.trim())
      setSuccess(`Thanks — the correction for ${resultCode} was recorded.`)
      setCode('')
      onSuccess?.()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 rounded-2xl border border-sage-200 bg-sage-50 p-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={`correction-${queryId}`} className="text-sm font-semibold text-ink">Correct HSN code</label>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-500">Correction</span>
      </div>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id={`correction-${queryId}`}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="e.g. 3926"
          className="min-w-0 flex-1 rounded-xl border border-sage-300 bg-white px-4 py-3 text-ink outline-none placeholder:text-slate-400 focus:border-mint-600 focus:ring-4 focus:ring-mint-100"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-xl bg-ink px-4 py-3 font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {loading ? 'Submitting…' : 'Submit correction'}
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
      {success ? <p className="mt-3 text-sm font-semibold text-sage-700">{success}</p> : null}
    </form>
  )
}
