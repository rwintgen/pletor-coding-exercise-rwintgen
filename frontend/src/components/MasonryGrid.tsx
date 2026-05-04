import { Children, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { transitions } from '../theme'

const GAP = 24

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

/**
 * Absolute-positioned masonry grid (Pinterest-style).
 * Measures each child's height via ResizeObserver, then places every item
 * in the shortest column. Guarantees left-to-right reading order with
 * true variable-height masonry.
 */
export function MasonryGrid({ children }: MasonryGridProps) {
  const items = Children.toArray(children)
  const cols = useColumnCount()
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map())
  const [positions, setPositions] = useState<{ x: number; y: number; width: number }[]>([])
  const [containerHeight, setContainerHeight] = useState(0)

  const layout = useCallback(() => {
    const container = containerRef.current
    if (!container || items.length === 0) return

    const containerWidth = container.offsetWidth
    const colWidth = (containerWidth - GAP * (cols - 1)) / cols
    const colHeights = new Array(cols).fill(0) as number[]
    const newPositions: { x: number; y: number; width: number }[] = []

    for (let i = 0; i < items.length; i++) {
      // Find shortest column
      let minCol = 0
      for (let c = 1; c < cols; c++) {
        if (colHeights[c] < colHeights[minCol]) minCol = c
      }
      const x = minCol * (colWidth + GAP)
      const y = colHeights[minCol]
      newPositions.push({ x, y, width: colWidth })

      // Use measured height or estimate
      const el = itemRefs.current.get(i)
      const h = el ? el.offsetHeight : colWidth * 0.75
      colHeights[minCol] += h + GAP
    }

    setPositions(newPositions)
    setContainerHeight(Math.max(...colHeights) - GAP)
  }, [items.length, cols])

  // Layout on mount and when items/cols change
  useEffect(() => { layout() }, [layout])

  // Re-layout when container resizes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver(() => layout())
    ro.observe(container)
    return () => ro.disconnect()
  }, [layout])

  // Observe individual items for height changes (image loads, etc.)
  useEffect(() => {
    const ro = new ResizeObserver(() => layout())
    for (const el of itemRefs.current.values()) ro.observe(el)
    return () => ro.disconnect()
  }, [layout, items.length])

  return (
    <div
      ref={containerRef}
      className="stagger-fade"
      style={{ position: 'relative', height: containerHeight || undefined }}
    >
      {items.map((child, i) => (
        <div
          key={i}
          ref={(el) => {
            if (el) itemRefs.current.set(i, el)
            else itemRefs.current.delete(i)
          }}
          style={{
            position: 'absolute',
            left: positions[i]?.x ?? 0,
            top: positions[i]?.y ?? 0,
            width: positions[i]?.width ?? '100%',
            transition: `left ${transitions.normal}, top ${transitions.normal}, width ${transitions.normal}`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
