import { useState } from 'react'
import { CircleAlert } from 'lucide-react'
import HsnCode from './HsnCode'
import ConfidenceBadge from './ConfidenceBadge'
import SimilarityGauge from './SimilarityGauge'
import CorrectionForm from './CorrectionForm'
import { motion, useReducedMotion } from 'framer-motion'

const naturalEase = [0.22, 1, 0.36, 1]
const confidenceSurfaces = {
  high: { wash: '#F1F7F3', hover: '#E7F0E9' },
  medium: { wash: '#FBF3E7', hover: '#F5E8D5' },
  low: { wash: '#FBEDEB', hover: '#F6DFDB' },
  unranked: { wash: '#F2F2EF', hover: '#E9E9E4' },
}

export default function ResultCard({ result, rank, isUnranked, queryId }) {
  const [showCorrection, setShowCorrection] = useState(false)
  const confidence = isUnranked
  ? 'unranked'
  : (result.confidence || 'unranked').toLowerCase()
  const reduce = useReducedMotion()

  return (
    <motion.article
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : (rank - 1) * 0.04, ease: naturalEase }}
      whileHover={reduce ? {} : { y: -2 }}
      style={{ '--card-wash': confidenceSurfaces[confidence].wash, '--card-hover-wash': confidenceSurfaces[confidence].hover }}
      className="confidence-card relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">{isUnranked ? `Similarity match ${rank}` : `Recommendation ${rank}`}</p>
          <HsnCode value={result.code} delay={0.15} />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduce ? 0 : 0.2, ease: naturalEase }}
          className="shrink-0"
        >
          <ConfidenceBadge confidence={confidence} />
        </motion.div>
      </div>

      <p className="mt-4 leading-6 text-ink">{result.description}</p>

      <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
        <div>
          <p className="eyebrow">GST rate</p>
          <p className="mt-1 font-mono text-lg font-medium text-primary">{result.gst_rate ?? '—'}</p>
        </div>
        {!isUnranked && <SimilarityGauge score={result.similarity ?? result.score ?? (confidence === 'high' ? 0.92 : confidence === 'medium' ? 0.73 : 0.54)} delay={0.5} />}
      </div>

      <div className={`mt-4 border-t border-border pt-4 ${isUnranked ? 'flex items-center gap-2 text-ink-muted' : ''}`}>
        {isUnranked ? (
          <>
            <CircleAlert size={16} strokeWidth={1.6} />
            <p className="text-sm">Explanation unavailable — this is a similarity-only result.</p>
          </>
        ) : (
          <>
            <p className="eyebrow">Reasoning</p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{result.reason || 'No reasoning was returned for this recommendation.'}</p>
          </>
        )}
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <button type="button" onClick={() => setShowCorrection(!showCorrection)} className="text-sm text-ink-muted transition-colors duration-150 hover:text-accent">
          {showCorrection ? 'Hide correction form' : 'Suggest a correction'}
        </button>
        {showCorrection && <CorrectionForm queryId={queryId} resultCode={result.code} />}
      </div>
    </motion.article>
  )
}
