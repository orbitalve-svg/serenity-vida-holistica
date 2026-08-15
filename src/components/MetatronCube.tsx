import { useEffect, useMemo, useRef } from 'react'
import { runWhileVisible } from '../lib/visibility'

/**
 * Cubo de Metatrón en 3D real.
 *
 * La figura son 13 centros: uno central y doce alrededor. En el plano forman
 * la Fruta de la Vida (un hexágono interior y otro exterior girado 30°), y al
 * unir *todos* los centros entre sí — las 78 líneas — aparece el Cubo.
 *
 * Esos mismos 13 puntos son, en volumen, un cuboctaedro (12 vértices + centro).
 * Mirado por su eje de simetría triple se proyecta exactamente sobre el símbolo
 * plano. Por eso aquí la figura gira sobre ese eje —manteniendo la silueta
 * canónica— y a la vez cabecea suavemente, abriéndose en 3D y volviendo a
 * cerrarse sobre el símbolo.
 */

type Vec3 = readonly [number, number, number]

/** Cuboctaedro: las 12 permutaciones de (±1, ±1, 0), más el centro. */
const RAW_NODES: readonly Vec3[] = [
  [0, 0, 0],
  [1, 1, 0],
  [1, -1, 0],
  [-1, 1, 0],
  [-1, -1, 0],
  [1, 0, 1],
  [1, 0, -1],
  [-1, 0, 1],
  [-1, 0, -1],
  [0, 1, 1],
  [0, 1, -1],
  [0, -1, 1],
  [0, -1, -1],
]

/**
 * Base ortonormal con el eje triple (1,1,1) apuntando al espectador: así la
 * pose de reposo es el Cubo de Metatrón plano y reconocible.
 */
const E1: Vec3 = [1 / Math.SQRT2, -1 / Math.SQRT2, 0]
const E2: Vec3 = [1 / Math.sqrt(6), 1 / Math.sqrt(6), -2 / Math.sqrt(6)]
const E3: Vec3 = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)]

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** Nodos ya expresados en la base del eje triple. */
const NODES: readonly Vec3[] = RAW_NODES.map(
  (p) => [dot(p, E1), dot(p, E2), dot(p, E3)] as Vec3,
)

/** Las 78 aristas: todos los pares de centros, como manda la figura. */
interface Edge {
  a: number
  b: number
  /** grosor y color según el papel de la línea dentro de la figura */
  kind: 0 | 1 | 2 | 3
}

const EDGES: readonly Edge[] = (() => {
  const out: Edge[] = []
  for (let i = 0; i < RAW_NODES.length; i++) {
    for (let j = i + 1; j < RAW_NODES.length; j++) {
      const a = RAW_NODES[i]
      const b = RAW_NODES[j]
      const d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
      // La distancia entre dos centros dice qué dibuja cada línea:
      //   √2  → radios al centro y aristas del cuboctaedro (la retícula)
      //   2   → hexágonos y diagonales de las caras cuadradas
      //   √6  → el hexagrama, la Estrella de David que define la figura
      //   2√2 → diagonales largas que cruzan de lado a lado
      const kind: 0 | 1 | 2 | 3 = d < 1.5 ? 0 : d < 2.2 ? 1 : d < 2.6 ? 2 : 3
      out.push({ a: i, b: j, kind })
    }
  }
  return out
})()

const STYLES = [
  { stroke: '#C9A84C', width: 0.95, base: 0.62 }, // retícula interna
  { stroke: '#E8D9A8', width: 0.8, base: 0.5 }, // hexágonos
  { stroke: '#E8A93C', width: 1.9, base: 1 }, // hexagrama — la línea protagonista
  { stroke: '#B98BE8', width: 0.6, base: 0.32 }, // diagonales largas
] as const

// Cámara lejana = perspectiva casi ortográfica. Es deliberado: con una cámara
// cercana los dos hexágonos interiores (el de delante y el de detrás) se
// proyectan a radios distintos y la silueta deja de ser la canónica.
const DIST = 20
const SCALE = 34

// Desfase para que en reposo el hexagrama apunte hacia arriba, como en la
// iconografía clásica. Sin él los vértices caen a izquierda y derecha.
const PHASE = Math.PI / 2

interface MetatronCubeProps {
  size?: number
  className?: string
  /** vueltas por segundo sobre el eje triple */
  speed?: number
  /** amplitud del cabeceo en radianes; 0 deja el símbolo plano */
  wobble?: number
}

