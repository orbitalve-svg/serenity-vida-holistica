import { useEffect, useMemo, useRef } from 'react'

interface CrystalOrbProps {
  size?: number
  /** número de meridianos (anillos verticales) */
  meridians?: number
  className?: string
}

/**
 * Orbe de cuarzo: una esfera armilar construida con anillos en 3D real
 * (meridianos + paralelos). Gira de forma continua y se inclina siguiendo el
 * cursor. Sólo CSS 3D — sin librerías.
 */
export default function CrystalOrb({
  size = 240,
  meridians = 9,
  className = '',
}: CrystalOrbProps) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | undefined>(undefined)

  const meridianAngles = useMemo(
    () => Array.from({ length: meridians }, (_, i) => (180 / meridians) * i),
    [meridians],
  )

  // Paralelos: anillos horizontales a distintas alturas de la esfera.
  const parallels = useMemo(() => {
    const out: { scale: number; y: number }[] = []
    const steps = 5
    for (let i = 1; i < steps; i++) {
      const t = i / steps // 0 … 1
      const angle = t * Math.PI // 0 … π
      out.push({ scale: Math.sin(angle), y: -Math.cos(angle) })
    }
    return out
  }, [])

  // Inclinación suave siguiendo el cursor sobre toda la sección.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const host = scene.closest('section') ?? document.body

    const onMove = (e: MouseEvent) => {
      const rect = host.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      if (frame.current) cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        scene.style.transform = `rotateX(${(-py * 22).toFixed(2)}deg) rotateY(${(px * 26).toFixed(2)}deg)`
      })
    }

    host.addEventListener('mousemove', onMove)
    return () => {
      host.removeEventListener('mousemove', onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  const r = size / 2

  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size, perspective: size * 3 }}
      aria-hidden="true"
    >
      {/* Resplandor exterior */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -size * 0.18,
          background:
            'radial-gradient(circle, rgba(155,93,229,0.34) 0%, rgba(201,168,76,0.14) 42%, transparent 70%)',
          filter: 'blur(18px)',
        }}
      />

      {/* Escena inclinable */}
      <div
        ref={sceneRef}
        className="absolute inset-0 transition-transform duration-500 ease-out"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Giro continuo */}
        <div
          className="absolute inset-0 orb-spin"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Meridianos */}
          {meridianAngles.map((a, i) => (
            <div
              key={`m${i}`}
              className="absolute inset-0 rounded-full"
              style={{
                transform: `rotateY(${a}deg)`,
                border: `1px solid ${i % 2 === 0 ? 'rgba(232,169,60,0.5)' : 'rgba(185,139,232,0.45)'}`,
                boxShadow: `0 0 12px ${i % 2 === 0 ? 'rgba(232,169,60,0.25)' : 'rgba(185,139,232,0.22)'}`,
              }}
            />
          ))}

          {/* Paralelos */}
          {parallels.map((p, i) => (
            <div
              key={`p${i}`}
              className="absolute rounded-full"
              style={{
                left: '50%',
                top: '50%',
                width: size * p.scale,
                height: size * p.scale,
                marginLeft: (-size * p.scale) / 2,
                marginTop: (-size * p.scale) / 2,
                transform: `translateY(${(p.y * r).toFixed(1)}px) rotateX(90deg)`,
                border: '1px solid rgba(251,246,236,0.28)',
              }}
            />
          ))}

          {/* Núcleo de luz */}
          <div
            className="absolute rounded-full"
            style={{
              inset: '38%',
              background:
                'radial-gradient(circle at 35% 32%, #FBF6EC 0%, #E8A93C 38%, #9B5DE5 78%, transparent 100%)',
              boxShadow: '0 0 40px 10px rgba(232,169,60,0.35)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
