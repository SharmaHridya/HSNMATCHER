import { useRef } from 'react'

export default function FileUpload({ label, accept, onFileSelect, disabled, helpText }) {
  const inputRef = useRef(null)

  return (
    <div className="rounded-2xl border border-dashed border-sage-300 bg-stone-50 p-4">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-transparent px-4 py-6 text-center transition hover:border-sage-300 hover:bg-white">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(event) => onFileSelect(event.target.files?.[0] || null)}
          disabled={disabled}
        />
        <div className="rounded-full bg-sage-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-sage-700">{label}</div>
        <div>
          <p className="text-sm font-semibold text-ink">Choose a CSV file</p>
          <p className="mt-1 text-sm text-slate-600">{helpText}</p>
        </div>
      </label>
    </div>
  )
}
