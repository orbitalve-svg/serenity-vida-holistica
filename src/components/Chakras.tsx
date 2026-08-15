import { useState, useEffect, useRef } from 'react'
import Reveal from './Reveal'
import ChakraDisc3D from './ChakraDisc3D'
import { wa } from '../lib/site'
import chakraFigure from '../assets/chakras-figure.webp'
import { playSolfeggio, stopSolfeggio } from '../hooks/useSolfeggio'

interface Chakra {
  name: string
  sanskrit: string
  location: string
  color: string
  petals: number
  bija: string
  element: string
  /** afirmación del chakra */
  affirmation: string
  crystal: string
  colorName: string
  gland: string
  sense: string
  body: string
  harmonize: string
  desc: string
  balanced: string
  blocked: string
  service: string
  serviceMsg: string
  /** frecuencia solfeggio en Hz */
  hz: number
}

const CHAKRAS: Chakra[] = [
  {
    name: 'Corona',
    sanskrit: 'Sahasrara',
    location: 'Coronilla',
    color: '#9B5DE5',
    petals: 12,
    bija: 'OM / Silencio',
    element: 'Pensamiento',
    affirmation: 'Entiendo',
    crystal: 'Cuarzo transparente',
    colorName: 'Violeta',
    gland: 'Pineal',
    sense: 'Conciencia',
    body: 'Cerebro y sistema nervioso',
    harmonize: 'Meditación, silencio y conexión espiritual.',
    desc: 'Conexión con lo divino, propósito superior y unidad. Cuando fluye, sientes confianza en la vida.',
    balanced: 'Sentido de propósito, fe y conexión espiritual.',
    blocked: 'Desconexión, escepticismo, sensación de vacío.',
    service: 'Registros Akáshicos',
    serviceMsg: 'Hola Serenity 🙏, quiero trabajar mi chakra Corona con los Registros Akáshicos.',
    hz: 963,
  },
  {
    name: 'Tercer Ojo',
    sanskrit: 'Ajna',
    location: 'Entrecejo',
    color: '#5B6BD6',
    petals: 2,
    bija: 'KSHAM / OM',
    element: 'Luz',
    affirmation: 'Veo',
    crystal: 'Amatista',
    colorName: 'Índigo',
    gland: 'Pituitaria',
    sense: 'Intuición',
    body: 'Ojos, frente y cerebro',
    harmonize: 'Visualización, meditación y amatista.',
    desc: 'Intuición, visión interior y claridad mental. Te ayuda a discernir y a confiar en tu sabiduría.',
    balanced: 'Intuición clara, imaginación y buen discernimiento.',
    blocked: 'Confusión, falta de claridad, exceso de mente.',
    service: 'Sanación Energética',
    serviceMsg: 'Hola Serenity 🙏, me interesa armonizar mi chakra Tercer Ojo (Sanación Energética).',
    hz: 852,
  },
  {
    name: 'Garganta',
    sanskrit: 'Vishuddha',
    location: 'Garganta',
    color: '#3FA7D6',
    petals: 16,
    bija: 'HAM',
    element: 'Éter',
    affirmation: 'Hablo',
    crystal: 'Aguamarina',
    colorName: 'Azul celeste',
    gland: 'Tiroides',
    sense: 'Oído',
    body: 'Garganta, cuello y tiroides',
    harmonize: 'Canto, mantras y expresión creativa.',
    desc: 'Comunicación auténtica y expresión de tu verdad. Libera lo que callaste y vuelve tu voz.',
    balanced: 'Expresión auténtica, escucha y creatividad.',
    blocked: 'Timidez, callar tu verdad, dificultad para expresarte.',
    service: 'Reiki',
    serviceMsg: 'Hola Serenity 🙏, quiero una sesión de Reiki para mi chakra Garganta.',
    hz: 741,
  },
  {
    name: 'Corazón',
    sanskrit: 'Anahata',
    location: 'Centro del pecho',
    color: '#5BB97A',
    petals: 12,
    bija: 'YAM',
    element: 'Aire',
    affirmation: 'Amo',
    crystal: 'Cuarzo rosa',
    colorName: 'Verde',
    gland: 'Timo',
    sense: 'Tacto',
    body: 'Corazón, pulmones y circulación',
    harmonize: 'Gratitud, cuarzo rosa y naturaleza.',
    desc: 'Amor, compasión y perdón. El puente entre lo físico y lo espiritual; aquí sanan los vínculos.',
    balanced: 'Amor, compasión, perdón y vínculos sanos.',
    blocked: 'Resentimiento, miedo a amar, duelos no resueltos.',
    service: 'Constelaciones Familiares',
    serviceMsg: 'Hola Serenity 🙏, quiero trabajar mi chakra Corazón con Constelaciones Familiares.',
    hz: 639,
  },
  {
    name: 'Plexo Solar',
    sanskrit: 'Manipura',
    location: 'Boca del estómago',
    color: '#E8C04B',
    petals: 10,
    bija: 'RAM',
    element: 'Fuego',
    affirmation: 'Hago',
    crystal: 'Citrino',
    colorName: 'Amarillo',
    gland: 'Páncreas',
    sense: 'Vista',
    body: 'Estómago, hígado y digestión',
    harmonize: 'Afirmaciones, luz del sol y citrino.',
    desc: 'Poder personal, voluntad y autoestima. Tu fuego interior, el motor de tus decisiones.',
    balanced: 'Confianza, voluntad y autoestima firme.',
    blocked: 'Inseguridad, control excesivo o falta de impulso.',
    service: 'Masaje Energético con Reiki',
    serviceMsg: 'Hola Serenity 🙏, me interesa el Masaje Energético con Reiki para mi Plexo Solar.',
    hz: 528,
  },
  {
    name: 'Sacro',
    sanskrit: 'Svadhisthana',
    location: 'Bajo el ombligo',
    color: '#E8893C',
    petals: 6,
    bija: 'VAM',
    element: 'Agua',
    affirmation: 'Siento',
    crystal: 'Cornalina',
    colorName: 'Naranja',
    gland: 'Gónadas',
    sense: 'Gusto',
    body: 'Caderas, vejiga y órganos reproductores',
    harmonize: 'Danza, contacto con el agua y creatividad.',
    desc: 'Creatividad, placer y emociones. La energía vital que te mueve a disfrutar y crear.',
    balanced: 'Creatividad, placer y emociones que fluyen.',
    blocked: 'Culpa, bloqueo creativo, emociones reprimidas.',
    service: 'Aromaterapia dōTERRA',
    serviceMsg: 'Hola Serenity 🙏, quiero Aromaterapia dōTERRA para mi chakra Sacro.',
    hz: 417,
  },
  {
    name: 'Raíz',
    sanskrit: 'Muladhara',
    location: 'Base de la columna',
    color: '#D6453F',
    petals: 4,
    bija: 'LAM',
    element: 'Tierra',
    affirmation: 'Soy',
    crystal: 'Jaspe rojo',
    colorName: 'Rojo',
    gland: 'Suprarrenales',
    sense: 'Olfato',
    body: 'Piernas, pies, huesos e intestino',
    harmonize: 'Caminar descalzo y contacto con la tierra.',
    desc: 'Seguridad, arraigo y supervivencia. Tus raíces: cuando está firme, te sientes a salvo y presente.',
    balanced: 'Seguridad, arraigo y presencia en el cuerpo.',
    blocked: 'Miedo, ansiedad, sensación de inestabilidad.',
    service: 'Limpieza y Armonización de Chakras',
    serviceMsg: 'Hola Serenity 🙏, quiero una Limpieza y Armonización de Chakras (chakra Raíz).',
    hz: 396,
  },
]

