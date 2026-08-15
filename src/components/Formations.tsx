import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import Reveal from './Reveal'
import MetatronCube from './MetatronCube'
import { wa } from '../lib/site'

/** Flor de la Vida — anillos concéntricos de círculos unitarios. */
function FlowerOfLife({ className = '' }: { className?: string }) {
  const circles = useMemo(() => {
    const h = Math.sqrt(3) / 2
    const lattice = [
      [0, 0], [1, 0], [-1, 0], [0.5, h], [-0.5, h], [0.5, -h], [-0.5, -h],
      [2, 0], [-2, 0], [1, 2 * h], [-1, 2 * h], [1, -2 * h], [-1, -2 * h],
      [1.5, h], [-1.5, h], [1.5, -h], [-1.5, -h], [0, 2 * h], [0, -2 * h],
    ]
    return lattice.map(([x, y]) => ({ x, y }))
  }, [])

  return (
    <svg viewBox="-4 -4 8 8" className={className} aria-hidden="true">
      <g fill="none" stroke="url(#folGrad)" strokeWidth="0.04">
        {circles.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="1" />
        ))}
        <circle cx="0" cy="0" r="3.4" strokeWidth="0.05" />
      </g>
      <defs>
        <radialGradient id="folGrad">
          <stop offset="0%" stopColor="#E8A93C" />
          <stop offset="70%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#5B2C82" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ─── Datos ─── */

interface Module {
  title: string
  items: string[]
}

interface Level {
  tag: string
  /** nombre tradicional japonés, cuando lo tiene */
  sanskrit?: string
  name: string
  meta: string
  tagline: string
  objective: string
  modules: Module[]
  msg: string
}

interface Formation {
  id: string
  /** texto de la pestaña */
  label: string
  title: string
  intro: string
  color: string
  levels: Level[]
  msgAll: string
}

