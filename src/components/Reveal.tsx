import type { ElementType, ReactNode } from 'react'
import { useScrollReveal } from '../hooks/useScrollReveal'

interface RevealProps {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  style?: React.CSSProperties
}

/** Wraps children in a scroll-reveal container (fade + rise on enter). */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  style,
}: RevealProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  )
}
