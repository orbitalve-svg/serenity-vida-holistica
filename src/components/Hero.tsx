import { useEffect, useRef, useState } from 'react'
import RevealLayer from './RevealLayer'
import heroBase from '../assets/hero-meditation.webp'
import heroReveal from '../assets/hero-roots.webp'
import { wa, scrollToId } from '../lib/site'

const BG_IMAGE_1 = heroBase
const BG_IMAGE_2 = heroReveal

/** Objetivo de la luz: última posición del puntero o del toque, con su instante. */
export interface Puntero {
  x: number
  y: number
  t: number
}

/** Inclinación del teléfono normalizada a [-1, 1] en cada eje. */
export interface Inclinacion {
  activo: boolean
  x: number
  y: number
}

/** Un toque es corto y casi sin desplazamiento; si no, era un scroll. */
const TAP_MAX_PX = 10
const TAP_MAX_MS = 500

/** Grados de inclinación que llevan la luz de un extremo al otro. */
const GRADOS_RANGO = 22

export default function Hero() {
  const mouseRef = useRef<Puntero>({ x: -999, y: -999, t: 0 })
  const tiltRef = useRef<Inclinacion>({ activo: false, x: 0, y: 0 })
  const tapStart = useRef<{ x: number; y: number; t: number } | null>(null)
  const giroPedido = useRef(false)
  const quitarGiro = useRef<(() => void) | null>(null)
  const [tocado, setTocado] = useState(false)
  const [tactil] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches,
  )

  useEffect(() => {
    // Sólo ratón y lápiz mueven la luz al pasar. El dedo no: en el teléfono
    // arrastrar es hacer scroll, y la luz persiguiéndolo se veía errática.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      mouseRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  /**
   * Escucha la orientación del teléfono y la vuelca en `tiltRef`. La primera
   * lectura es la postura neutra: nadie sostiene el móvil plano. Esa base se
   * recentra muy despacio (unos 8 s), para que cambiar de postura no deje la
   * luz clavada en un borde.
   */
  const escucharInclinacion = () => {
    let base: { b: number; g: number } | null = null
    const clamp = (v: number) => Math.max(-1, Math.min(1, v))
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { b: e.beta, g: e.gamma }
      else {
        base.b += (e.beta - base.b) * 0.002
        base.g += (e.gamma - base.g) * 0.002
      }
      // Como una canica: inclinas hacia un lado y la luz rueda hacia allí.
      tiltRef.current.x = clamp((e.gamma - base.g) / GRADOS_RANGO)
      tiltRef.current.y = clamp((e.beta - base.b) / GRADOS_RANGO)
      tiltRef.current.activo = true
    }
    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }

  // Android entrega la orientación sin preguntar: se escucha desde el
  // principio. iPhone exige `requestPermission()` dentro de un gesto, así que
  // ahí se pide en el primer toque (ver `pedirGiroscopio`).
  useEffect(() => {
    if (!tactil) return
    const DOE = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: unknown } })
      .DeviceOrientationEvent
    if (!DOE) return
    if (typeof DOE.requestPermission !== 'function') {
      giroPedido.current = true
      quitarGiro.current = escucharInclinacion()
    }
    return () => {
      quitarGiro.current?.()
      quitarGiro.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tactil])

  const pedirGiroscopio = () => {
    if (giroPedido.current) return
    giroPedido.current = true
    const DOE = (window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<string> }
    }).DeviceOrientationEvent
    if (!DOE || typeof DOE.requestPermission !== 'function') return
    // Se llama sin `await` previo: tiene que ocurrir dentro del gesto.
    DOE.requestPermission()
      .then((r) => {
        if (r === 'granted') quitarGiro.current = escucharInclinacion()
      })
      .catch(() => {
        /* denegado o no disponible: el toque sigue funcionando */
      })
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'touch') return
    tapStart.current = { x: e.clientX, y: e.clientY, t: performance.now() }
  }
  // Si el dedo se convirtió en scroll llega `pointercancel`, no `pointerup`:
  // aquí sólo entran los toques de verdad.
  const onPointerUp = (e: React.PointerEvent) => {
    const s = tapStart.current
    tapStart.current = null
    if (e.pointerType !== 'touch' || !s) return
    const lejos = Math.hypot(e.clientX - s.x, e.clientY - s.y) > TAP_MAX_PX
    const largo = performance.now() - s.t > TAP_MAX_MS
    if (lejos || largo) return
    mouseRef.current = { x: e.clientX, y: e.clientY, t: performance.now() }
    setTocado(true)
    pedirGiroscopio()
  }

  const scrollToServices = () => scrollToId('servicios')

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden h-screen bg-black"
      // `svh` y no `dvh`: en Safari de iPhone el `dvh` crece cuando la barra
      // se recoge al empezar a deslizar, el hero se estiraba ~80px de golpe y
      // la página parecía rebotar hacia arriba. `svh` es la altura con la
      // barra visible y no cambia durante el scroll. `h-screen` queda de
      // respaldo donde `svh` no exista.
      style={{ height: '100svh' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        tapStart.current = null
      }}
    >
      {/* 1 · Imagen base — persona meditando en campo de energía */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        aria-hidden="true"
      />

      {/* Halo de energía vivo — late suavemente sobre la silueta */}
      <div
        className="absolute left-1/2 top-[44%] z-20 pointer-events-none"
        style={{
          width: 'min(80vw, 740px)',
          height: 'min(80vw, 740px)',
          transform: 'translate(-50%,-50%)',
        }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 aura-breathe aura-blur"
          style={{
            borderRadius: '50%',
            mixBlendMode: 'screen',
            background:
              'radial-gradient(circle at 50% 50%, rgba(201,168,76,0.5) 0%, rgba(155,93,229,0.46) 32%, rgba(91,44,130,0.3) 55%, rgba(91,44,130,0) 72%)',
          }}
        />
      </div>

      {/* 2 · Capa de revelado — raíces ancestrales bajo la linterna espiritual */}
      <RevealLayer image={BG_IMAGE_2} mouseRef={mouseRef} tiltRef={tiltRef} tactil={tactil} />

      {/* Veil para legibilidad del texto */}
      <div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 30%, rgba(15,10,28,0) 35%, rgba(15,10,28,0.55) 100%)',
        }}
        aria-hidden="true"
      />

      {/* 3 · Encabezado */}
      <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 z-50 pointer-events-none">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
          >
            Tus raíces
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
          >
            guardan tu historia
          </span>
        </h1>
      </div>

      {/* 4 · Párrafo inferior izquierdo */}
      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.7s' }}
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Cada capa de tu energía guarda una memoria del alma, desde vidas ancestrales hasta
          el presente, entrelazadas como raíces bajo la tierra.
        </p>
      </div>

      {/* 5 · Bloque inferior derecho */}
      <div
        className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
        style={{ animationDelay: '0.85s' }}
      >
        <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
          Nuestras terapias holísticas y las Formaciones de Reiki y Registros Akáshicos te ayudan a descubrir
          lo que siempre estuvo bajo la superficie.
        </p>
        <button
          onClick={scrollToServices}
          className="bg-[#5B2C82] hover:bg-[#4A2369] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#5B2C82]/30"
        >
          Descubre tus Raíces
        </button>
      </div>

      {/* Hint de interacción · escritorio */}
      <div
        className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-2 text-white/55 text-xs tracking-wide hero-anim hero-fade pointer-events-none"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="font-cinzel">Mueve el cursor para iluminar tus raíces</span>
      </div>

      {/* Hint de interacción · táctil. Se apaga con el primer toque: ya
          descubrió el gesto y la línea sobra. */}
      {tactil && (
        <p
          className="sm:hidden absolute bottom-3 inset-x-0 z-50 text-center font-cinzel text-[10px] tracking-[0.2em] uppercase text-white/45 pointer-events-none hero-anim hero-fade"
          // La animación de entrada tiene `fill-mode: forwards` y pisaría
          // cualquier `opacity` normal: para apagar el hint hay que quitarla.
          style={
            tocado
              ? { animation: 'none', opacity: 0, transition: 'opacity 0.7s ease' }
              : { animationDelay: '1.3s' }
          }
        >
          Toca para iluminar tus raíces
        </p>
      )}

      <a
        href={wa('Hola Serenity, quiero agendar una cita 🙏')}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only"
      >
        Agenda tu cita por WhatsApp
      </a>
    </section>
  )
}
