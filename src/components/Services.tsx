import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Reveal from './Reveal'
import TiltCard from './TiltCard'
import ServiceIcon from './ServiceIcon'
import ServiceOrb from './ServiceOrb'
import type { ServiceIconName } from './ServiceIcon'
import { wa } from '../lib/site'

interface Service {
  icon: ServiceIconName
  /** color propio de la terapia, según el chakra que trabaja */
  color: string
  title: string
  desc: string
  /** duración y modalidad */
  meta: string
  /** de qué trata, a detalle */
  long: string
  /** cómo es la sesión / qué esperar */
  expect: string
  /** lo que puedes lograr */
  benefits: string[]
  msg: string
}

const SERVICES: Service[] = [
  {
    icon: 'reiki',
    color: '#9B5DE5',
    title: 'Reiki Presencial y a Distancia',
    desc: 'Imposición de manos para transmitir energía universal y equilibrar los centros energéticos del cuerpo.',
    meta: '1 hora aprox. · Presencial o a distancia',
    long: 'El Reiki consiste en la imposición de manos para transmitir energía universal y, de esta manera, equilibrar los centros energéticos del cuerpo conocidos como chakras. Es una terapia suave y no invasiva que puedes recibir en el consultorio o a distancia, con la misma efectividad.',
    expect:
      'Te recuestas vestido/a mientras impongo las manos sobre tus principales centros energéticos. Es común sentir calor, hormigueo o una relajación muy profunda.',
    benefits: [
      'Calma y alivia el estrés y la ansiedad',
      'Activa el sistema inmune y ayuda en el tratamiento de la enfermedad',
      'Ayuda en el tratamiento para la eliminación de adicciones y hábitos indeseables',
      'Promueve la armonía y el equilibrio',
      'Te permite dormir mejor',
      'Ayuda al crecimiento espiritual y a la limpieza emocional',
      'Ayuda a tratar la depresión',
    ],
    msg: 'Hola Serenity 🙏, quiero agendar una sesión de Reiki (presencial o a distancia).',
  },
  {
    icon: 'masaje',
    color: '#E8893C',
    title: 'Masaje Energético con Reiki',
    desc: 'Masaje relajante y estimulante combinado con una sesión de Reiki que desbloquea tus chakras y alivia el dolor.',
    meta: '1 hora y media aprox. · Presencial',
    long: 'Aplico un masaje relajante y estimulante en todo el cuerpo, utilizando aceites esenciales, música e inciensos que armonizan tus sentidos. Al mismo tiempo, realizo una sesión de Reiki que canaliza la energía universal hacia los puntos clave de tu cuerpo, desbloqueando los chakras, aliviando el dolor y sanando las emociones.',
    expect:
      'Combinamos maniobras suaves de masaje con imposición de manos sobre los puntos de mayor tensión, acompañadas de aceites esenciales, música e inciensos.',
    benefits: [
      'Liberación de tensión muscular y bloqueos energéticos',
      'Mejora de la circulación sanguínea',
      'Promoción de la relajación profunda',
    ],
    msg: 'Hola Serenity 🙏, me interesa el Masaje Energético con Reiki.',
  },
  {
    icon: 'chakra',
    color: '#C9A84C',
    title: 'Limpieza y Armonización de Chakras',
    desc: 'Analiza cada uno de tus centros energéticos principales y desbloquea y armoniza aquello que lo necesite.',
    meta: '1 hora aprox. · Presencial o a distancia',
    long: 'La terapia de los chakras analiza cada uno de estos centros energéticos principales y desbloquea y armoniza aquello que pudieran necesitar. Es una terapia muy sutil pero de grandes consecuencias para la vida de las personas, que irán notando sus efectos a lo largo de los días sucesivos.',
    expect:
      'Evaluación energética de cada chakra y armonización con Reiki. Al cierre te comparto recomendaciones para sostener el equilibrio.',
    benefits: [
      'Reducción del estrés y la ansiedad',
      'Mejora de la salud física',
      'Aumento de la energía y la vitalidad',
      'Mayor claridad mental e intuición',
      'Sensación de conexión con uno mismo y con el mundo exterior',
    ],
    msg: 'Hola Serenity 🙏, quiero una sesión de Limpieza y Armonización de Chakras.',
  },
  {
    icon: 'tree',
    color: '#5BB97A',
    title: 'Constelaciones Familiares y Coaching Sistémico',
    desc: 'Sana las heridas y los conflictos que se originan en el seno de la familia y se transmiten de generación en generación.',
    meta: '2 horas y media aprox. · Presencial y online',
    long: 'Las Constelaciones Familiares son una forma de terapia que busca sanar las heridas y los conflictos que se originan en el seno de la familia, y que se transmiten de generación en generación. El coaching sistémico integra esos hallazgos en tu vida diaria.',
    expect:
      'Sesión individual o en grupo, trabajando con representantes o figuras que reflejan tu sistema familiar. Acompañamiento para sostener los cambios.',
    benefits: [
      'Resuelven dificultades en las relaciones de pareja, familiares o laborales',
      'Ayudan a sanar traumas, duelos, enfermedades, adicciones, miedos y bloqueos',
      'Abordan el problema desde la raíz: la familia',
      'Mejoran las relaciones familiares',
    ],
    msg: 'Hola Serenity 🙏, me interesan las Constelaciones Familiares / Coaching Sistémico.',
  },
  {
    icon: 'lotus',
    color: '#5B6BD6',
    title: 'Lectura de Registros Akáshicos',
    desc: 'Una técnica holística que te ayuda a conectar con tu sabiduría interior y con tus guías espirituales.',
    meta: '2 horas y media aprox. · Presencial y online',
    long: 'La terapia de Registros Akáshicos es una técnica holística que te ayuda a conectar con tu sabiduría interior y con tus guías espirituales, accediendo al registro de memorias de tu alma.',
    expect:
      'Sesión guiada de conexión y lectura de tu Registro personal; al cierre integramos juntas los mensajes recibidos.',
    benefits: [
      'Aumentar tu autoconocimiento y autoestima',
      'Descubrir tus dones y talentos',
      'Resolver conflictos y problemas',
      'Sanar heridas emocionales',
      'Liberar karmas y patrones repetitivos',
      'Potenciar tu intuición y creatividad',
      'Conectar con tu esencia divina',
    ],
    msg: 'Hola Serenity 🙏, quiero agendar una Lectura de Registros Akáshicos.',
  },
  {
    icon: 'spiral',
    color: '#3FA7D6',
    title: 'Hipnosis de Regresión a Vidas Pasadas',
    desc: 'Explora tus encarnaciones previas para ir a la raíz del problema y liberar miedos, culpas y sufrimientos.',
    meta: '2 horas y media aprox. · Presencial',
    long: 'La hipnosis de regresión a vidas pasadas es una técnica terapéutica que permite explorar las encarnaciones previas del alma. Va a la raíz del problema liberando miedos, culpas y sufrimientos: ir al pasado para sanar el presente.',
    expect:
      'Sesión guiada de hipnosis en un estado profundo de relajación consciente, acompañando la exploración de las memorias que emerjan.',
    benefits: [
      'Autoconocimiento profundo',
      'Resolución de problemas arraigados: fobias, traumas, bloqueos emocionales',
      'Conexiones significativas',
      'Perspectiva sobre la muerte y liberación del miedo',
    ],
    msg: 'Hola Serenity 🙏, quiero agendar una sesión de Hipnosis de Regresión a Vidas Pasadas.',
  },
]

