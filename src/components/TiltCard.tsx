import { useRef, type ReactNode, type HTMLAttributes } from 'react'

interface TiltCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** clases de la tarjeta interior (la que se inclina) */
  className?: string
  /** grados máximos de inclinación */
  max?: number
  /** opacidad del destello (0 = sin brillo) */
  glare?: number
}

/**
 * Tarjeta con inclinación 3D siguiendo el cursor y un destello dorado que
 * barre la superficie. El movimiento se escribe directo en el DOM vía refs
 * (sin estado) para no re-renderizar el árbol en cada movimiento del mouse.
 *
 * Los hijos pueden usar `style={{ transform: 'translateZ(Npx)' }}` para
 * flotar por encima de la superficie de la tarjeta.
 */
export default function TiltCard({
  children,
  className = '',
  max = 9,
  glare = 0.5,
  ...rest
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const glareRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | undefined>(undefined)

  const prefersReduced = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function handleEnter() {
    if (prefersReduced()) return
    // Sin transición mientras el cursor está encima: el seguimiento debe ser inmediato.
    if (cardRef.current) cardRef.current.style.transition = 'none'
  }

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReduced()) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const ry = (px - 0.5) * 2 * max
      const rx = -(py - 0.5) * 2 * max
      card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(1.025)`

      const g = glareRef.current
      if (g && glare > 0) {
        g.style.opacity = String(glare)
        g.style.background = `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255,255,255,0.9) 0%, rgba(232,169,60,0.35) 32%, rgba(255,255,255,0) 62%)`
      }
    })
  }

  function handleLeave() {
    const card = cardRef.current
    if (frame.current) cancelAnimationFrame(frame.current)
    if (card) {
      // Restaura la transición del CSS para que el regreso sea suave.
      card.style.transition = ''
      card.style.transform = ''
    }
    if (glareRef.current) glareRef.current.style.opacity = '0'
  }

  return (
    <div className="tilt-wrap h-full">
      <div
        ref={cardRef}
        className={`tilt-card ${className}`}
        onMouseEnter={handleEnter}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        {...rest}
      >
        {children}
        {glare > 0 && (
          <div
            ref={glareRef}
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 mix-blend-soft-light"
            style={{ borderRadius: 'inherit' }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  )
}
