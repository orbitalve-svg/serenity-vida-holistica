import { useId, useMemo } from 'react'
import Reveal from './Reveal'
import NightSky from './NightSky'
import { wa } from '../lib/site'
import { getLunarData, getPhaseGuide, SYNODIC_MONTH } from '../lib/lunar'

/* ─── Luna ─── */

/** Cráteres en coordenadas unitarias del disco (−1 … 1) con radio relativo. */
const CRATERS: readonly { x: number; y: number; r: number }[] = [
  { x: -0.30, y: -0.42, r: 0.115 },
  { x: 0.16, y: -0.24, r: 0.075 },
  { x: -0.05, y: 0.10, r: 0.135 },
  { x: 0.42, y: 0.20, r: 0.09 },
  { x: -0.46, y: 0.16, r: 0.065 },
  { x: 0.06, y: 0.52, r: 0.10 },
  { x: -0.24, y: 0.44, r: 0.055 },
  { x: 0.34, y: -0.50, r: 0.05 },
  { x: -0.58, y: -0.14, r: 0.045 },
  { x: 0.55, y: -0.12, r: 0.04 },
]

/** Manchas oscuras (mares lunares) que rompen la uniformidad de la superficie. */
const MARIA: readonly { x: number; y: number; rx: number; ry: number; rot: number }[] = [
  { x: -0.26, y: -0.30, rx: 0.40, ry: 0.30, rot: -18 },
  { x: 0.22, y: 0.06, rx: 0.34, ry: 0.42, rot: 22 },
  { x: -0.12, y: 0.48, rx: 0.30, ry: 0.20, rot: 8 },
]

/**
 * Devuelve el contorno de la zona iluminada.
 *
 * La fracción iluminada es k = (1 − cos 2πφ)/2 y el terminador es una elipse
 * de semieje horizontal R·|1 − 2k|. En creciente la luz está a la derecha; en
 * menguante, a la izquierda. Para fases finas (k < 0.5) el terminador se curva
 * hacia el lado iluminado, recortando el semicírculo; para fases gibosas se
 * curva hacia el lado oscuro, añadiendo superficie.
 */
function litPath(cx: number, cy: number, R: number, phase: number): string {
  const k = (1 - Math.cos(2 * Math.PI * phase)) / 2
  const rx = R * Math.abs(1 - 2 * k)
  const waxing = phase < 0.5
  const outerSweep = waxing ? 1 : 0
  const innerSweep = k < 0.5 ? 1 - outerSweep : outerSweep

  return [
    `M ${cx} ${cy - R}`,
    `A ${R} ${R} 0 0 ${outerSweep} ${cx} ${cy + R}`,
    `A ${rx.toFixed(3)} ${R} 0 0 ${innerSweep} ${cx} ${cy - R}`,
    'Z',
  ].join(' ')
}

interface MoonProps {
  phase: number
  size?: number
  /** dibuja el resplandor y la luz cenicienta (se omite en las miniaturas) */
  detailed?: boolean
}