/** Panel de detalle de una terapia. */
function ServiceModal({ service, onClose }: { service: Service; onClose: () => void }) {
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
      aria-label={service.title}
    >
      <div className="absolute inset-0 bg-serenity-void/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] sm:rounded-[2rem] border border-serenity-gold/40 text-serenity-cream shadow-2xl"
        style={{
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
          <div className="flex items-center gap-4 mb-2 flex-wrap">
            <div
              className="w-[74px] h-[74px] rounded-full flex items-center justify-center shrink-0 border"
              style={{
                borderColor: `${service.color}55`,
                background: `radial-gradient(circle at 32% 26%, ${service.color}55 0%, ${service.color}22 45%, transparent 78%)`,
                boxShadow: `0 0 26px ${service.color}40, inset 0 4px 10px ${service.color}30`,
              }}
            >
              <ServiceIcon
                name={service.icon}
                size={34}
                strokeWidth={1.55}
                gradient={['#FBF6EC', service.color]}
              />
            </div>
            <span
              className="inline-block text-[11px] uppercase tracking-[0.2em] font-cinzel rounded-full px-3 py-1.5 border"
              style={{
                color: service.color,
                borderColor: `${service.color}45`,
                background: `${service.color}14`,
              }}
            >
              {service.meta}
            </span>
          </div>
          <h3 className="font-playfair italic text-3xl sm:text-4xl text-serenity-cream mt-4 mb-5 leading-tight">
            {service.title}
          </h3>
          <p className="text-serenity-cream/85 leading-relaxed mb-7">{service.long}</p>

          <h4 className="font-cinzel text-serenity-gold text-sm tracking-widest uppercase mb-3">
            Lo que puedes lograr
          </h4>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
            {service.benefits.map((b) => (
              <li key={b} className="flex gap-2.5 text-sm text-serenity-cream/90 leading-snug">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-serenity-gold shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 mb-8">
            <h4 className="font-cinzel text-serenity-gold/90 text-xs tracking-widest uppercase mb-2">
              Cómo es la sesión
            </h4>
            <p className="text-sm text-serenity-cream/80 leading-relaxed">{service.expect}</p>
          </div>

          <a
            href={wa(service.msg)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-serenity-gold text-serenity-ink font-semibold px-7 py-3.5 rounded-full hover:bg-serenity-gold-light transition-colors"
          >
            Agendar esta terapia <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Services() {
  const [selected, setSelected] = useState<Service | null>(null)

  return (
    <section id="servicios" className="relative bg-serenity-veil text-serenity-ink py-24 sm:py-32">
      {/* separador suave desde la sección anterior */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-serenity-gold/40 to-transparent" />
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <p data-scroll-anchor className="font-cinzel uppercase tracking-[0.3em] text-serenity-purple text-xs sm:text-sm mb-4">
              Nuestras Terapias
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-5xl text-serenity-purple-deep leading-tight">
              Caminos para volver a tu centro
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-base sm:text-lg text-serenity-ink/70">
              Toca cada terapia para descubrir de qué trata y lo que puedes lograr con ella.
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => {
            // `meta` guarda «duración · modalidad»; en la tarjeta van separadas.
            const [duration, modality] = s.meta.split('·').map((t) => t.trim())
            return (
              <Reveal key={s.title} delay={(i % 3) * 90}>
                <TiltCard
                  onClick={() => setSelected(s)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Ver detalle de ${s.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelected(s)
                    }
                  }}
                  className="group relative overflow-hidden flex flex-col rounded-3xl border p-7 cursor-pointer shadow-sm transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-serenity-purple/50"
                  style={{
                    borderColor: `${s.color}45`,
                    background: `radial-gradient(125% 100% at 12% 0%, ${s.color}16 0%, #FFFFFF 58%)`,
                    boxShadow: `0 10px 30px -18px ${s.color}80`,
                  }}
                >
                  {/* Marca de agua de geometría sagrada */}
                  <svg
                    viewBox="-50 -50 100 100"
                    className="pointer-events-none absolute -right-10 -bottom-12 w-44 h-44 opacity-[0.07] transition-opacity duration-500 group-hover:opacity-[0.16] animate-spin-slow"
                    aria-hidden="true"
                  >
                    <g fill="none" stroke={s.color} strokeWidth="1">
                      <circle r="22" />
                      <circle r="34" />
                      <circle r="45" strokeDasharray="2 6" />
                      {Array.from({ length: 6 }, (_, k) => (
                        <ellipse key={k} rx="12" ry="34" transform={`rotate(${k * 30})`} />
                      ))}
                    </g>
                  </svg>

                  <div className="relative mb-5" style={{ transform: 'translateZ(48px)' }}>
                    <ServiceOrb icon={s.icon} color={s.color} size={78} />
                  </div>

                  <h3
                    className="relative font-cinzel text-lg text-serenity-purple-deep mb-2 leading-snug"
                    style={{ transform: 'translateZ(28px)' }}
                  >
                    {s.title}
                  </h3>

                  {/* Duración y modalidad, antes sólo visibles dentro del detalle.
                      Van en dos fichas para que al envolverse no se parta el texto. */}
                  <div
                    className="relative flex flex-wrap items-center gap-2 mb-3.5"
                    style={{ transform: 'translateZ(22px)' }}
                  >
                    <span
                      className="rounded-full px-2.5 py-1 text-[11px] font-cinzel uppercase tracking-[0.1em] border whitespace-nowrap"
                      style={{
                        color: s.color,
                        borderColor: `${s.color}55`,
                        background: `${s.color}12`,
                      }}
                    >
                      {duration}
                    </span>
                    <span className="text-[11px] text-serenity-ink/45">{modality}</span>
                  </div>

                  <p
                    className="relative text-sm text-serenity-ink/70 leading-relaxed flex-1"
                    style={{ transform: 'translateZ(14px)' }}
                  >
                    {s.desc}
                  </p>

                  {/* Filo de luz que se despliega al pasar el cursor */}
                  <span
                    className="relative mt-6 block h-px w-0 group-hover:w-full transition-all duration-500"
                    style={{
                      transform: 'translateZ(20px)',
                      background: `linear-gradient(to right, ${s.color}, transparent)`,
                    }}
                    aria-hidden="true"
                  />

                  <span
                    className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold group-hover:gap-2.5 transition-all self-start"
                    style={{ transform: 'translateZ(32px)', color: s.color }}
                  >
                    Ver detalle <span aria-hidden="true">→</span>
                  </span>
                </TiltCard>
              </Reveal>
            )
          })}
        </div>
      </div>

      {selected && <ServiceModal service={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}
