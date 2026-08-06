import { useState } from 'react'
import { classifyBulk } from '../api/hsn'
import FileUpload from '../components/FileUpload'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusMessage from '../components/StatusMessage'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function BulkPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reviewNeeded, setReviewNeeded] = useState(false)

  async function handleUpload() {
    if (!file) return

    setLoading(true)
    setError('')
    setMessage('')
    setReviewNeeded(false)

    try {
      const response = await classifyBulk(file)
      downloadBlob(response.blob, response.filename)
      setMessage('Classification complete. Your CSV download has started.')
      setReviewNeeded(false)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="max-w-3xl">
        <p className="eyebrow">Bulk workflow</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-ink sm:text-5xl">Upload a CSV and receive a classified download.</h1>
        <p className="mt-5 text-base leading-7 text-slate-600">This uses the existing bulk classification endpoint and returns a CSV you can review or share with your team.</p>
      </div>
      <div className="mt-9 rounded-2xl border border-sage-200 bg-white p-4 shadow-card sm:p-5">
        <FileUpload
          label="CSV upload"
          accept=".csv,text/csv"
          disabled={loading}
          helpText="The file should include a description column for best results."
          onFileSelect={setFile}
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{file ? `Selected file: ${file.name}` : 'No file selected yet.'}</p>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || !file}
            className="rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {loading ? 'Processing CSV…' : 'Upload and classify'}
          </button>
        </div>
        <div className="mt-6 space-y-3" aria-live="polite">
          {loading && (
            <div className="rounded-2xl border border-sage-200 bg-sage-50 p-4">
              <LoadingSpinner label="Processing CSV…" />
            </div>
          )}
          {message ? <StatusMessage>{message}</StatusMessage> : null}
          {reviewNeeded ? <StatusMessage tone="error">Some rows were flagged and may need manual review before you use the download.</StatusMessage> : null}
          {error ? <StatusMessage tone="error"><strong>Upload failed.</strong> {error}</StatusMessage> : null}
        </div>
      </div>
    </section>
  )
}
