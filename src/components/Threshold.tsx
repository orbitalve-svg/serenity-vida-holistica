import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MetatronCube from './MetatronCube'
import NightSky from './NightSky'

const SESSION_KEY = 'serenity.threshold.seen'

/** Duraciones del ritual de entrada, en ms. */
const HOLD = 4600 // tiempo antes de disolverse solo
const FADE = 1200 // duración del cruce

type Phase = 'open' | 'leaving' | 'done'

/**
 * Umbral de entrada: un portal que se abre antes de la web.
 *
 * Se muestra una vez por sesión (o siempre con `?umbral` en la URL), se salta
 * con un clic o cualquier tecla, y se omite si se pidió movimiento reducido.
 */
/** ¿Toca mostrar el umbral en esta visita? Sólo tiene sentido en el navegador. */
function debeAbrirse(): boolean {
  // La accesibilidad manda: si pidieron movimiento reducido, no hay umbral.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false

  // `?umbral` en la URL lo fuerza — sirve para probarlo y para demos.
  try {
    if (new URLSearchParams(window.location.search).has('umbral')) return true
  } catch {
    /* URL rara: seguimos con la lógica normal */
  }

  // Si no, sólo una vez por sesión para no repetirlo en cada navegación.
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return false
  } catch {
    /* almacenamiento bloqueado: mostramos el umbral igualmente */
  }
  return true
}

export default function Threshold() {
  // Arranca cerrado y decide tras montar. Así el HTML que genera el
  // prerender (sin `window`) y el primer render en el navegador coinciden, y
  // React hidrata sin quejas; el umbral aparece un fotograma después, con
  // su propio fundido, así que no se nota.
  const [phase, setPhase] = useState<Phase>('done')

  useEffect(() => {
    if (debeAbrirse()) setPhase('open')
  }, [])

  const timer = useRef<number | undefined>(undefined)

  const dismiss = useCallback(() => {
    setPhase((p) => (p === 'open' ? 'leaving' : p))
  }, [])

  useEffect(() => {
    if (phase !== 'open') return
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      /* sin sessionStorage */
    }
  }, [phase])

  // Bloquea el scroll mientras el umbral está en pantalla.
  useEffect(() => {
    if (phase === 'done') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [phase])

  useEffect(() => {
    if (phase === 'open') {
      timer.current = window.setTimeout(dismiss, HOLD)
      const onKey = () => dismiss()
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
        if (timer.current) clearTimeout(timer.current)
      }
    }
    if (phase === 'leaving') {
      const t = window.setTimeout(() => setPhase('done'), FADE)
      return () => clearTimeout(t)
    }
  }, [phase, dismiss])

  /** Pavesas que ascienden como incienso. */
  const embers = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: 12 + ((i * 37) % 76),
        size: 1.5 + ((i * 7) % 3),
        delay: (i % 8) * 0.55,
        dur: 5 + ((i * 3) % 4),
      })),
    [],
  )

  if (phase === 'done') return null

  const leaving = phase === 'leaving'

  return (
    <div
      role="presentation"
      onClick={dismiss}
      className="fixed inset-0 z-[300] overflow-hidden cursor-pointer select-none flex flex-col items-center justify-center"
      style={{
        background:
          'radial-gradient(ellipse 110% 90% at 50% 50%, #1A0E2E 0%, #0B0716 55%, #050309 100%)',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE}ms cubic-bezier(0.4,0,1,1) 260ms`,
      }}
    >
      {/* Cielo profundo, entrando poco a poco */}
      <div style={{ animation: 'veilIn 2.4s ease-out both' }}>
        <NightSky count={90} brightCount={5} seed={3} />
      </div>

      {/* Pavesas de incienso */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none" aria-hidden="true">
        {embers.map((e, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${e.x}%`,
              width: e.size,
              height: e.size,
              background: '#E8A93C',
              boxShadow: `0 0 ${e.size * 4}px #E8A93C`,
              animation: `emberRise ${e.dur}s ease-out ${e.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Escena del portal — al salir, atraviesa al espectador */}
      <div
        className="relative shrink-0"
        style={{
          transform: leaving ? 'scale(3.4)' : 'scale(1)',
          opacity: leaving ? 0 : 1,
          transition: leaving
            ? `transform ${FADE}ms cubic-bezier(0.5,0,0.9,1), opacity ${FADE}ms ease-in 200ms`
            : undefined,
        }}
      >
        <div
          className="relative flex items-center justify-center w-[min(420px,88vw)] aspect-square"
        >
          {/* Ondas de energía */}
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="absolute rounded-full border pointer-events-none w-[70%] aspect-square"
              style={{
                borderColor: i % 2 === 0 ? 'rgba(232,169,60,0.45)' : 'rgba(155,93,229,0.40)',
                animation: `ringPulse 4.2s cubic-bezier(0.16,1,0.3,1) ${i * 1.05 + 0.6}s infinite`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Núcleo de luz respirando */}
          <div
            className="absolute rounded-full pointer-events-none w-[62%] aspect-square"
            style={{
              background:
                'radial-gradient(circle, rgba(251,246,236,0.30) 0%, rgba(232,169,60,0.18) 30%, rgba(155,93,229,0.10) 55%, transparent 72%)',
              filter: 'blur(16px)',
              animation: 'coreBreath 4.5s ease-in-out 0.4s infinite',
            }}
            aria-hidden="true"
          />

          {/* Cubo de Metatrón: el portal propiamente dicho.
              Va en posición absoluta y no como hijo flexible: como elemento
              flex se encogía por debajo de su tamaño y en móvil quedaba
              diminuto. Así siempre ocupa el ancho completo del portal. */}
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ animation: 'portalOpen 3s cubic-bezier(0.16,1,0.3,1) 0.4s both' }}
          >
            <MetatronCube size={420} speed={0.035} wobble={0.1} className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Invitación */}
      <div
        className="relative mt-8 sm:mt-10 flex flex-col items-center text-center px-8 shrink-0"
        style={{
          opacity: leaving ? 0 : 1,
          transition: leaving ? 'opacity 420ms ease-out' : undefined,
        }}
      >
        <p
          className="font-playfair italic text-4xl sm:text-5xl text-serenity-cream"
          style={{ animation: 'thresholdIn 1.4s ease-out 1.6s both' }}
        >
          Respira hondo
        </p>
        <p
          className="mt-4 font-cinzel uppercase tracking-[0.34em] text-serenity-gold text-[11px] sm:text-xs"
          style={{ animation: 'thresholdIn 1.4s ease-out 2.9s both' }}
        >
          Estás cruzando un umbral
        </p>
        <span
          className="mt-10 text-[10px] tracking-[0.3em] uppercase text-serenity-mist/40"
          style={{ animation: 'thresholdIn 1.2s ease-out 3.9s both' }}
        >
          Toca para entrar
        </span>
      </div>

      {/* Destello del cruce */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(251,246,236,0.85) 0%, rgba(232,169,60,0.35) 28%, transparent 62%)',
          opacity: leaving ? 1 : 0,
          transition: 'opacity 420ms ease-out',
        }}
        aria-hidden="true"
      />
    </div>
  )
}
