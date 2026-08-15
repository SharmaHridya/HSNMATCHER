import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const naturalEase = [0.22, 1, 0.36, 1]

export default function HsnCode({ value, className = '', animate = true, delay = 0.15 }) {
  const reduced = useReducedMotion()
  const clean = String(value || '').replace(/\D/g, '')
  const [display, setDisplay] = useState(clean)

  useEffect(() => {
    if (!animate || reduced) {
      setDisplay(clean)
      return undefined
    }

    let timers = []
    const timer = setTimeout(() => {
      setDisplay(clean.split('').map(() => Math.floor(Math.random() * 10)).join(''))
      timers = clean.split('').map((_, index) =>
        setTimeout(() => {
          setDisplay((current) => {
            const chars = current.split('')
            chars[index] = clean[index]
            return chars.join('')
          })
        }, 40 + index * 60)
      )
    }, delay * 1000)

    return () => {
      clearTimeout(timer)
      timers.forEach(clearTimeout)
    }
  }, [clean, animate, reduced, delay])

  const groups = (display.match(/.{1,2}/g) || [String(value || '—')])

  return (
    <span aria-label={`HSN code ${clean || value || 'not available'}`} className={`relative inline-flex overflow-hidden rounded-lg border border-border bg-surface font-mono text-sm font-medium tracking-tight ${className}`}>
      <motion.i
        aria-hidden
        className="pointer-events-none absolute inset-y-0 z-10 w-px bg-primary"
        initial={{ x: '-2px', opacity: 0 }}
        animate={{ x: animate && !reduced ? 'calc(100% + 2px)' : '-2px', opacity: animate && !reduced ? [0, 1, 1, 0] : 0 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: 'linear' }}
      />
      {groups.map((group, index) => (
        <span key={index} className={`px-2 py-1 ${index === 0 ? 'bg-accent/10 text-ink' : 'text-ink'} ${index ? 'border-l border-border' : ''}`}>
          {group}
        </span>
      ))}
    </span>
  )
}
