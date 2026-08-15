import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Reveal from './Reveal'
import { runWhileVisible } from '../lib/visibility'

type CategoriaId = 'formaciones' | 'circulos' | 'ceremonias'

interface Evento {
  slug: string
  categoria: CategoriaId
  nombre: string
}

interface Foto {
  base: string
  evento: Evento
  thumb: string
  full: string
}

/** `corto` es para el móvil: los nombres largos ocupaban tres líneas de filtros. */
const CATEGORIAS: { id: CategoriaId; label: string; corto: string }[] = [
  { id: 'formaciones', label: 'Formaciones', corto: 'Formaciones' },
  { id: 'circulos', label: 'Círculos & Encuentros', corto: 'Círculos' },
  { id: 'ceremonias', label: 'Ceremonias & Sanación', corto: 'Ceremonias' },
]

const FILTROS: { id: 'todas' | CategoriaId; label: string; corto: string }[] = [
  { id: 'todas', label: 'Todas', corto: 'Todas' },
  ...CATEGORIAS,
]

const EVENTOS: Evento[] = [
  { slug: 'reiki', categoria: 'formaciones', nombre: 'Formación de Reiki' },
  { slug: 'akashicos', categoria: 'formaciones', nombre: 'Formación de Registros Akáshicos' },
  { slug: 'circulo-mujeres', categoria: 'circulos', nombre: 'Círculo de Mujeres' },
  { slug: 'constelaciones', categoria: 'circulos', nombre: 'Constelaciones Familiares' },
  { slug: 'ceremonia-holistica', categoria: 'ceremonias', nombre: 'Ceremonia Holística' },
  { slug: 'utero', categoria: 'ceremonias', nombre: 'Rito de Sanación de Útero' },
  { slug: 'nino-interior', categoria: 'ceremonias', nombre: 'Sanación del Niño Interior' },
]

