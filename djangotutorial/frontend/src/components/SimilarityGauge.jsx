import { motion, useReducedMotion } from 'framer-motion'

const naturalEase = [0.22, 1, 0.36, 1]

export default function SimilarityGauge({ score, delay = 0.5 }) {
  const reduce = useReducedMotion()
  const value = Math.max(0, Math.min(1, Number(score) || 0))
  const r = 17
  const c = 2 * Math.PI * r

  return (
    <div className="relative grid h-12 w-12 place-items-center" aria-label={`${Math.round(value * 100)}% similarity`}>
      <svg viewBox="0 0 40 40" className="h-12 w-12 -rotate-90" aria-hidden="true">
        <circle cx="20" cy="20" r={r} fill="none" stroke="#E7E9E4" strokeWidth="3" />
        <motion.circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="#4F7869"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ strokeDasharray: c, strokeDashoffset: c, stroke: '#4F7869' }}
          animate={{ strokeDashoffset: c * (1 - value), stroke: 'var(--color-primary)' }}
          transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : delay, ease: naturalEase }}
        />
      </svg>
      <motion.span
        className="absolute font-mono text-[9px] font-semibold text-ink"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.2, delay: reduce ? 0 : delay }}
      >
        {Math.round(value * 100)}%
      </motion.span>
    </div>
  )
}