function Moon({ phase, size = 180, detailed = true }: MoonProps) {
  const uid = useId().replace(/:/g, '')
  const R = 50
  const cx = 60
  const cy = 60

  const k = (1 - Math.cos(2 * Math.PI * phase)) / 2
  const isNew = k < 0.012

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Superficie con oscurecimiento hacia el limbo */}
        <radialGradient id={`surf${uid}`} cx="38%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="52%" stopColor="#EFE7DA" />
          <stop offset="86%" stopColor="#CFC4BC" />
          <stop offset="100%" stopColor="#A99DA0" />
        </radialGradient>

        {/* Resplandor exterior */}
        <radialGradient id={`halo${uid}`}>
          <stop offset="55%" stopColor="#CBB8DC" stopOpacity="0.35" />
          <stop offset="78%" stopColor="#9B5DE5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#9B5DE5" stopOpacity="0" />
        </radialGradient>

        {/* Terminador suave: el borde de luz no es una línea dura */}
        <filter id={`soft${uid}`} x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
        <filter id={`blurMaria${uid}`}>
          <feGaussianBlur stdDeviation="2.4" />
        </filter>

        {/* Máscara: sólo se ve la porción iluminada */}
        <mask id={`lit${uid}`}>
          <rect x="0" y="0" width="120" height="120" fill="black" />
          {!isNew && (
            <path d={litPath(cx, cy, R, phase)} fill="white" filter={`url(#soft${uid})`} />
          )}
        </mask>
      </defs>

      {detailed && <circle cx={cx} cy={cy} r={R * 1.55} fill={`url(#halo${uid})`} />}

      {/* Cara oscura con luz cenicienta (el reflejo de la Tierra) */}
      <circle cx={cx} cy={cy} r={R} fill="#191333" />
      {detailed && (
        <circle cx={cx} cy={cy} r={R} fill="#8E86C4" opacity={0.1} />
      )}

      {/* Superficie iluminada */}
      <g mask={`url(#lit${uid})`}>
        <circle cx={cx} cy={cy} r={R} fill={`url(#surf${uid})`} />

        {/* Mares lunares */}
        <g filter={`url(#blurMaria${uid})`} opacity="0.22">
          {MARIA.map((m, i) => (
            <ellipse
              key={i}
              cx={cx + m.x * R}
              cy={cy + m.y * R}
              rx={m.rx * R}
              ry={m.ry * R}
              transform={`rotate(${m.rot} ${cx + m.x * R} ${cy + m.y * R})`}
              fill="#6E6480"
            />
          ))}
        </g>

        {/* Cráteres: hueco sombreado + borde iluminado arriba a la izquierda */}
        {CRATERS.map((c, i) => {
          const x = cx + c.x * R
          const y = cy + c.y * R
          const r = c.r * R
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#8C8291" opacity="0.30" />
              <circle
                cx={x - r * 0.16}
                cy={y - r * 0.16}
                r={r * 0.82}
                fill="#FFFBF2"
                opacity="0.30"
              />
              <circle cx={x} cy={y} r={r} fill="none" stroke="#6F6678" strokeOpacity="0.22" strokeWidth={r * 0.16} />
            </g>
          )
        })}
      </g>

      {/* Limbo */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke="rgba(203,184,220,0.30)"
        strokeWidth="0.6"
      />
    </svg>
  )
}

/* ─── Miniaturas del ciclo ─── */

const CYCLE_STEPS: readonly { phase: number; label: string }[] = [
  { phase: 0, label: 'Nueva' },
  { phase: 0.125, label: 'Creciente' },
  { phase: 0.25, label: 'C. Creciente' },
  { phase: 0.375, label: 'Gibosa' },
  { phase: 0.5, label: 'Llena' },
  { phase: 0.625, label: 'Gibosa' },
  { phase: 0.75, label: 'C. Menguante' },
  { phase: 0.875, label: 'Menguante' },
]

/* ─── Componente ─── */

