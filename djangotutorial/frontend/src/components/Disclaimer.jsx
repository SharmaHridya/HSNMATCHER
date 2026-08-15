import { Info } from 'lucide-react'
const DEFAULT_DISCLAIMER = 'Classification results are suggestions only. Verify the applicable HSN/SAC code and GST rate before filing.'
export default function Disclaimer({ text }) { return <footer className="border-t border-border bg-white px-5 py-3 text-center text-xs text-ink-muted sm:px-8"><Info size={14} strokeWidth={1.6} className="mr-1 inline align-text-bottom" />{text || DEFAULT_DISCLAIMER}</footer> }
