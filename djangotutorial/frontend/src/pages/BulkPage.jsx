import { useState } from 'react'
import { CheckCircle2, FileSpreadsheet, TriangleAlert } from 'lucide-react'
import { classifyBulk } from '../api/hsn'
import FileUpload from '../components/FileUpload'
import StatusMessage from '../components/StatusMessage'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function BulkPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [rows, setRows] = useState(0)
  const [processed, setProcessed] = useState(0)

  async function select(next) {
    setFile(next)
    setDone(false)
    setProcessed(0)

    if (next) {
      const text = await next.text()
      setRows(Math.max(0, text.trim().split(/\r?\n/).length - 1))
    } else {
      setRows(0)
    }
  }

  async function upload() {
    if (!file) return

    setLoading(true)
    setError('')
    setDone(false)
    setProcessed(0)

    try {
      const result = await classifyBulk(file)
      setProcessed(rows)
      downloadBlob(result.blob, result.filename)
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="flex items-center gap-2 text-primary">
        <FileSpreadsheet size={18} />
        <p className="eyebrow !text-primary">Bulk classification</p>
      </div>

      <h1 className="display-heading mt-4 text-4xl font-medium text-ink sm:text-5xl">
        Classify a file, flag what needs review.
      </h1>
      <p className="mt-5 max-w-2xl leading-7 text-ink-muted">
        Upload your CSV and receive a classified export for review.
      </p>

      <div className="mt-9 rounded-lg border border-border bg-surface p-4 sm:p-6">
        <FileUpload accept=".csv,text/csv" onFileSelect={select} disabled={loading} />

        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-ink-muted">{file ? file.name : 'No file selected.'}</p>
          <button disabled={loading || !file} onClick={upload} className="primary-button rounded-md px-4 py-2.5 text-sm font-medium text-white disabled:opacity-45">
            {loading ? 'Processing…' : 'Upload and classify'}
          </button>
        </div>

        {(loading || done) && (
          <div className="mt-6 rounded-md border border-border bg-canvas p-4">
            <div className="flex justify-between text-xs text-ink-muted">
              <span>Classifying rows</span>
              <span>{processed} / {rows} rows</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${rows ? (processed / rows) * 100 : 0}%` }}
              />
            </div>

            {done && (
              <div className="mt-4 flex items-center gap-3 rounded-md bg-confidence-high-bg p-3 text-confidence-high-fg">
                <CheckCircle2 size={18} />
                <div>
                  <p className="text-sm font-medium">Bulk classification complete</p>
                  <p className="text-xs opacity-80">{processed} rows processed and export ready.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4">
            <StatusMessage tone="error">
              <span><strong>Bulk classification failed.</strong> {error}</span>
            </StatusMessage>
          </div>
        )}

        {!loading && !error && !done && file && rows === 0 && (
          <div className="mt-4">
            <StatusMessage>
              <span><TriangleAlert size={14} className="mr-2 inline" />No rows detected in the uploaded CSV.</span>
            </StatusMessage>
          </div>
        )}
      </div>
    </section>
  )
}
