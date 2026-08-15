import { useMemo } from 'react'

/**
 * Cielo nocturno realista: campo de estrellas con distribución aleatoria real,
 * tamaños y colores variados, parpadeo desincronizado, algunas estrellas
 * brillantes con destellos de difracción, y un lavado de nebulosa al fondo.
 *
 * Usa un generador pseudoaleatorio con semilla para que el cielo sea estable
 * entre renderizados pero no forme patrones visibles (el problema de usar
 * progresiones aritméticas como `i * 137.5 % 100`).
 */

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Colores estelares reales: la mayoría blancas y blanco-azuladas. */
const STAR_COLORS = [
  { c: '#FFFFFF', w: 46 },
  { c: '#DDE6FF', w: 24 }, // blanco azulado
  { c: '#BFD2FF', w: 10 }, // azul
  { c: '#FFF1D6', w: 12 }, // blanco cálido
  { c: '#FFD9A8', w: 8 }, // ámbar
]

function pickColor(r: number): string {
  const total = STAR_COLORS.reduce((s, x) => s + x.w, 0)
  let acc = r * total
  for (const s of STAR_COLORS) {
    acc -= s.w
    if (acc <= 0) return s.c
  }
  return '#FFFFFF'
}

interface Star {
  x: number
  y: number
  size: number
  color: string
  opacity: number
  dur: number
  delay: number
}

interface BrightStar extends Star {
  spike: number
}

interface NightSkyProps {
  /** cantidad de estrellas tenues del fondo */
  count?: number
  /** cantidad de estrellas brillantes con destello */
  brightCount?: number
  /** semilla — cambiarla genera un cielo distinto */
  seed?: number
  /** manchas de nebulosa al fondo */
  nebula?: boolean
  className?: string
}

export default function NightSky({
  count = 130,
  brightCount = 7,
  seed = 7,
  nebula = true,
  className = '',
}: NightSkyProps) {
  const { stars, bright } = useMemo(() => {
    const rand = mulberry32(seed)

    const stars: Star[] = Array.from({ length: count }, () => {
      const roll = rand()
      // Distribución realista: muchísimas diminutas, pocas medianas.
      const size = roll < 0.68 ? 1 : roll < 0.9 ? 1.5 : 2
      return {
        x: rand() * 100,
        y: rand() * 100,
        size,
        color: pickColor(rand()),
        opacity: 0.18 + rand() * 0.5,
        dur: 2.8 + rand() * 5.5,
        delay: rand() * 8,
      }
    })

    const bright: BrightStar[] = Array.from({ length: brightCount }, () => ({
      x: 6 + rand() * 88,
      y: 6 + rand() * 88,
      size: 2.5 + rand() * 1.5,
      color: pickColor(rand()),
      opacity: 0.7 + rand() * 0.3,
      dur: 4 + rand() * 4,
      delay: rand() * 6,
      spike: 14 + rand() * 16,
    }))

    return { stars, bright }
  }, [count, brightCount, seed])

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Nebulosas: dan profundidad al cielo en vez de un fondo plano */}
      {nebula && (
        <>
          <div
            className="absolute rounded-full"
            style={{
              width: '58%',
              height: '70%',
              left: '-8%',
              top: '-14%',
              background:
                'radial-gradient(circle, rgba(91,44,130,0.30) 0%, rgba(91,44,130,0) 68%)',
              filter: 'blur(46px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '52%',
              height: '62%',
              right: '-6%',
              bottom: '-10%',
              background:
                'radial-gradient(circle, rgba(63,73,166,0.26) 0%, rgba(63,73,166,0) 68%)',
              filter: 'blur(52px)',
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: '34%',
              height: '34%',
              left: '38%',
              top: '46%',
              background:
                'radial-gradient(circle, rgba(201,168,76,0.10) 0%, rgba(201,168,76,0) 70%)',
              filter: 'blur(40px)',
            }}
          />
          {/* Banda tenue tipo vía láctea */}
          <div
            className="absolute"
            style={{
              width: '160%',
              height: '30%',
              left: '-30%',
              top: '28%',
              transform: 'rotate(-14deg)',
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(220,230,255,0.05) 45%, rgba(255,255,255,0) 100%)',
              filter: 'blur(26px)',
            }}
          />
        </>
      )}

      {/* Campo de estrellas */}
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full star-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: s.color,
            opacity: s.opacity,
            boxShadow: s.size >= 1.5 ? `0 0 ${s.size * 2.4}px ${s.color}` : undefined,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}

      {/* Estrellas brillantes con destello de difracción */}
      {bright.map((s, i) => (
        <span
          key={`b${i}`}
          className="absolute star-twinkle"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 0,
            height: 0,
            opacity: s.opacity,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {/* núcleo */}
          <span
            className="absolute rounded-full"
            style={{
              width: s.size,
              height: s.size,
              marginLeft: -s.size / 2,
              marginTop: -s.size / 2,
              background: s.color,
              boxShadow: `0 0 ${s.size * 3}px ${s.color}, 0 0 ${s.size * 7}px ${s.color}80`,
            }}
          />
          {/* destello horizontal */}
          <span
            className="absolute"
            style={{
              width: s.spike,
              height: 1,
              marginLeft: -s.spike / 2,
              background: `linear-gradient(to right, transparent, ${s.color}, transparent)`,
              opacity: 0.55,
            }}
          />
          {/* destello vertical */}
          <span
            className="absolute"
            style={{
              width: 1,
              height: s.spike,
              marginTop: -s.spike / 2,
              background: `linear-gradient(to bottom, transparent, ${s.color}, transparent)`,
              opacity: 0.55,
            }}
          />
        </span>
      ))}
    </div>
  )
}