const AKASHIC_LEVELS: Level[] = [
  {
    tag: 'Nivel 1',
    name: 'Despertar',
    meta: '8 sesiones · 16 h',
    tagline: 'Abre la puerta a tu propio Registro y aprende a leerlo con reverencia.',
    objective:
      'Acceder por primera vez a tu propio Registro Akáshico con una apertura segura y ética, y sostener una lectura personal guiada.',
    modules: [
      {
        title: 'Temario',
        items: [
          'Qué son los Registros Akáshicos y el campo de la conciencia',
          'La Oración Sagrada: apertura y protección',
          'Anatomía del alma I',
          'Tu primera lectura personal guiada',
          'Ética y responsabilidad del lector',
        ],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Registros Akáshicos — Nivel 1 (Despertar).',
  },
  {
    tag: 'Nivel 2',
    name: 'Sanación',
    meta: '8 sesiones · 20 h',
    tagline: 'Libera votos, contratos y memorias de linaje desde el Registro.',
    objective:
      'Trabajar la sanación profunda dentro del Registro: memorias de linaje, vidas pasadas y los acuerdos del alma que sostienen patrones repetitivos.',
    modules: [
      {
        title: 'Temario',
        items: [
          'Votos, juramentos y contratos del alma',
          'Sanación de linajes y memorias ancestrales',
          'Vidas pasadas y patrones recurrentes',
          'Lectura para terceros',
          'Constelaciones akáshicas',
        ],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Registros Akáshicos — Nivel 2 (Sanación).',
  },
  {
    tag: 'Nivel 3',
    name: 'Maestría',
    meta: '8 sesiones · 24 h',
    tagline: 'Integra la tecnología akáshica y certifícate como lector/a.',
    objective:
      'Integrar la tecnología akáshica avanzada, acompañar procesos de otras personas con solvencia y cerrar el camino con práctica supervisada y certificación.',
    modules: [
      {
        title: 'Temario',
        items: [
          'Tecnología akáshica avanzada',
          'Akáshico, propósito de vida y proyectos',
          'Trabajo con guías y maestros',
          'Sanación profunda multidimensional',
          'Práctica supervisada y certificación',
        ],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Registros Akáshicos — Nivel 3 (Maestría).',
  },
]

const REIKI_LEVELS: Level[] = [
  {
    tag: 'Nivel I',
    sanskrit: 'Shoden',
    name: 'El despertar del canal',
    meta: 'Iniciación · Presencial',
    tagline: 'Se abre tu canal y aprendes a darte Reiki a ti y a los demás.',
    objective:
      'Activar el canal energético del alumno, iniciar el proceso de autosanación y aprender a aplicar Reiki en sí mismo y en otros a nivel físico–emocional.',
    modules: [
      {
        title: 'Introducción al Reiki Usui',
        items: [
          'Qué es Reiki y qué no es',
          'Origen del Reiki: Mikao Usui',
          'Principios del Reiki (Gokai)',
          'Reiki como camino espiritual y de vida',
        ],
      },
      {
        title: 'Energía vital universal',
        items: [
          'El campo energético humano',
          'Aura y chakras',
          'Cómo fluye la energía Reiki',
          'Sensibilidad energética y percepción',
        ],
      },
      {
        title: 'Preparación del canal',
        items: [
          'Limpieza energética previa',
          'Actitud del practicante',
          'Ética del Reiki y responsabilidad energética',
        ],
      },
      {
        title: 'Sintonización / Iniciación Nivel I',
        items: ['Apertura del canal Reiki', 'Activación energética', 'Integración vibracional'],
      },
      {
        title: 'Técnicas básicas de Reiki',
        items: [
          'Auto Reiki (autotratamiento completo)',
          'Reiki a otras personas',
          'Posiciones de manos (tradicionales)',
          'Reiki presencial',
        ],
      },
      {
        title: 'Práctica consciente',
        items: [
          'Cómo dar una sesión de Reiki',
          'Duración y frecuencia de las sesiones',
          'Reacciones físicas y emocionales post-Reiki',
        ],
      },
      {
        title: 'Autosanación y proceso de 21 días',
        items: [
          'Protocolo de autosanación',
          'Cambios energéticos y emocionales',
          'Acompañamiento del proceso personal',
        ],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Reiki Usui — Nivel I (Shoden).',
  },
  {
    tag: 'Nivel II',
    sanskrit: 'Okuden',
    name: 'Sanación mental y a distancia',
    meta: 'Iniciación · Presencial',
    tagline: 'Recibes los símbolos sagrados y aprendes a sanar fuera del tiempo y el espacio.',
    objective:
      'Profundizar en la energía Reiki, trabajar el plano mental–emocional y aprender el uso consciente de los símbolos sagrados.',
    modules: [
      {
        title: 'Profundización energética',
        items: [
          'Reiki como vibración y conciencia',
          'El poder de la intención',
          'Sanación emocional y mental',
        ],
      },
      {
        title: 'Los símbolos sagrados del Reiki Usui',
        items: [
          'Significado, uso y vibración',
          'Activación y trazado consciente',
          'Uso ético de los símbolos',
          'Símbolos tradicionales: Poder · Mental–Emocional · Distancia',
        ],
      },
      {
        title: 'Sintonización / Iniciación Nivel II',
        items: [
          'Activación de símbolos',
          'Aumento del caudal energético',
          'Integración vibracional',
        ],
      },
      {
        title: 'Reiki mental y emocional',
        items: ['Sanación de patrones', 'Creencias limitantes', 'Memorias emocionales'],
      },
      {
        title: 'Reiki a distancia',
        items: [
          'Sanación fuera del tiempo y espacio',
          'Reiki a situaciones, personas y lugares',
          'Reiki al pasado y al futuro',
        ],
      },
      {
        title: 'Técnicas avanzadas',
        items: [
          'Reiki a espacios',
          'Reiki a objetos, alimentos y agua',
          'Reiki para protección energética',
        ],
      },
      {
        title: 'Prácticas guiadas',
        items: ['Sesiones completas con símbolos', 'Casos prácticos', 'Auto Reiki avanzado'],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Reiki Usui — Nivel II (Okuden).',
  },
  {
    tag: 'Nivel III',
    sanskrit: 'Shinpiden',
    name: 'Maestría interior',
    meta: 'Iniciación · Presencial',
    tagline: 'La energía de la maestría como camino de vida, no necesariamente para enseñar.',
    objective:
      'Acceder a la energía de la maestría, elevar la frecuencia vibratoria y profundizar en el Reiki como camino espiritual (no necesariamente para enseñar).',
    modules: [
      {
        title: 'El camino del maestro interior',
        items: [
          'Qué es realmente la Maestría Reiki',
          'Conciencia, coherencia y servicio',
          'Humildad energética y responsabilidad',
        ],
      },
      {
        title: 'El símbolo de la Maestría',
        items: ['Significado profundo', 'Uso vibracional', 'Integración del símbolo maestro'],
      },
      {
        title: 'Sintonización / Iniciación Nivel III',
        items: [
          'Activación del símbolo maestro',
          'Expansión del canal energético',
          'Integración de la maestría',
        ],
      },
      {
        title: 'Reiki espiritual',
        items: [
          'Sanación del alma',
          'Alineación con el propósito',
          'Reiki y evolución de conciencia',
        ],
      },
      {
        title: 'Reiki como estilo de vida',
        items: ['Vivir en estado Reiki', 'Meditación y Reiki', 'Autosanación permanente'],
      },
      {
        title: 'Prácticas de alta vibración',
        items: [
          'Sesiones profundas',
          'Reiki a nivel espiritual',
          'Envíos energéticos conscientes',
        ],
      },
    ],
    msg: 'Hola Serenity 🙏, quiero información de la Formación de Reiki Usui — Nivel III (Shinpiden).',
  },
]

const FORMATIONS: Formation[] = [
  {
    id: 'reiki',
    label: 'Reiki Usui',
    title: 'Formación de Reiki Usui',
    intro:
      'Niveles I, II y III. Un camino de autosanación, conciencia y servicio: se abre tu canal, recibes los símbolos sagrados y llegas a la maestría interior.',
    color: '#E8A93C',
    levels: REIKI_LEVELS,
    msgAll:
      'Hola Serenity 🙏, quiero toda la información de la Formación de Reiki Usui (los 3 niveles).',
  },
  {
    id: 'akashicos',
    label: 'Registros Akáshicos',
    title: 'Formación de Registros Akáshicos',
    intro:
      'Tres niveles, 24 sesiones, un mismo viaje: aprender a leer la memoria de tu alma y la de quienes acompañas. Bajo la superficie de lo visible, tu sabiduría ancestral siempre estuvo ahí.',
    color: '#9B5DE5',
    levels: AKASHIC_LEVELS,
    msgAll:
      'Hola Serenity 🙏, quiero toda la información de la Formación de Registros Akáshicos (los 3 niveles).',
  },
]

/* ─── Panel de detalle del nivel ─── */

function LevelModal({
  level,
  color,
  formationTitle,
  onClose,
}: {
  level: Level
  color: string
  formationTitle: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${level.tag} · ${level.name}`}
    >
      <div className="absolute inset-0 bg-serenity-void/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] border text-serenity-cream shadow-2xl"
        style={{
          borderColor: `${color}55`,
          background:
            'radial-gradient(120% 90% at 0% 0%, #2D1547 0%, #1A0E2E 55%, #0F0A1C 100%)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-serenity-cream flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-7 sm:p-10">
          <p className="font-cinzel uppercase tracking-[0.24em] text-[11px]" style={{ color }}>
            {formationTitle}
          </p>

          <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1 mt-3">
            <h3 className="font-playfair italic text-3xl sm:text-4xl leading-tight">
              {level.name}
            </h3>
            {level.sanskrit && (
              <span className="font-cinzel text-lg" style={{ color }}>
                {level.sanskrit}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 mb-6">
            <span
              className="rounded-full px-3 py-1.5 text-[11px] font-cinzel uppercase tracking-[0.14em] border"
              style={{ color, borderColor: `${color}45`, background: `${color}14` }}
            >
              {level.tag}
            </span>
            <span className="text-xs text-serenity-mist/70">{level.meta}</span>
          </div>

          {/* Objetivo */}
          <div
            className="rounded-2xl border px-5 py-4 mb-8"
            style={{ borderColor: `${color}35`, background: `${color}12` }}
          >
            <h4 className="font-cinzel text-[10px] tracking-widest uppercase mb-2" style={{ color }}>
              Objetivo
            </h4>
            <p className="text-sm text-serenity-cream/90 leading-relaxed">{level.objective}</p>
          </div>

          {/* Contenido programático */}
          <h4 className="font-cinzel text-serenity-gold text-sm tracking-widest uppercase mb-5">
            Contenido programático
          </h4>
          <ol className="space-y-6 mb-9">
            {level.modules.map((m, i) => (
              <li key={m.title}>
                <div className="flex items-baseline gap-3 mb-2.5">
                  <span
                    className="font-playfair text-xl leading-none shrink-0"
                    style={{ color }}
                    aria-hidden="true"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h5 className="font-semibold text-serenity-cream leading-snug">{m.title}</h5>
                </div>
                <ul className="space-y-1.5 pl-9">
                  {m.items.map((it) => (
                    <li
                      key={it}
                      className="flex gap-2.5 text-sm text-serenity-cream/80 leading-snug"
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: color }}
                      />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <a
            href={wa(level.msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-serenity-ink font-semibold px-7 py-3.5 rounded-full transition-transform hover:scale-[1.03] active:scale-95"
            style={{ background: color }}
          >
            Quiero inscribirme <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}

/* ─── Sección ─── */

export default function Formations() {
  const [activeId, setActiveId] = useState(FORMATIONS[0].id)
  const [selected, setSelected] = useState<Level | null>(null)

  const formation = FORMATIONS.find((f) => f.id === activeId) ?? FORMATIONS[0]

  // Azar con semilla, no `Math.random`: el prerender y el navegador tienen
  // que generar las mismas partículas o React se queja al hidratar.
  const particles = useMemo(() => {
    let s = 20240815
    const rnd = () => {
      s = (s * 1664525 + 1013904223) % 4294967296
      return s / 4294967296
    }
    return Array.from({ length: 32 }, () => ({
      left: rnd() * 100,
      top: rnd() * 100,
      size: 1 + rnd() * 2.5,
      delay: rnd() * 6,
      dur: 5 + rnd() * 6,
      op: 0.25 + rnd() * 0.5,
    }))
  }, [])

  return (
    <section
      id="formaciones"
      className="relative overflow-hidden text-serenity-cream py-28 sm:py-36"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 0%, #2D1547 0%, #1A0E2E 45%, #0F0A1C 100%)',
      }}
    >
      <FlowerOfLife className="pointer-events-none absolute left-1/2 top-[8%] -translate-x-1/2 w-[680px] max-w-[140%] opacity-[0.16] animate-spin-slow" />

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              opacity: p.op,
              background: '#E8A93C',
              boxShadow: '0 0 8px 1px rgba(232,169,60,0.7)',
              animation: `floatY ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Reveal>
            <MetatronCube
              size={210}
              className="mx-auto -mt-4 mb-2 w-[210px] max-w-[56vw] h-auto"
            />
          </Reveal>
          <Reveal delay={60}>
            <p
              data-scroll-anchor
              className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4"
            >
              Formaciones
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">
              {formation.title}
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-5 text-base sm:text-lg text-serenity-mist">{formation.intro}</p>
          </Reveal>
        </div>

        {/* Selector de formación */}
        <Reveal delay={180}>
          <div
            className="flex flex-wrap justify-center gap-2 p-1.5 mx-auto mb-12 rounded-full border border-white/10 bg-white/5 w-fit"
            role="tablist"
            aria-label="Elige la formación"
          >
            {FORMATIONS.map((f) => {
              const isActive = f.id === activeId
              return (
                <button
                  key={f.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveId(f.id)}
                  className="rounded-full px-5 sm:px-7 py-3 text-sm font-semibold transition-colors"
                  style={
                    isActive
                      ? { background: f.color, color: '#241830' }
                      : { color: 'rgba(203,184,220,0.85)' }
                  }
                >
                  {f.label}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* Niveles */}
        <div className="grid md:grid-cols-3 gap-7">
          {formation.levels.map((lvl, i) => (
            <Reveal key={`${formation.id}-${lvl.tag}`} delay={i * 110}>
              <button
                onClick={() => setSelected(lvl)}
                aria-label={`Ver temario de ${lvl.tag} · ${lvl.name}`}
                className="group relative w-full h-full text-left rounded-[1.75rem] border p-8 flex flex-col backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{
                  borderColor: `${formation.color}40`,
                  background: `radial-gradient(130% 110% at 0% 0%, ${formation.color}1f, rgba(45,21,71,0.55) 62%)`,
                }}
              >
                <span
                  className="font-cinzel tracking-[0.25em] text-xs uppercase"
                  style={{ color: formation.color }}
                >
                  {lvl.tag}
                </span>

                <h3 className="font-playfair italic text-3xl sm:text-4xl mt-3 leading-tight">
                  {lvl.name}
                </h3>

                {lvl.sanskrit && (
                  <span className="font-cinzel text-sm mt-1" style={{ color: formation.color }}>
                    {lvl.sanskrit}
                  </span>
                )}

                <span className="text-serenity-mist text-sm mt-2">{lvl.meta}</span>

                <p className="mt-5 text-serenity-cream/80 text-sm leading-relaxed flex-1">
                  {lvl.tagline}
                </p>

                <span
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all"
                  style={{ color: formation.color }}
                >
                  Ver temario completo <span aria-hidden="true">→</span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-14 text-center">
            <a
              href={wa(formation.msgAll)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-serenity-ink font-semibold px-8 py-3.5 rounded-full hover:bg-serenity-cream transition-colors"
            >
              Recibe el temario completo
            </a>
          </div>
        </Reveal>
      </div>

      {selected && (
        <LevelModal
          level={selected}
          color={formation.color}
          formationTitle={formation.title}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  )
}