export default function LunarPhase() {
  const today = useMemo(() => new Date(), [])
  const lunar = useMemo(() => getLunarData(today), [today])
  const guide = useMemo(() => getPhaseGuide(lunar.phaseName), [lunar.phaseName])

  const dateStr = today.toLocaleDateString('es-VE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const dayNum = Math.floor(lunar.daysInCycle) + 1

  /** Paso del ciclo más cercano a la fase actual (para resaltarlo). */
  const activeStep = useMemo(() => {
    let best = 0
    let bestDist = Infinity
    CYCLE_STEPS.forEach((s, i) => {
      const raw = Math.abs(s.phase - lunar.phase)
      const dist = Math.min(raw, 1 - raw) // el ciclo es circular
      if (dist < bestDist) {
        bestDist = dist
        best = i
      }
    })
    return best
  }, [lunar.phase])

  const daysToNew = Math.round((1 - lunar.phase) * SYNODIC_MONTH)
  const daysToFull = Math.round((((0.5 - lunar.phase) % 1) + 1) % 1 * SYNODIC_MONTH)

  return (
    <section
      className="relative overflow-hidden text-serenity-cream py-24 sm:py-32"
      style={{
        background:
          'radial-gradient(ellipse 140% 100% at 50% 100%, #160C28 0%, #0B0716 58%)',
      }}
    >
      <NightSky count={150} brightCount={8} seed={21} />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Reveal>
            <p className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4">
              Ciclo Lunar de Hoy
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">
              La Luna y tu Energía
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-serenity-mist text-base sm:text-lg">{dateStr}</p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Luna */}
          <Reveal className="flex flex-col items-center gap-6">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full chakra-breathe"
                style={{
                  transform: 'scale(1.4)',
                  background: `radial-gradient(circle, ${guide.color}1f 0%, transparent 70%)`,
                  filter: 'blur(24px)',
                }}
                aria-hidden="true"
              />
              <Moon phase={lunar.phase} size={230} />
            </div>

            <div className="text-center">
              <p
                className="font-playfair italic text-4xl sm:text-5xl leading-tight"
                style={{ color: guide.color }}
              >
                {lunar.phaseName}
              </p>
              <p className="text-serenity-mist mt-2 text-sm">
                Día {dayNum} del ciclo · {lunar.illumination}% iluminada
              </p>
            </div>

            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-playfair" style={{ color: guide.color }}>
                  {dayNum}
                </p>
                <p className="text-xs text-serenity-mist/70 uppercase tracking-widest">
                  Día del ciclo
                </p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-playfair" style={{ color: guide.color }}>
                  {lunar.illumination}%
                </p>
                <p className="text-xs text-serenity-mist/70 uppercase tracking-widest">
                  Iluminación
                </p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-2xl font-playfair" style={{ color: guide.color }}>
                  {lunar.waning ? '↓' : '↑'}
                </p>
                <p className="text-xs text-serenity-mist/70 uppercase tracking-widest">
                  {lunar.waning ? 'Menguante' : 'Creciente'}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Guía espiritual */}
          <Reveal delay={120}>
            <div
              className="rounded-[2rem] border p-7 sm:p-9 space-y-5 backdrop-blur-sm"
              style={{
                borderColor: `${guide.color}40`,
                background: `radial-gradient(130% 120% at 0% 0%, ${guide.color}18, rgba(11,7,22,0.72) 65%)`,
              }}
            >
              <div>
                <p
                  className="text-[10px] font-cinzel uppercase tracking-widest mb-2"
                  style={{ color: guide.color }}
                >
                  Energía de esta fase
                </p>
                <p className="text-serenity-cream/90 leading-relaxed">{guide.energy}</p>
              </div>

              <div
                className="rounded-2xl px-5 py-4 border"
                style={{ borderColor: `${guide.color}35`, background: `${guide.color}12` }}
              >
                <p
                  className="text-[10px] font-cinzel uppercase tracking-widest mb-2"
                  style={{ color: guide.color }}
                >
                  Tu intención lunar
                </p>
                <p className="text-serenity-cream/85 text-sm leading-relaxed italic">
                  “{guide.intention}”
                </p>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
                <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold/80 mb-2">
                  Ritual recomendado
                </p>
                <p className="text-serenity-cream/80 text-sm leading-relaxed">{guide.ritual}</p>
              </div>

              <div className="border-t border-white/10 pt-5 flex flex-wrap items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-serenity-mist/70 mb-0.5">
                    Terapia ideal para esta luna
                  </p>
                  <p className="text-serenity-cream font-semibold text-sm">{guide.service}</p>
                </div>
                <a
                  href={wa(guide.serviceMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-serenity-ink font-semibold text-sm px-6 py-3.5 rounded-full transition-all hover:scale-[1.04] active:scale-95"
                  style={{ background: guide.color }}
                >
                  Agendar <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Recorrido del ciclo */}
        <Reveal delay={160}>
          <div className="mt-16 sm:mt-20">
            <div className="flex items-center gap-4 mb-7">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-serenity-gold/40" />
              <p className="font-cinzel uppercase tracking-[0.28em] text-serenity-gold/90 text-[11px] sm:text-xs whitespace-nowrap">
                El ciclo completo
              </p>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-serenity-gold/40" />
            </div>

            <ol className="grid grid-cols-4 sm:grid-cols-8 gap-y-6 gap-x-2">
              {CYCLE_STEPS.map((s, i) => {
                const isActive = i === activeStep
                return (
                  <li key={s.label + i} className="flex flex-col items-center gap-2 text-center">
                    <div
                      className="rounded-full transition-all duration-500"
                      style={{
                        transform: isActive ? 'scale(1.18)' : 'scale(1)',
                        filter: isActive
                          ? `drop-shadow(0 0 12px ${guide.color})`
                          : 'grayscale(0.35)',
                        opacity: isActive ? 1 : 0.45,
                      }}
                    >
                      <Moon phase={s.phase} size={46} detailed={false} />
                    </div>
                    <span
                      className="text-[11px] leading-tight"
                      style={{ color: isActive ? guide.color : 'rgba(203,184,220,0.6)' }}
                    >
                      {s.label}
                    </span>
                  </li>
                )
              })}
            </ol>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-serenity-mist">
                Próxima luna llena en{' '}
                <strong className="text-serenity-cream font-semibold">
                  {daysToFull === 0 ? 'hoy' : `${daysToFull} días`}
                </strong>
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-serenity-mist">
                Próxima luna nueva en{' '}
                <strong className="text-serenity-cream font-semibold">
                  {daysToNew === 0 ? 'hoy' : `${daysToNew} días`}
                </strong>
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
