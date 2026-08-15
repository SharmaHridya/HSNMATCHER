import { ArrowRight } from 'lucide-react'

export default function Hero({ onClassify }) {
  return (
    <section className="relative isolate overflow-hidden bg-primary">
      <div className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-3xl rounded-[28px] border border-white/15 bg-primary/75 p-7 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent-2">HSNMatch / Clearer classification</p>
          <h1 className="display-heading mt-5 text-5xl font-medium leading-[.98] text-white sm:text-7xl">
            Resolve every line item with confidence.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-7 text-white/70">
            Describe the product. HSNMatch turns fuzzy invoice language into defensible HSN recommendations.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              onClassify(event.currentTarget.description.value)
            }}
            className="mt-8 flex rounded-xl border border-white/15 bg-white/10 p-2"
          >
            <input
              name="description"
              required
              placeholder="Try: stainless steel kitchen sink"
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-white/50"
            />
            <button type="submit" className="primary-button inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white">
              Classify <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>
      <div className="relative overflow-hidden bg-canvas-sage px-5 py-16 text-ink sm:px-8 sm:py-20">
        <div className="section-ambient ambient-sage pointer-events-none" />
        <div className="relative mx-auto max-w-6xl">
          <p className="eyebrow !text-accent">Built for better review</p>
          <h2 className="display-heading mt-3 max-w-2xl text-3xl font-medium sm:text-4xl">A clearer path from invoice language to a defensible code.</h2>
        </div>
      </div>
      <div className="relative overflow-hidden bg-canvas-sand px-5 py-16 text-ink sm:px-8 sm:py-20">
        <div className="section-ambient ambient-sand pointer-events-none" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow !text-accent-2">Ready when you are</p><h2 className="display-heading mt-3 text-3xl font-medium sm:text-4xl">Start with one line item.</h2></div>
          <button onClick={() => onClassify('')} className="primary-button inline-flex w-fit items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-white">Open classifier <ArrowRight size={16} /></button>
        </div>
      </div>
    </section>
  )
}
