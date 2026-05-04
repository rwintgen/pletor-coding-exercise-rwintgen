import { Children, ReactNode, useEffect, useMemo, useState } from 'react'

const BREAKPOINTS = [
  { query: '(max-width: 560px)', cols: 1 },
  { query: '(max-width: 880px)', cols: 2 },
  { query: '(max-width: 1280px)', cols: 3 },
] as const
const DEFAULT_COLS = 4

function useColumnCount() {
  const [cols, setCols] = useState(() => {
    for (const bp of BREAKPOINTS) {
      if (window.matchMedia(bp.query).matches) return bp.cols
    }
    return DEFAULT_COLS
  })

  useEffect(() => {
    const update = () => {
      for (const bp of BREAKPOINTS) {
        if (window.matchMedia(bp.query).matches) { setCols(bp.cols); return }
      }
      setCols(DEFAULT_COLS)
    }
    const mqls = BREAKPOINTS.map((bp) => {
      const mql = window.matchMedia(bp.query)
      mql.addEventListener('change', update)
      return mql
    })
    return () => { for (const mql of mqls) mql.removeEventListener('change', update) }
  }, [])

  return cols
}

interface MasonryGridProps {
  children: ReactNode
}

/** Flex-column masonry with round-robin distribution — reads left-to-right. */
export function MasonryGrid({ children }: MasonryGridProps) {
  const items = Children.toArray(children)
  const cols = useColumnCount()

  const columns = useMemo(() => {
    const buckets: ReactNode[][] = Array.from({ length: cols }, () => [])
    items.forEach((child, i) => buckets[i % cols].push(child))
    return buckets
  }, [items, cols])

  return (
    <div className="stagger-fade" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {columns.map((colChildren, colIdx) => (
        <div key={colIdx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {colChildren}
        </div>
      ))}
    </div>
  )
}
