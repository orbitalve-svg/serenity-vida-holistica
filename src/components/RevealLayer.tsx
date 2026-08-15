import { useEffect, useRef } from 'react'
import { runWhileVisible } from '../lib/visibility'
import type { Inclinacion, Puntero } from './Hero'

interface RevealLayerProps {
  /** BG_IMAGE_2 — la imagen de raíces ancestrales que se revela bajo la luz. */
  image: string
  /** Última posición del ratón (escritorio) o del toque (táctil), con instante. */
  mouseRef: React.MutableRefObject<Puntero>
  /** Inclinación del teléfono, si el usuario la permitió. */
  tiltRef: React.MutableRefObject<Inclinacion>
  /** Sin hover: teléfono o tableta. */
  tactil: boolean
}

/** Tras este tiempo sin mover el ratón, la luz vuelve a moverse sola. */
const IDLE_MS = 2500
/** Cuánto se queda la luz donde tocaste antes de seguir su camino. */
const TOQUE_MS = 3500

/** Borde suave del halo, compartido por el radio que toque. */
const BORDE =
  ' rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.75) 60%,' +
  ' rgba(0,0,0,0.4) 75%, rgba(0,0,0,0.12) 88%, rgba(0,0,0,0) 100%)'

/**
 * Revela la imagen de raíces dentro de un halo de luz.
 *
 * Cómo se pinta: una «linterna» circular pequeña se mueve con `transform`, y
 * dentro lleva la imagen a tamaño de pantalla contra‑desplazada, de modo que
 * por el hueco asoma exactamente el trozo de raíces que hay debajo. La
 * máscara del borde suave es fija. Así el fotograma sólo mueve dos capas ya
 * compuestas —trabajo de compositor— en lugar de reescribir un
 * `mask-image` a pantalla completa cada vez, que en el teléfono obligaba a
 * repintar toda la capa a 60 fps y hacía trompicar el scroll del Hero.
 *
 * Quién la mueve, por orden:
 *   escritorio → el ratón; si se queda quieto, una órbita lenta.
 *   táctil     → el último toque, unos segundos; si no, la inclinación del
 *                teléfono; si tampoco, una deriva por la franja baja —las
 *                raíces bajo la figura— que no sube a la cara.
 */
export default function RevealLayer({ image, mouseRef, tiltRef, tactil }: RevealLayerProps) {
  const lanternRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lantern = lanternRef.current
    const inner = innerRef.current
    const host = lantern?.parentElement
    if (!lantern || !inner || !host) return

    let W = 0
    let H = 0
    let R = 0

    const medir = () => {
      W = host.clientWidth
      H = host.clientHeight
      // El halo se adapta a la pantalla: 260px en un teléfono lo tapaba casi todo.
      R = tactil
        ? Math.max(110, Math.min(170, W * 0.36))
        : Math.max(150, Math.min(260, W * 0.42))
      const d = R * 2
      lantern.style.width = `${d}px`
      lantern.style.height = `${d}px`
      const mask = `radial-gradient(circle ${R}px at ${R}px ${R}px,${BORDE}`
      lantern.style.maskImage = mask
      lantern.style.webkitMaskImage = mask
      inner.style.width = `${W}px`
      inner.style.height = `${H}px`
    }
    medir()
    window.addEventListener('resize', medir)

    const smooth = { x: W / 2, y: tactil ? H * 0.78 : H * 0.5 }
    const start = performance.now()

    const colocar = () => {
      const lx = smooth.x - R
      const ly = smooth.y - R
      lantern.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`
      inner.style.transform = `translate3d(${(-lx).toFixed(1)}px, ${(-ly).toFixed(1)}px, 0)`
    }
    // Colocada ya antes del primer fotograma: si no, un instante asoma en la
    // esquina superior izquierda.
    colocar()

    const paint = (now: number) => {
      const m = mouseRef.current
      const tilt = tiltRef.current
      const t = (now - start) / 1000
      let tx: number
      let ty: number

      if (tactil) {
        if (m.t && now - m.t < TOQUE_MS) {
          tx = m.x
          ty = m.y
        } else if (tilt.activo) {
          // La luz rueda con la inclinación desde un centro algo bajo:
          // hacia abajo llega a las raíces, hacia arriba hasta la figura.
          tx = W / 2 + tilt.x * W * 0.32
          ty = H * 0.62 + tilt.y * H * 0.28
        } else {
          // Deriva lenta por la franja de las raíces, sin subir a la figura.
          tx = W / 2 + Math.sin(t * 0.22) * W * 0.14
          ty = H * 0.78 + Math.sin(t * 0.17) * H * 0.03
        }
      } else if (m.t && now - m.t < IDLE_MS) {
        tx = m.x
        ty = m.y
      } else {
        // Órbita lenta tipo Lissajous alrededor del centro.
        tx = W / 2 + Math.sin(t * 0.34) * W * 0.24
        ty = H * 0.52 + Math.sin(t * 0.23) * H * 0.16
      }

      // Que nunca se salga del hero: con la inclinación al tope o un toque
      // en el borde, la linterna se quedaría a medias fuera.
      tx = Math.max(R * 0.6, Math.min(W - R * 0.6, tx))
      ty = Math.max(R * 0.6, Math.min(H - R * 0.6, ty))

      smooth.x += (tx - smooth.x) * 0.075
      smooth.y += (ty - smooth.y) * 0.075
      colocar()
    }

    // Sólo pinta mientras el Hero está en pantalla.
    const stop = runWhileVisible(host, paint)
    return () => {
      stop()
      window.removeEventListener('resize', medir)
    }
  }, [mouseRef, tiltRef, tactil])

  return (
    <div
      ref={lanternRef}
      className="absolute left-0 top-0 z-30 pointer-events-none overflow-hidden will-change-transform"
      style={{
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
      }}
      aria-hidden="true"
    >
      <div
        ref={innerRef}
        className="absolute left-0 top-0 bg-center bg-cover bg-no-repeat will-change-transform"
        style={{ backgroundImage: `url(${image})` }}
      />
    </div>
  )
}
