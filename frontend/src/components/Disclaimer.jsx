const DEFAULT_DISCLAIMER = 'Classification results are suggestions only and are not filing-ready legal determinations. Verify the applicable HSN/SAC code and GST rate before filing.'

export default function Disclaimer({ text }) {
  return (
    <footer className="border-t border-white/10 bg-ink px-5 py-4 text-center text-xs leading-5 text-sage-200 sm:px-8">
      <span className="mr-2 font-semibold uppercase tracking-[0.16em] text-mint-300">Important</span>
      {text || DEFAULT_DISCLAIMER}
    </footer>
  )
}