const THUMBS = import.meta.glob('../assets/galeria/*-thumb.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const FULLS = import.meta.glob('../assets/galeria/*-full.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const FOTOS: Foto[] = Object.entries(THUMBS)
  .map(([ruta, thumb]) => {
    const base = ruta.split('/').pop()!.replace('-thumb.webp', '')
    const m = base.match(/^(.+)-(\d+)$/)
    const evento = m ? EVENTOS.find((e) => e.slug === m[1]) : undefined
    const full = FULLS[ruta.replace('-thumb.webp', '-full.webp')]
    if (!evento || !full) return null
    return { base, evento, thumb, full, orden: Number(m![2]) }
  })
  .filter((f): f is Foto & { orden: number } => f !== null)
  .sort((a, b) => {
    const ia = EVENTOS.indexOf(a.evento)
    const ib = EVENTOS.indexOf(b.evento)
    return ia !== ib ? ia - ib : a.orden - b.orden
  })

/** Posiciones del anillo. Con más, el anillo crece y las del fondo quedan diminutas. */
const SLOTS = 18
/**
 * El anillo gira solo, despacio y a ritmo constante: una foto nueva al frente
 * cada ~3,3 s, la vuelta entera en un minuto. Antes lo movía el scroll y en el
 * teléfono, con poco recorrido, daba la vuelta a tirones. Súbelo para más
 * brío; bájalo para más calma.
 */
const GRADOS_POR_SEGUNDO = 6
/** Grados que gira el anillo por píxel arrastrado. */
const GRADOS_POR_PX = 0.25
/** Media apertura, en grados, dentro de la cual una tarjeta se ve nítida. */
const APERTURA = 63
/**
 * La perspectiva va atada al radio, no fija. Es la proporción del original
 * (radio ≈ 0,69 × perspectiva) y es la que decide cuánta profundidad se ve.
 */
const RADIO_SOBRE_PERSPECTIVA = 0.69

const mod = (n: number, m: number) => ((n % m) + m) % m

interface Geo {
  ancho: number
  alto: number
  radio: number
}

/**
 * La tarjeta se mide contra la **banda** que queda libre entre el encabezado y
 * los controles, no contra la pantalla entera: así nunca se monta sobre el
 * título ni los filtros.
 */
function geometria(bandaW: number, bandaH: number): Geo {
  const alto = Math.max(180, Math.min(bandaH * 0.82, bandaW * 0.64 * 1.5, 440))
  const ancho = alto / 1.5 // tarjeta 2:3, como la referencia
  // Radio del cilindro: el que deja las tarjetas justo contiguas, con holgura.
  const radio = (1.25 * ancho) / (2 * Math.tan(Math.PI / SLOTS))
  return { ancho, alto, radio }
}

export default function Gallery() {
  const [filtro, setFiltro] = useState<'todas' | CategoriaId>('todas')
  const [geo, setGeo] = useState<Geo>(() => geometria(900, 480))
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const seccionRef = useRef<HTMLElement>(null)
  const bandaRef = useRef<HTMLDivElement>(null)
  const anilloRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<(HTMLDivElement | null)[]>([])
  const imgRefs = useRef<(HTMLImageElement | null)[]>([])
  const veloRefs = useRef<(HTMLSpanElement | null)[]>([])
  const rotuloRefs = useRef<(HTMLSpanElement | null)[]>([])
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const asignadas = useRef<number[]>([])
  const actuales = useRef<number[]>([])

  /** Giro acumulado por el paso del tiempo. */
  const giroAuto = useRef(0)
  /** Giro pedido a mano (flechas, arrastre) y su versión suavizada. */
  const manual = useRef(0)
  const manualSuave = useRef(0)
  const arrastre = useRef<{ activo: boolean; x: number; movido: number }>({
    activo: false,
    x: 0,
    movido: 0,
  })
  const visorAbierto = useRef(false)
  visorAbierto.current = openIndex !== null

  const fotos = useMemo(
    () => (filtro === 'todas' ? FOTOS : FOTOS.filter((f) => f.evento.categoria === filtro)),
    [filtro],
  )

  // La banda cambia de alto cuando los filtros pasan de una línea a dos, así
  // que se observa el elemento; el `resize` de ventana va de respaldo, porque
  // `ResizeObserver` sólo se entrega en los pasos de pintado y en segundo
  // plano no llega.
  useEffect(() => {
    const el = bandaRef.current
    if (!el) return
    const medir = () => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) setGeo(geometria(r.width, r.height))
    }
    medir()
    const ro = new ResizeObserver(medir)
    ro.observe(el)
    window.addEventListener('resize', medir)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', medir)
    }
  }, [])

  const pintar = useCallback(
    (giro: number) => {
      const anillo = anilloRef.current
      if (!anillo) return

      // El anillo gira sobre sí mismo y luego se aleja: así la tarjeta de
      // delante queda exactamente en z=0, a tamaño completo y sin deformar.
      anillo.style.transform = `translateZ(${-geo.radio}px) rotateY(${-giro}deg)`

      for (let i = 0; i < SLOTS; i++) {
        const slot = slotRefs.current[i]
        if (!slot) continue
        const ang = (i / SLOTS) * 360 - giro
        // Distancia angular al frente, por el camino corto.
        const d = Math.abs(mod(ang + 180, 360) - 180)
        const sel = Math.max(0, Math.min(1, 1 - d / APERTURA))

        const velo = veloRefs.current[i]
        if (velo) velo.style.opacity = String(1 - sel)
        const rot = rotuloRefs.current[i]
        if (rot) rot.style.opacity = sel > 0 ? '1' : '0'
        slot.style.pointerEvents = sel > 0.5 ? 'auto' : 'none'

        // El salto de tramo cae a ±180°, con la tarjeta en la cara oculta del
        // anillo: el cambio de foto nunca se ve. Y el signo `-tramo` evita que
        // la primera y la última posición, vecinas en pantalla, choquen.
        const tramo = Math.round(ang / 360)
        const idx = mod(i - tramo * SLOTS, fotos.length)
        actuales.current[i] = idx
        if (asignadas.current[i] !== idx) {
          asignadas.current[i] = idx
          const foto = fotos[idx]
          const img = imgRefs.current[i]
          if (img) {
            img.src = foto.thumb
            img.alt = foto.evento.nombre
          }
          if (rot) rot.textContent = foto.evento.nombre
        }
      }
    },
    [geo, fotos],
  )

  const giroTotal = () => giroAuto.current + manualSuave.current

  // Las posiciones son fijas: sólo hace falta escribirlas al montar o al
  // cambiar de tamaño, no en cada fotograma.
  useEffect(() => {
    for (let i = 0; i < SLOTS; i++) {
      const slot = slotRefs.current[i]
      if (!slot) continue
      slot.style.transform = `rotateY(${(i / SLOTS) * 360}deg) translateZ(${geo.radio}px)`
    }
    asignadas.current = []
    pintar(giroTotal())
  }, [geo, pintar])

  // El bucle: sólo mientras la sección está en pantalla. Se detiene al
  // arrastrar (manda el dedo) y con el visor abierto (no se ve).
  useEffect(() => {
    const el = seccionRef.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let prev = 0
    return runWhileVisible(el, (now) => {
      const dt = prev ? Math.min(0.1, (now - prev) / 1000) : 0
      prev = now
      if (!reduce && !arrastre.current.activo && !visorAbierto.current) {
        giroAuto.current += dt * GRADOS_POR_SEGUNDO
      }
      // El giro manual entra suavizado: una flecha no da un salto seco sino
      // que se desliza hasta su sitio.
      manualSuave.current += (manual.current - manualSuave.current) * 0.16
      pintar(giroTotal())
    })
  }, [pintar])

  const girar = (grados: number) => {
    manual.current += grados
  }

  // Arrastre para recorrer las fotos a mano. `touch-action: pan-y` deja el
  // gesto vertical al navegador, así que en móvil se sigue pudiendo
  // desplazar la página sobre el anillo.
  const onPointerDown = (e: React.PointerEvent) => {
    arrastre.current = { activo: true, x: e.clientX, movido: 0 }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const a = arrastre.current
    if (!a.activo) return
    const dx = e.clientX - a.x
    a.movido += Math.abs(dx)
    a.x = e.clientX
    manual.current += -dx * GRADOS_POR_PX
  }
  const onPointerUp = () => {
    arrastre.current.activo = false
  }

  useEffect(() => {
    if (openIndex === null) return
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null)
      if (e.key === 'ArrowRight') setOpenIndex((i) => (i === null ? i : (i + 1) % fotos.length))
      if (e.key === 'ArrowLeft')
        setOpenIndex((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [openIndex, fotos.length])

  const activa = openIndex !== null ? fotos[openIndex] : null

  return (
    <section
      id="galeria"
      ref={seccionRef}
      className="relative bg-serenity-void text-serenity-cream min-h-[100svh] flex flex-col overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(90% 60% at 50% 50%, rgba(92,58,148,0.38) 0%, rgba(15,10,28,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Tres franjas apiladas —encabezado, anillo, controles— que no pueden
          solaparse. Antes el anillo iba en `absolute inset-0` y en el móvil se
          montaba encima del título y de los filtros. */}
      <div className="relative z-20 shrink-0 pt-20 sm:pt-24 text-center px-4 sm:px-6">
        <Reveal>
          <p
            data-scroll-anchor
            className="font-cinzel uppercase tracking-[0.3em] text-serenity-gold text-xs sm:text-sm mb-3"
          >
            Galería
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-playfair italic text-3xl sm:text-5xl leading-tight mb-4">
            Momentos que Sanan
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <div className="flex flex-wrap justify-center gap-2">
            {FILTROS.map((f) => {
              const isActive = filtro === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFiltro(f.id)}
                  aria-pressed={isActive}
                  className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors ${
                    isActive
                      ? 'bg-serenity-gold text-serenity-void border-serenity-gold'
                      : 'border-white/20 text-serenity-mist/80 hover:border-serenity-gold/60 hover:text-serenity-cream'
                  }`}
                >
                  <span className="sm:hidden">{f.corto}</span>
                  <span className="hidden sm:inline">{f.label}</span>
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>

      {/* El cilindro. `perspective` en el contenedor y `preserve-3d` dentro:
          sin las dos, las tarjetas se aplanan y se pierde la profundidad. */}
      <div
        ref={bandaRef}
        className="relative flex-1 min-h-[280px] grid place-items-center z-10 cursor-grab active:cursor-grabbing"
        style={{
          perspective: `${Math.round(geo.radio / RADIO_SOBRE_PERSPECTIVA)}px`,
          touchAction: 'pan-y',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div ref={anilloRef} className="relative w-0 h-0" style={{ transformStyle: 'preserve-3d' }}>
          {Array.from({ length: SLOTS }).map((_, i) => (
            <div
              key={i}
              ref={(el) => {
                slotRefs.current[i] = el
              }}
              className="absolute left-0 top-0 will-change-transform"
              style={{
                width: geo.ancho,
                height: geo.alto,
                marginLeft: -geo.ancho / 2,
                marginTop: -geo.alto / 2,
                // Oculta la cara trasera: sólo se ve la mitad delantera del
                // anillo, que es lo que da la sensación de profundidad.
                backfaceVisibility: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  // Un arrastre termina en `click`; sin esto, girar el anillo
                  // abriría el visor al soltar.
                  if (arrastre.current.movido > 6) return
                  setOpenIndex(actuales.current[i] ?? 0)
                }}
                className="relative block w-full h-full rounded-xl overflow-hidden border border-serenity-gold/30 bg-serenity-purple-deep shadow-[5px_5px_18px_rgba(0,0,0,0.55)]"
              >
                <img
                  ref={(el) => {
                    imgRefs.current[i] = el
                  }}
                  alt=""
                  width={480}
                  height={600}
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Velo que apaga las tarjetas lejanas y deja destacar la del
                    frente, como el `--sel` del original. */}
                <span
                  ref={(el) => {
                    veloRefs.current[i] = el
                  }}
                  className="absolute inset-0 pointer-events-none bg-serenity-void"
                  style={{ opacity: 1 }}
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to top, rgba(15,10,28,0.92) 0%, transparent 100%)',
                  }}
                  aria-hidden="true"
                />
                <span className="absolute inset-x-0 bottom-0 p-3 text-left">
                  <span
                    ref={(el) => {
                      rotuloRefs.current[i] = el
                    }}
                    className="block font-cinzel uppercase tracking-[0.14em] text-serenity-gold text-[10px] leading-relaxed transition-opacity duration-300"
                  />
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controles al pie: giran el anillo a mano y el botón lleva a todas
          las fotos de un salto. */}
      <div className="relative z-20 shrink-0 pb-8 pt-3 flex flex-col items-center gap-2.5 px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => girar(-360 / SLOTS)}
            aria-label="Girar a la foto anterior"
            className="w-11 h-11 grid place-items-center rounded-full border border-white/20 text-serenity-mist/80 hover:text-serenity-cream hover:border-serenity-gold/60 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => setOpenIndex(0)}
            className="px-6 py-3 rounded-full text-sm font-semibold bg-serenity-gold text-serenity-void hover:bg-serenity-cream transition-colors"
          >
            Ver galería
          </button>
          <button
            type="button"
            onClick={() => girar(360 / SLOTS)}
            aria-label="Girar a la foto siguiente"
            className="w-11 h-11 grid place-items-center rounded-full border border-white/20 text-serenity-mist/80 hover:text-serenity-cream hover:border-serenity-gold/60 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-serenity-mist/40 text-center">
          Gira sola · Arrastra para explorar
        </p>
      </div>

      {activa && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activa.evento.nombre}
          className="fixed inset-0 z-[200] bg-serenity-void/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
          onClick={() => setOpenIndex(null)}
        >
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Cerrar"
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/80 hover:text-white w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={26} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpenIndex((i) => (i === null ? i : (i - 1 + fotos.length) % fotos.length))
            }}
            aria-label="Foto anterior"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={activa.full}
              alt={activa.evento.nombre}
              className="max-h-[70vh] w-auto mx-auto rounded-2xl border border-serenity-gold/30 object-contain"
            />
            <p className="text-center mt-4 font-playfair italic text-serenity-cream text-lg sm:text-xl">
              {activa.evento.nombre}
            </p>
            <p className="text-center text-xs text-serenity-mist/60 mt-1">
              {(openIndex ?? 0) + 1} / {fotos.length}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setOpenIndex((i) => (i === null ? i : (i + 1) % fotos.length))
            }}
            aria-label="Foto siguiente"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white w-11 h-11 grid place-items-center rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </section>
  )
}