export default function MetatronCube({
  size = 220,
  className = '',
  speed = 0.055,
  wobble = 0.17,
}: MetatronCubeProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const lineRefs = useRef<(SVGLineElement | null)[]>([])
  const ringRefs = useRef<(SVGCircleElement | null)[]>([])
  const dotRefs = useRef<(SVGCircleElement | null)[]>([])

  // El radio de los 13 círculos es la mitad de la arista: así se tocan sin solaparse.
  const ringR = useMemo(() => Math.SQRT2 / 2, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()

    const draw = (spin: number, tilt: number) => {
      const cs = Math.cos(spin)
      const ss = Math.sin(spin)
      const ct = Math.cos(tilt)
      const st = Math.sin(tilt)

      const pts = NODES.map(([x, y, z]) => {
        // giro sobre el eje triple (que aquí es Z)
        const x1 = x * cs - y * ss
        const y1 = x * ss + y * cs
        // cabeceo: abre la figura hacia el volumen
        const y2 = y1 * ct - z * st
        const z2 = y1 * st + z * ct
        const s = DIST / (DIST - z2)
        return { x: x1 * s * SCALE, y: -y2 * s * SCALE, z: z2, s }
      })

      EDGES.forEach((e, i) => {
        const line = lineRefs.current[i]
        if (!line) return
        const p1 = pts[e.a]
        const p2 = pts[e.b]
        line.setAttribute('x1', p1.x.toFixed(2))
        line.setAttribute('y1', p1.y.toFixed(2))
        line.setAttribute('x2', p2.x.toFixed(2))
        line.setAttribute('y2', p2.y.toFixed(2))
        // Las líneas cercanas se ven más nítidas: da sensación de volumen.
        const depth = ((p1.z + p2.z) / 2 + 1.5) / 3
        line.setAttribute('opacity', (STYLES[e.kind].base * (0.35 + depth * 0.75)).toFixed(3))
      })

      pts.forEach((p, i) => {
        const ring = ringRefs.current[i]
        if (ring) {
          ring.setAttribute('cx', p.x.toFixed(2))
          ring.setAttribute('cy', p.y.toFixed(2))
          ring.setAttribute('r', (ringR * p.s * SCALE).toFixed(2))
          ring.setAttribute('opacity', (0.22 + ((p.z + 1.5) / 3) * 0.5).toFixed(3))
        }
        const dot = dotRefs.current[i]
        if (dot) {
          dot.setAttribute('cx', p.x.toFixed(2))
          dot.setAttribute('cy', p.y.toFixed(2))
          dot.setAttribute('r', (1.1 + ((p.z + 1.5) / 3) * 1.8).toFixed(2))
          dot.setAttribute('opacity', (0.35 + ((p.z + 1.5) / 3) * 0.65).toFixed(3))
        }
      })
    }

    if (reduce || !svgRef.current) {
      draw(PHASE, 0) // el símbolo plano, quieto
      return
    }

    // El cabeceo cruza por cero cada ciclo: ahí la figura se resuelve en el
    // Cubo de Metatrón plano antes de volver a abrirse. Sólo gira en pantalla.
    return runWhileVisible(svgRef.current, (now) => {
      const t = (now - start) / 1000
      draw(PHASE + t * speed * Math.PI * 2, Math.sin(t * 0.45) * wobble)
    })
  }, [speed, wobble, ringR])

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="mcGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="mcCore">
          <stop offset="0%" stopColor="#DCE6FF" stopOpacity="0.55" />
          <stop offset="42%" stopColor="#5B6BD6" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#2D1547" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Halo azul del centro, como en la iconografía clásica */}
      <circle cx="0" cy="0" r="74" fill="url(#mcCore)" />

      <g filter="url(#mcGlow)">
        {/* Los 13 círculos de la Fruta de la Vida */}
        <g fill="none" stroke="#E8D9A8" strokeWidth="0.7">
          {NODES.map((_, i) => (
            <circle
              key={`r${i}`}
              ref={(el) => {
                ringRefs.current[i] = el
              }}
            />
          ))}
        </g>

        {/* Las 78 líneas que unen todos los centros */}
        {EDGES.map((e, i) => (
          <line
            key={`e${i}`}
            ref={(el) => {
              lineRefs.current[i] = el
            }}
            stroke={STYLES[e.kind].stroke}
            strokeWidth={STYLES[e.kind].width}
            strokeLinecap="round"
          />
        ))}

        {/* Nodos */}
        <g fill="#FBF6EC">
          {NODES.map((_, i) => (
            <circle
              key={`d${i}`}
              ref={(el) => {
                dotRefs.current[i] = el
              }}
            />
          ))}
        </g>
      </g>
    </svg>
  )
}
