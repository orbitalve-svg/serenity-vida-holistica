import { useEffect, useMemo, useRef } from 'react'
import type { Chart } from '../lib/astro'
import { runWhileVisible } from '../lib/visibility'

/**
 * Rueda de la carta astral en 3D.
 *
 * Tres capas SVG apiladas a distinta profundidad (`translateZ`): zodíaco al
 * fondo, aspectos y ejes en medio, planetas flotando encima. El plano entero
 * se inclina siguiendo el puntero — y cuando no hay puntero (móvil) ondula
 * solo, muy despacio, para que la profundidad también se vea ahí.
 *
 * La orientación no gira nunca: en una carta las posiciones son significado,
 * y el Ascendente debe quedar siempre a la izquierda. El movimiento vive en
 * la inclinación, el anillo decorativo exterior y la entrada escalonada.
 */

const RAD = Math.PI / 180
const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓']

/** Tinte por elemento: fuego, tierra, aire, agua (índice de signo % 4). */
const ELEMENT_TINT = ['#E8893C', '#5BB97A', '#5B6BD6', '#3FA7D6']

/* ─── Aspectos mayores ─── */

interface Aspect {
  a: number
  b: number
  color: string
  width: number
}

/** ángulo exacto, orbe permitido, color y nombre para la leyenda */
const ASPECT_DEFS = [
  { angle: 60, orb: 4, color: '#5BB97A', width: 0.5, label: 'Sextil' }, // armonía suave
  { angle: 90, orb: 5, color: '#D6453F', width: 0.6, label: 'Cuadratura' }, // tensión creadora
  { angle: 120, orb: 6, color: '#E8A93C', width: 0.7, label: 'Trígono' }, // fluidez
  { angle: 180, orb: 6, color: '#B98BE8', width: 0.6, label: 'Oposición' }, // espejo
] as const

function computeAspects(chart: Chart): Aspect[] {
  const out: Aspect[] = []
  const ps = chart.planets
  for (let i = 0; i < ps.length; i++) {
    for (let j = i + 1; j < ps.length; j++) {
      let diff = Math.abs(ps[i].lon - ps[j].lon) % 360
      if (diff > 180) diff = 360 - diff
      for (const def of ASPECT_DEFS) {
        if (Math.abs(diff - def.angle) <= def.orb) {
          out.push({ a: i, b: j, color: def.color, width: def.width })
          break
        }
      }
    }
  }
  return out
}

/* ─── Componente ─── */

