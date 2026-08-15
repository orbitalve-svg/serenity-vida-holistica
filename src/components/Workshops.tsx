import { Heart, ShieldCheck, MessagesSquare, Wind } from 'lucide-react'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import ServiceOrb from './ServiceOrb'
import { wa } from '../lib/site'

interface Workshop {
  icon: typeof Heart
  /** color propio del encuentro */
  color: string
  tag: string
  title: string
  desc: string
  msg: string
}

const WORKSHOPS: Workshop[] = [
  {
    icon: Heart,
    color: '#5BB97A',
    tag: 'Taller',
    title: 'Sanación del Niño Interior',
    desc: 'El niño interior representa nuestras experiencias emocionales y psicológicas de la infancia que persisten en la adultez. Este taller se centra en sanar y comprender estas partes esenciales de nuestra psique.',
    msg: 'Hola Serenity 🙏, quiero información sobre el Taller de Sanación del Niño Interior.',
  },
  {
    icon: ShieldCheck,
    color: '#9B5DE5',
    tag: 'Charla',
    title: 'Papá, mi primer amor',
    desc: 'Desde la mirada sistémica: en las Constelaciones Familiares, el padre representa la autoridad, firmeza y decisión. De él tomas la fuerza para alcanzar tus objetivos y poner límites, y de esa relación elegimos a la pareja.',
    msg: 'Hola Serenity 🙏, quiero información sobre la charla "Papá, mi primer amor" desde la mirada sistémica.',
  },
  {
    icon: MessagesSquare,
    color: '#E8893C',
    tag: 'Conversatorio',
    title: 'Mis emociones, mis síntomas',
    desc: 'Es crucial comprender las emociones no procesadas, reprimidas y no expresadas, ya que generan estrés en nuestro organismo. El cuerpo habla lo que la mente calla: los conflictos internos encuentran su salida a través de síntomas físicos.',
    msg: 'Hola Serenity 🙏, quiero información sobre el conversatorio "Mis emociones, mis síntomas".',
  },
  {
    icon: Wind,
    color: '#3FA7D6',
    tag: 'Práctica grupal',
    title: 'Meditación Guiada',
    desc: 'La meditación guiada es una herramienta poderosa para calmar la mente, reducir el estrés y conectarnos con nuestro interior.',
    msg: 'Hola Serenity 🙏, quiero información sobre las sesiones de Meditación Guiada.',
  },
]

export default function Workshops() {
  return (
    <section className="relative bg-serenity-veil text-serenity-ink py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-serenity-gold/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <p className="font-cinzel uppercase tracking-[0.3em] text-serenity-purple text-xs sm:text-sm mb-4">
              Formaciones, Talleres y Charlas
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-5xl text-serenity-purple-deep leading-tight">
              Espacios para crecer en comunidad
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-base sm:text-lg text-serenity-ink/70">
              Como complemento de las terapias individuales, también ofrezco talleres, charlas y
              conversatorios sobre bienestar.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {WORKSHOPS.map((w, i) => (
            <Reveal key={w.title} delay={(i % 2) * 90}>
              <TiltCard
                max={7}
                className="group relative overflow-hidden flex flex-col rounded-3xl border p-7 shadow-sm transition-shadow duration-500"
                style={{
                  borderColor: `${w.color}45`,
                  background: `radial-gradient(120% 100% at 10% 0%, ${w.color}16 0%, #FFFFFF 55%)`,
                  boxShadow: `0 10px 30px -18px ${w.color}80`,
                }}
              >
                {/* Marca de agua de geometría sagrada */}
                <svg
                  viewBox="-50 -50 100 100"
                  className="pointer-events-none absolute -right-12 -bottom-14 w-48 h-48 opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.16] animate-spin-slow"
                  aria-hidden="true"
                >
                  <g fill="none" stroke={w.color} strokeWidth="1">
                    <circle r="24" />
                    <circle r="36" />
                    <circle r="46" strokeDasharray="2 6" />
                    {Array.from({ length: 6 }, (_, k) => (
                      <ellipse key={k} rx="13" ry="36" transform={`rotate(${k * 30})`} />
                    ))}
                  </g>
                </svg>

                <div
                  className="relative flex items-center gap-4 mb-4"
                  style={{ transform: 'translateZ(42px)' }}
                >
                  <ServiceOrb color={w.color} size={62}>
                    <w.icon size={24} strokeWidth={1.7} aria-hidden="true" />
                  </ServiceOrb>
                  <span
                    className="text-[11px] uppercase tracking-[0.2em] font-cinzel"
                    style={{ color: w.color }}
                  >
                    {w.tag}
                  </span>
                </div>
                <h3
                  className="relative font-playfair italic text-xl sm:text-2xl text-serenity-purple-deep mb-2.5 leading-snug"
                  style={{ transform: 'translateZ(24px)' }}
                >
                  {w.title}
                </h3>
                <p
                  className="relative text-sm text-serenity-ink/70 leading-relaxed flex-1"
                  style={{ transform: 'translateZ(12px)' }}
                >
                  {w.desc}
                </p>

                <span
                  className="relative mt-6 block h-px w-0 group-hover:w-full transition-all duration-500"
                  style={{
                    transform: 'translateZ(18px)',
                    background: `linear-gradient(to right, ${w.color}, transparent)`,
                  }}
                  aria-hidden="true"
                />

                <a
                  href={wa(w.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative mt-2 -mx-2 px-2 py-3 inline-flex items-center gap-1.5 text-sm font-semibold hover:gap-2.5 transition-all self-start rounded-xl"
                  style={{ transform: 'translateZ(30px)', color: w.color }}
                >
                  Quiero información <span aria-hidden="true">→</span>
                </a>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