const CHAKRA_HOTSPOT = [
  { top: 24.4, left: 51 },
  { top: 33.6, left: 51 },
  { top: 42.1, left: 51 },
  { top: 51.0, left: 51 },
  { top: 59.8, left: 51 },
  { top: 68.3, left: 51 },
  { top: 76.8, left: 51 },
]

/** Yantra/mandala de un chakra: pétalos radiales + anillo grabado (acento del panel). */
function ChakraMandala({
  color,
  petals,
  size = 64,
}: {
  color: string
  petals: number
  size?: number
}) {
  const shown = Math.min(petals, 16)
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" aria-hidden="true">
      <circle cx="0" cy="0" r="42" fill="none" stroke={color} strokeOpacity="0.5" strokeWidth="2" />
      <g>
        {Array.from({ length: shown }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-28"
            rx="6.5"
            ry="18"
            fill={color}
            fillOpacity="0.85"
            transform={`rotate(${(360 / shown) * i})`}
          />
        ))}
      </g>
      <circle cx="0" cy="0" r="13" fill="#FBF6EC" fillOpacity="0.92" />
      <circle cx="0" cy="0" r="7" fill={color} />
    </svg>
  )
}

export default function Chakras() {
  const [active, setActive] = useState(3) // Corazón por defecto
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  const c = CHAKRAS[active]

  // Stop sound when component unmounts
  useEffect(() => {
    return () => { stopSolfeggio(); playingRef.current = false }
  }, [])

  const handleChakraSelect = (idx: number) => {
    setActive(idx)
    // If sound is playing, switch to new chakra's frequency immediately
    if (playingRef.current) {
      playSolfeggio(CHAKRAS[idx].hz)
    }
  }

  const toggleSound = () => {
    if (playingRef.current) {
      stopSolfeggio()
      playingRef.current = false
      setPlaying(false)
    } else {
      playSolfeggio(c.hz)
      playingRef.current = true
      setPlaying(true)
    }
  }

  return (
    <section
      id="chakras"
      className="relative overflow-hidden text-serenity-cream py-28 sm:py-36"
      style={{ background: 'radial-gradient(120% 80% at 50% 18%, #20122F 0%, #150B26 48%, #0F0A1C 100%)' }}
    >
      {/* halo de fondo tras la figura */}
      <div
        className="pointer-events-none absolute left-1/2 lg:left-[27%] top-1/2 -translate-x-1/2 -translate-y-1/2 chakra-spin"
        style={{
          width: 560,
          height: 560,
          opacity: 0.16,
          background:
            'conic-gradient(from 0deg, #9B5DE5, #5B6BD6, #3FA7D6, #5BB97A, #E8C04B, #E8893C, #D6453F, #9B5DE5)',
          filter: 'blur(70px)',
          borderRadius: '50%',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Reveal>
            <p data-scroll-anchor className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4">
              Energía en Equilibrio
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">Los 7 Chakras</h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-5 text-base sm:text-lg text-serenity-mist">
              Recorre tu columna de energía: toca cada centro para descubrir qué gobierna, cómo se
              siente en equilibrio y la terapia de Serenity que lo acompaña.
            </p>
          </Reveal>
        </div>

        <div className="grid lg:grid-cols-[minmax(300px,420px)_1fr] gap-12 lg:gap-16 items-center">
          {/* Figura con los chakras como puntos interactivos */}
          <Reveal className="mx-auto w-full">
            <div className="relative mx-auto select-none" style={{ width: 'min(330px, 84vw)' }}>
              <img
                src={chakraFigure}
                alt="Figura en meditación con los siete chakras"
                className="w-full h-auto block pointer-events-none"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              {CHAKRAS.map((ch, i) => {
                const isActive = i === active
                const pos = CHAKRA_HOTSPOT[i]
                return (
                  <button
                    key={ch.sanskrit}
                    onClick={() => handleChakraSelect(i)}
                    aria-pressed={isActive}
                    aria-label={`${ch.name} · ${ch.sanskrit}`}
                    title={`${ch.name} · ${ch.sanskrit}`}
                    className="absolute -translate-x-1/2 -translate-y-1/2 grid place-items-center rounded-full transition-transform duration-300 hover:scale-110 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    style={{ top: `${pos.top}%`, left: `${pos.left}%`, width: '17%', height: '9.5%' }}
                  >
                    <span
                      className={`rounded-full transition-all duration-300 ${isActive ? 'chakra-breathe' : ''}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        boxShadow: isActive
                          ? `0 0 0 2px ${ch.color}, 0 0 24px 5px ${ch.color}cc`
                          : 'none',
                        background: isActive ? `${ch.color}26` : 'transparent',
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </Reveal>

          {/* Panel de detalle */}
          <Reveal delay={120}>
            <div
              className="relative rounded-[2rem] border p-8 sm:p-10 transition-colors duration-500"
              style={{
                borderColor: `${c.color}55`,
                background: `radial-gradient(130% 130% at 100% 0%, ${c.color}22, rgba(15,10,28,0.5) 62%)`,
              }}
            >
              <div className="flex items-center gap-5 mb-6">
                <ChakraDisc3D color={c.color} petals={c.petals} size={86} />
                <div>
                  <span
                    className="block text-[11px] uppercase tracking-[0.25em] font-cinzel"
                    style={{ color: c.color }}
                  >
                    {c.element} · “{c.affirmation}”
                  </span>
                  <h3 className="font-playfair italic text-3xl sm:text-4xl mt-1" style={{ color: c.color }}>
                    {c.sanskrit}
                  </h3>
                  <p className="text-serenity-mist text-sm mt-1">
                    {c.name} · {c.location}
                  </p>
                </div>
              </div>

              <p className="text-serenity-cream/85 leading-relaxed mb-6">{c.desc}</p>

              <div className="grid sm:grid-cols-2 gap-3 mb-5">
                <div
                  className="rounded-2xl border px-4 py-3.5"
                  style={{ borderColor: `${c.color}40`, background: `${c.color}14` }}
                >
                  <p className="text-[11px] uppercase tracking-widest mb-1.5" style={{ color: c.color }}>
                    En equilibrio
                  </p>
                  <p className="text-sm text-serenity-cream/85 leading-snug">{c.balanced}</p>
                </div>
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5">
                  <p className="text-[11px] uppercase tracking-widest text-serenity-mist/70 mb-1.5">
                    Señales de bloqueo
                  </p>
                  <p className="text-sm text-serenity-cream/80 leading-snug">{c.blocked}</p>
                </div>
              </div>

              {/* Ficha energética */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden border border-white/10 mb-5">
                {([
                  ['Color', c.colorName],
                  ['Glándula', c.gland],
                  ['Sentido', c.sense],
                  ['Mantra', c.bija],
                ] as const).map((row) => (
                  <div key={row[0]} className="bg-white/[0.04] px-3.5 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-serenity-mist/60 mb-1">
                      {row[0]}
                    </p>
                    <p className="text-sm leading-snug" style={{ color: c.color }}>
                      {row[1]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 mb-5">
                <p className="text-[11px] uppercase tracking-widest text-serenity-mist/70 mb-1.5">
                  Zona del cuerpo
                </p>
                <p className="text-sm text-serenity-cream/85 leading-snug">{c.body}</p>
              </div>

              {/* Baño de sonido solfeggio */}
              <div
                className="flex items-center gap-4 rounded-2xl px-5 py-4 mb-4 border"
                style={{ borderColor: `${c.color}45`, background: `${c.color}14` }}
              >
                <button
                  onClick={toggleSound}
                  aria-label={playing ? 'Detener sonido' : 'Reproducir frecuencia solfeggio'}
                  className="relative flex-shrink-0 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  style={{ borderColor: c.color, background: playing ? c.color : 'transparent' }}
                >
                  {playing ? (
                    // Pause icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <rect x="2" y="2" width="4" height="10" rx="1" fill={playing ? '#0F0A1C' : c.color} />
                      <rect x="8" y="2" width="4" height="10" rx="1" fill={playing ? '#0F0A1C' : c.color} />
                    </svg>
                  ) : (
                    // Play icon
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 2L12 7L3 12V2Z" fill={c.color} />
                    </svg>
                  )}
                  {/* Pulse ring when playing */}
                  {playing && (
                    <span
                      className="absolute inset-0 rounded-full chakra-breathe"
                      style={{ boxShadow: `0 0 0 4px ${c.color}40`, border: 'none' }}
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] uppercase tracking-widest mb-0.5" style={{ color: c.color }}>
                    Frecuencia Solfeggio
                  </p>
                  <p className="text-serenity-cream text-sm font-medium">
                    {c.hz} Hz · {c.name}
                    <span className="text-serenity-mist/60 font-normal ml-2 text-xs">
                      {playing ? '— sonando ·  ·  · ' : '— toca para escuchar'}
                    </span>
                  </p>
                </div>
              </div>

              <div
                className="flex items-start gap-3 rounded-2xl px-4 py-3.5 mb-7 border"
                style={{ borderColor: `${c.color}40`, background: `${c.color}12` }}
              >
                <span className="mt-0.5 shrink-0" style={{ filter: `drop-shadow(0 0 6px ${c.color})` }}>
                  <ChakraMandala color={c.color} petals={c.petals} size={26} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: c.color }}>
                    Cómo armonizarlo
                  </p>
                  <p className="text-sm text-serenity-cream/85 leading-snug">
                    {c.harmonize} <span className="text-serenity-mist">Cristal: {c.crystal}.</span>
                  </p>
                </div>
              </div>

              <div
                className="flex flex-wrap items-center gap-3 border-t border-white/10"
                style={{ paddingTop: '1.25rem' }}
              >
                <span className="text-sm text-serenity-mist">
                  Terapia sugerida:{' '}
                  <span className="text-serenity-cream font-medium">{c.service}</span>
                </span>
                <a
                  href={wa(c.serviceMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-serenity-ink px-5 py-3.5 rounded-full transition-transform hover:scale-[1.03] ml-auto"
                  style={{ background: c.color }}
                >
                  Agendar →
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