export default function ChartWheel3D({ chart }: { chart: Chart }) {
  const sceneRef = useRef<HTMLDivElement>(null)

  // Rotación tradicional: el signo del Ascendente arranca a la izquierda.
  const ref = chart.asc !== null ? Math.floor(chart.asc / 30) * 30 : 0
  const pos = (lon: number, r: number): [number, number] => {
    const a = (180 + (lon - ref)) * RAD
    return [r * Math.cos(a), -r * Math.sin(a)]
  }

  const aspects = useMemo(() => computeAspects(chart), [chart])

  // Evita glifos montados: si dos planetas están a <9°, alterna el radio.
  const placed = useMemo(() => {
    const sorted = [...chart.planets].sort((a, b) => a.lon - b.lon)
    const out = new Map<string, number>()
    let prevLon = -999
    let inner = false
    for (const p of sorted) {
      inner = p.lon - prevLon < 9 ? !inner : false
      out.set(p.name, inner ? 54 : 67)
      prevLon = p.lon
    }
    return out
  }, [chart.planets])

  // Inclinación: puntero cuando lo hay, oleaje lento cuando no.
  useEffect(() => {
    const scene = sceneRef.current
    if (!scene) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const host = scene.parentElement as HTMLElement
    const target = { rx: 0, ry: 0 }
    const current = { rx: 0, ry: 0 }
    let lastPointer = 0
    const start = performance.now()

    const onMove = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      target.rx = -py * 16
      target.ry = px * 18
      lastPointer = performance.now()
    }
    const onLeave = () => {
      target.rx = 0
      target.ry = 0
    }

    host.addEventListener('pointermove', onMove)
    host.addEventListener('pointerleave', onLeave)
    // El bucle sólo corre con la rueda en pantalla.
    const stopLoop = runWhileVisible(host, (now) => {
      // Sin puntero reciente: oleaje suave para que el 3D se vea en móvil.
      if (now - lastPointer > 2800) {
        const t = (now - start) / 1000
        target.rx = Math.sin(t * 0.38) * 7
        target.ry = Math.cos(t * 0.29) * 9
      }
      current.rx += (target.rx - current.rx) * 0.055
      current.ry += (target.ry - current.ry) * 0.055
      scene.style.transform = `rotateX(${current.rx.toFixed(2)}deg) rotateY(${current.ry.toFixed(2)}deg)`
    })
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      stopLoop()
    }
  }, [])

  const layerCls = 'absolute inset-0 w-full h-full'
  const viewBox = '-112 -112 224 224'

  return (
    <div className="w-full max-w-[380px] mx-auto">
    <div
      className="relative w-full aspect-square select-none"
      style={{ perspective: 900 }}
      role="img"
      aria-label="Rueda de la carta astral"
    >
      {/* Escena inclinable */}
      <div
        ref={sceneRef}
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
      >
        {/* Halo profundo, detrás del plano */}
        <div
          className="absolute inset-[6%] rounded-full pointer-events-none"
          style={{
            transform: 'translateZ(-26px)',
            background:
              'radial-gradient(circle, rgba(91,107,214,0.30) 0%, rgba(155,93,229,0.14) 45%, transparent 72%)',
            filter: 'blur(18px)',
          }}
          aria-hidden="true"
        />

        {/* Capa 1 — zodíaco (fondo del plano) */}
        <svg viewBox={viewBox} className={`${layerCls} wheel-in`} aria-hidden="true">
          <defs>
            <filter id="cwGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Anillo decorativo exterior, girando muy lento */}
          <g className="animate-spin-slow" style={{ transformOrigin: '0 0' }}>
            <circle
              r="106" fill="none" stroke="#C9A84C" strokeWidth="0.5"
              strokeDasharray="1.5 5.5" opacity="0.55"
            />
          </g>

          <circle r="100" fill="none" stroke="#C9A84C" strokeWidth="0.9" opacity="0.9" />
          <circle r="82" fill="none" stroke="#C9A84C" strokeWidth="0.5" opacity="0.5" />
          <circle r="48" fill="none" stroke="#B98BE8" strokeWidth="0.35" opacity="0.35" />

          {/* Sectores con tinte del elemento + divisiones + glifos */}
          {Array.from({ length: 12 }, (_, i) => {
            const start = i * 30
            const [x1, y1] = pos(start, 82)
            const [x2, y2] = pos(start, 100)
            const [gx, gy] = pos(start + 15, 91)
            // sector anular entre 82 y 100
            const [ax, ay] = pos(start, 100)
            const [bx, by] = pos(start + 30, 100)
            const [cx2, cy2] = pos(start + 30, 82)
            const [dx, dy] = pos(start, 82)
            const d = [
              `M ${ax} ${ay}`,
              `A 100 100 0 0 1 ${bx} ${by}`,
              `L ${cx2} ${cy2}`,
              `A 82 82 0 0 0 ${dx} ${dy}`,
              'Z',
            ].join(' ')
            return (
              <g key={i}>
                <path d={d} fill={ELEMENT_TINT[i % 4]} opacity="0.07" />
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A84C" strokeWidth="0.4" opacity="0.5" />
                <text
                  x={gx} y={gy} textAnchor="middle" dominantBaseline="central"
                  fontSize="10.5" fill="#E8D9A8"
                >
                  {SIGN_GLYPHS[i]}
                </text>
              </g>
            )
          })}

          {/* Marcas de 10° */}
          {Array.from({ length: 36 }, (_, i) => {
            const [x1, y1] = pos(i * 10, 82)
            const [x2, y2] = pos(i * 10, 79)
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBB8DC" strokeWidth="0.35" opacity="0.5" />
            )
          })}
        </svg>

        {/* Capa 2 — aspectos, casas y ejes (relieve medio) */}
        <svg
          viewBox={viewBox}
          className={`${layerCls} wheel-in`}
          style={{ transform: 'translateZ(22px)', animationDelay: '0.25s' }}
          aria-hidden="true"
        >
          {/* Disco propio de los aspectos: delimita la telaraña para que no
              parezca que las líneas flotan sueltas por el centro. */}
          <circle r="46" fill="rgba(15,10,28,0.55)" />
          <circle r="46" fill="none" stroke="rgba(201,168,76,0.45)" strokeWidth="0.7" />

          {/* Radios cortos que unen cada planeta con su punto en el disco */}
          {chart.planets.map((p) => {
            const [x1, y1] = pos(p.lon, 46)
            const [x2, y2] = pos(p.lon, 50)
            return (
              <line
                key={`tick${p.name}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="#CBB8DC" strokeWidth="0.45" opacity="0.55"
              />
            )
          })}

          {/* Telaraña de aspectos */}
          {aspects.map((asp, i) => {
            const [x1, y1] = pos(chart.planets[asp.a].lon, 46)
            const [x2, y2] = pos(chart.planets[asp.b].lon, 46)
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={asp.color} strokeWidth={asp.width} strokeLinecap="round"
                pathLength={1}
                className="wheel-aspect"
                style={{ animationDelay: `${0.9 + i * 0.07}s` }}
              />
            )
          })}

          {/* Números de casa */}
          {chart.houseOfSign &&
            Array.from({ length: 12 }, (_, i) => {
              const [hx, hy] = pos(i * 30 + 15, 75)
              return (
                <text
                  key={i}
                  x={hx} y={hy} textAnchor="middle" dominantBaseline="central"
                  fontSize="5.5" fill="#B98BE8" opacity="0.85"
                >
                  {chart.houseOfSign!(i)}
                </text>
              )
            })}

          {/* Ejes AC / MC */}
          {chart.asc !== null && (
            <g filter="url(#cwGlow)">
              <line
                x1={pos(chart.asc, 46)[0]} y1={pos(chart.asc, 46)[1]}
                x2={pos(chart.asc, 103)[0]} y2={pos(chart.asc, 103)[1]}
                stroke="#E8A93C" strokeWidth="1.5"
              />
              <text
                x={pos(chart.asc, 109)[0]} y={pos(chart.asc, 109)[1]}
                textAnchor="middle" dominantBaseline="central"
                fontSize="7.5" fill="#E8A93C" fontWeight="bold"
              >
                AC
              </text>
            </g>
          )}
          {chart.mc !== null && (
            <g filter="url(#cwGlow)">
              <line
                x1={pos(chart.mc, 46)[0]} y1={pos(chart.mc, 46)[1]}
                x2={pos(chart.mc, 103)[0]} y2={pos(chart.mc, 103)[1]}
                stroke="#B98BE8" strokeWidth="1.1"
              />
              <text
                x={pos(chart.mc, 109)[0]} y={pos(chart.mc, 109)[1]}
                textAnchor="middle" dominantBaseline="central"
                fontSize="7.5" fill="#B98BE8" fontWeight="bold"
              >
                MC
              </text>
            </g>
          )}
        </svg>

        {/* Capa 3 — planetas (flotando sobre el plano) */}
        <svg
          viewBox={viewBox}
          className={layerCls}
          style={{ transform: 'translateZ(46px)' }}
          aria-hidden="true"
        >
          {chart.planets.map((p, i) => {
            const r = placed.get(p.name) ?? 67
            const [x, y] = pos(p.lon, r)
            const [t1x, t1y] = pos(p.lon, 79)
            const [t2x, t2y] = pos(p.lon, 82)
            const isLum = p.name === 'Sol' || p.name === 'Luna'
            const color = p.name === 'Sol' ? '#E8A93C' : p.name === 'Luna' ? '#EDE0FF' : '#FBF6EC'
            return (
              <g key={p.name} className="wheel-planet" style={{ animationDelay: `${0.45 + i * 0.09}s` }}>
                <line x1={t1x} y1={t1y} x2={t2x} y2={t2y} stroke="#FBF6EC" strokeWidth="0.5" opacity="0.7" />
                {/* nodo luminoso */}
                <circle cx={x} cy={y} r={isLum ? 8.5 : 7} fill={color} opacity="0.14" />
                <circle cx={x} cy={y} r={isLum ? 5.6 : 4.6} fill="#1A0E2E" stroke={color} strokeWidth="0.55" strokeOpacity="0.75" />
                <text
                  x={x} y={y + 0.3} textAnchor="middle" dominantBaseline="central"
                  fontSize={isLum ? 7.5 : 6.2} fill={color}
                >
                  {p.glyph}
                </text>
              </g>
            )
          })}
          <circle r="2" fill="#E8A93C" />
        </svg>
      </div>
    </div>

    {/* Leyenda: sin ella los colores de la telaraña no significan nada */}
    <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
      {ASPECT_DEFS.map((d) => (
        <li key={d.angle} className="flex items-center gap-1.5 text-[10px] text-serenity-mist/70">
          <span
            className="inline-block w-4 h-px shrink-0"
            style={{ background: d.color }}
            aria-hidden="true"
          />
          {d.label} {d.angle}°
        </li>
      ))}
    </ul>
    </div>
  )
}
