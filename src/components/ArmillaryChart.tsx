import { useEffect, useMemo, useRef, useState } from 'react'
import type { Chart } from '../lib/astro'
import { runWhileVisible } from '../lib/visibility'

/**
 * Carta astral como esfera armilar.
 *
 * En vez de inclinar un diagrama plano —que sigue leyéndose como un diagrama—
 * aquí la carta vive sobre anillos con volumen real: la banda del zodíaco es
 * un anillo grueso en el plano de la eclíptica, los meridianos la cruzan como
 * en un astrolabio, y cada planeta es un nodo que orbita a su longitud exacta.
 *
 * Todo con `preserve-3d` de CSS — el mismo patrón del orbe de Contacto, que es
 * volumen de verdad y no una proyección.
 */

const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']
/** Tinte por elemento: fuego, tierra, aire, agua (índice de signo % 4). */
const ELEMENT_TINT = ['#E8893C', '#5BB97A', '#5B6BD6', '#3FA7D6']

interface Props {
  chart: Chart
  size?: number
}

export default function ArmillaryChart({ chart, size = 360 }: Props) {
  const sceneRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState<string | null>(null)

  const R = size / 2

  /**
   * Longitud eclíptica → ángulo en el anillo.
   * El Ascendente se lleva al frente-izquierda, como en la carta tradicional.
   */
  const ref = chart.asc !== null ? chart.asc : 0
  const angleOf = (lon: number) => lon - ref + 180

  /**
   * Altura de cada planeta sobre el plano.
   *
   * Se reparte recorriendo los planetas **en orden de longitud**, no por su
   * índice en la lista: así dos que caigan casi en el mismo grado —Urano y
   * Neptuno, o el Sol y Venus— siempre reciben alturas distintas y no se
   * pisan al proyectarse.
   */
  const lifts = useMemo(() => {
    const LEVELS = [12, 34, 56]
    const sorted = [...chart.planets].sort((a, b) => a.lon - b.lon)
    const out = new Map<string, number>()
    sorted.forEach((p, i) => out.set(p.name, LEVELS[i % LEVELS.length]))
    return out
  }, [chart.planets])

  // Paralelos de la esfera (anillos horizontales a distintas alturas).
  const parallels = useMemo(() => {
    const out: { scale: number; y: number }[] = []
    for (let i = 1; i < 4; i++) {
      const t = i / 4
      const a = t * Math.PI
      out.push({ scale: Math.sin(a), y: -Math.cos(a) })
    }
    return out
  }, [])

  // Inclinación: sigue al puntero; sin puntero (móvil) ondula sola.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scene.style.transform = 'rotateX(-38deg) rotateY(0deg)'
      return
    }

    const host = scene.parentElement as HTMLElement
    const target = { rx: -38, ry: 0 }
    const cur = { rx: -38, ry: 0 }
    let lastPointer = 0
    const start = performance.now()

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      target.rx = -38 - py * 18
      target.ry = px * 34
      lastPointer = performance.now()
    }

    host.addEventListener('pointermove', onMove)
    // El bucle sólo corre con la esfera en pantalla.
    const stopLoop = runWhileVisible(host, (now) => {
      if (now - lastPointer > 2600) {
        const t = (now - start) / 1000
        target.rx = -38 + Math.sin(t * 0.33) * 7
        target.ry = Math.sin(t * 0.24) * 16
      }
      cur.rx += (target.rx - cur.rx) * 0.06
      cur.ry += (target.ry - cur.ry) * 0.06
      scene.style.transform = `rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`
    })
    return () => {
      host.removeEventListener('pointermove', onMove)
      stopLoop()
    }
  }, [])

  const ringStyle = (inset: number, color: string, w = 1) => ({
    position: 'absolute' as const,
    inset,
    borderRadius: '50%',
    border: `${w}px solid ${color}`,
  })

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, perspective: size * 2.6 }}
      role="img"
      aria-label="Carta astral en esfera armilar"
    >
      {/* Resplandor de fondo */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: -size * 0.14,
          background:
            'radial-gradient(circle, rgba(91,107,214,0.30) 0%, rgba(155,93,229,0.14) 45%, transparent 72%)',
          filter: 'blur(22px)',
        }}
        aria-hidden="true"
      />

      {/* Escena inclinable */}
      <div
        ref={sceneRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Meridianos: la jaula del astrolabio */}
        {[0, 45, 90, 135].map((a) => (
          <div
            key={`mer${a}`}
            className="absolute inset-[6%] rounded-full pointer-events-none"
            style={{
              transform: `rotateY(${a}deg)`,
              border: `1px solid ${a % 90 === 0 ? 'rgba(232,169,60,0.30)' : 'rgba(185,139,232,0.22)'}`,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Paralelos */}
        {parallels.map((p, i) => (
          <div
            key={`par${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              width: size * 0.88 * p.scale,
              height: size * 0.88 * p.scale,
              marginLeft: (-size * 0.88 * p.scale) / 2,
              marginTop: (-size * 0.88 * p.scale) / 2,
              transform: `translateY(${(p.y * R * 0.88).toFixed(1)}px) rotateX(90deg)`,
              border: '1px solid rgba(251,246,236,0.16)',
            }}
            aria-hidden="true"
          />
        ))}

        {/* ── Plano de la eclíptica: aquí vive la carta ── */}
        <div
          className="absolute inset-0"
          style={{ transformStyle: 'preserve-3d', transform: 'rotateX(90deg)' }}
        >
          {/* Anillos guía del plano */}
          <div style={ringStyle(0, 'rgba(201,168,76,0.55)', 1.5)} aria-hidden="true" />
          <div style={ringStyle(size * 0.11, 'rgba(201,168,76,0.28)')} aria-hidden="true" />
          <div style={ringStyle(size * 0.3, 'rgba(185,139,232,0.22)')} aria-hidden="true" />

          {/* Las 12 divisiones del zodíaco */}
          {Array.from({ length: 12 }, (_, i) => (
            <div
              key={`sec${i}`}
              className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
              style={{
                width: R,
                height: 0,
                transform: `rotate(${angleOf(i * 30)}deg)`,
                borderTop: '1px solid rgba(201,168,76,0.30)',
              }}
              aria-hidden="true"
            />
          ))}

          {/* Glifos de signo en el punto medio de cada sector */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = angleOf(i * 30 + 15)
            const rr = R * 0.93
            const x = rr * Math.cos(a * (Math.PI / 180))
            const y = rr * Math.sin(a * (Math.PI / 180))
            return (
              <span
                key={`gl${i}`}
                className="absolute left-1/2 top-1/2 text-[13px] leading-none pointer-events-none"
                style={{
                  transform: `translate(-50%,-50%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotateZ(90deg) rotateY(0deg)`,
                  color: ELEMENT_TINT[i % 4],
                  textShadow: `0 0 10px ${ELEMENT_TINT[i % 4]}`,
                }}
                aria-hidden="true"
              >
                {SIGN_GLYPHS[i]}
              </span>
            )
          })}

          {/* Ejes AC y MC, sobre el plano */}
          {chart.asc !== null && (
            <div
              className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
              style={{
                width: R,
                height: 0,
                transform: `rotate(${angleOf(chart.asc)}deg)`,
                borderTop: '2px solid #E8A93C',
                boxShadow: '0 0 12px rgba(232,169,60,0.8)',
              }}
              aria-hidden="true"
            />
          )}
          {chart.mc !== null && (
            <div
              className="absolute left-1/2 top-1/2 origin-left pointer-events-none"
              style={{
                width: R,
                height: 0,
                transform: `rotate(${angleOf(chart.mc)}deg)`,
                borderTop: '1.5px solid #B98BE8',
                boxShadow: '0 0 10px rgba(185,139,232,0.7)',
              }}
              aria-hidden="true"
            />
          )}

          {/* Marca de cada planeta sobre el plano: ancla visual del nodo */}
          {chart.planets.map((p) => {
            const a = angleOf(p.lon) * (Math.PI / 180)
            const rr = R * 0.7
            return (
              <span
                key={`mk${p.name}`}
                className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                style={{
                  width: 4,
                  height: 4,
                  marginLeft: -2,
                  marginTop: -2,
                  background: '#FBF6EC',
                  opacity: 0.55,
                  transform: `translate(${(rr * Math.cos(a)).toFixed(1)}px, ${(rr * Math.sin(a)).toFixed(1)}px)`,
                }}
                aria-hidden="true"
              />
            )
          })}

          {/* ── Planetas: nodos que se elevan sobre el plano ── */}
          {chart.planets.map((p) => {
            const a = angleOf(p.lon) * (Math.PI / 180)
            const rr = R * 0.7
            const x = rr * Math.cos(a)
            const y = rr * Math.sin(a)
            const isLum = p.name === 'Sol' || p.name === 'Luna'
            const color =
              p.name === 'Sol' ? '#E8A93C' : p.name === 'Luna' ? '#EDE0FF' : '#FBF6EC'
            // Alternar altura evita que dos planetas juntos se solapen.
            const lift = lifts.get(p.name) ?? 34
            const active = focused === p.name

            return (
              <button
                key={p.name}
                onPointerEnter={() => setFocused(p.name)}
                onPointerLeave={() => setFocused(null)}
                onFocus={() => setFocused(p.name)}
                onBlur={() => setFocused(null)}
                className="absolute left-1/2 top-1/2 rounded-full focus:outline-none"
                aria-label={p.name}
                style={{
                  width: 34,
                  height: 34,
                  marginLeft: -17,
                  marginTop: -17,
                  transformStyle: 'preserve-3d',
                  // El orden importa: primero se sitúa en el plano, luego se
                  // eleva por su normal, y sólo al final se contra-rota para
                  // que el glifo mire a cámara. Al revés, `translateZ` acercaba
                  // el planeta al espectador en vez de levantarlo.
                  transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateZ(${lift}px) rotateX(-90deg)`,
                }}
              >
                <span
                  className="absolute inset-0 grid place-items-center rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle at 34% 30%, #FFFFFF 0%, ${color}55 42%, ${color}22 72%, transparent 100%)`,
                    border: `1px solid ${color}${active ? 'FF' : '99'}`,
                    boxShadow: active
                      ? `0 0 22px 6px ${color}88`
                      : `0 0 12px 2px ${color}44`,
                    transform: active ? 'scale(1.18)' : 'scale(1)',
                    fontSize: isLum ? 15 : 12.5,
                    color,
                  }}
                >
                  {p.glyph}
                </span>
              </button>
            )
          })}
        </div>

        {/* Núcleo: la Tierra, centro geocéntrico de la carta */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '44%',
            background:
              'radial-gradient(circle at 34% 30%, #FBF6EC 0%, #E8A93C 40%, #9B5DE5 80%, transparent 100%)',
            boxShadow: '0 0 30px 8px rgba(232,169,60,0.45)',
          }}
          aria-hidden="true"
        />
      </div>

      {/* Etiqueta del planeta enfocado */}
      <div
        className="absolute inset-x-0 -bottom-1 text-center pointer-events-none transition-opacity duration-200"
        style={{ opacity: focused ? 1 : 0 }}
      >
        <span className="inline-block rounded-full bg-serenity-void/80 border border-white/[0.15] px-3 py-1 text-[11px] text-serenity-cream backdrop-blur-sm">
          {focused}
        </span>
      </div>
    </div>
  )
}
