import { useEffect, useState } from 'react'
import { saveMemory } from '../lib/memory'
import Reveal from './Reveal'
import { wa } from '../lib/site'

interface Option {
  label: string
  chakra: number // 0=Corona 1=TercerOjo 2=Garganta 3=Corazon 4=Plexo 5=Sacro 6=Raiz
}

interface Question {
  q: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    q: '¿Qué emoción aparece con más frecuencia en tu vida?',
    options: [
      { label: 'Ansiedad, miedo o sensación de que el suelo no es firme', chakra: 6 },
      { label: 'Culpa, vergüenza o bloqueo para sentir placer y alegría', chakra: 5 },
      { label: 'Inseguridad, baja autoestima o necesidad de controlarlo todo', chakra: 4 },
      { label: 'Resentimiento, duelos sin cerrar o dificultad para dar y recibir amor', chakra: 3 },
    ],
  },
  {
    q: '¿Dónde sientes más tensión o malestar en tu cuerpo?',
    options: [
      { label: 'Piernas, espalda baja, pies o huesos — sensación de pesadez', chakra: 6 },
      { label: 'Cadera, abdomen bajo, problemas hormonales o de vejiga', chakra: 5 },
      { label: 'Estómago, digestión, hígado o boca del estómago tensa', chakra: 4 },
      { label: 'Pecho, corazón, pulmones o dificultad para respirar profundo', chakra: 3 },
    ],
  },
  {
    q: '¿Cuál de estas frases te resuena más hoy?',
    options: [
      { label: '"Me cuesta confiar en que las cosas van a estar bien"', chakra: 6 },
      { label: '"Me bloqueo cuando quiero crear, fluir o disfrutar"', chakra: 5 },
      { label: '"Callo lo que siento porque temo no ser aceptado/a"', chakra: 2 },
      { label: '"No sé bien cuál es mi propósito en esta vida"', chakra: 0 },
    ],
  },
  {
    q: '¿Cómo describirías tu relación con los demás?',
    options: [
      { label: 'Me cuesta confiar en que el otro/a va a quedarse', chakra: 6 },
      { label: 'Doy mucho más de lo que recibo y no sé cómo pedir', chakra: 3 },
      { label: 'Me cuesta decir lo que siento, me malentienden con frecuencia', chakra: 2 },
      { label: 'Me siento solo/a aunque esté rodeado/a de personas', chakra: 1 },
    ],
  },
  {
    q: 'Cuando enfrentas decisiones importantes...',
    options: [
      { label: 'Me paralizo por miedo a perder lo que tengo', chakra: 6 },
      { label: 'Me cuesta confiar en mí mismo/a y busco validación externa', chakra: 4 },
      { label: 'Prefiero callar lo que quiero para evitar conflictos', chakra: 2 },
      { label: 'Dudo de mis percepciones e intuiciones constantemente', chakra: 1 },
    ],
  },
  {
    q: '¿Qué aspecto de tu vida sientes más bloqueado ahora?',
    options: [
      { label: 'La estabilidad económica y la seguridad material', chakra: 6 },
      { label: 'Mi creatividad, vitalidad o capacidad de disfrutar', chakra: 5 },
      { label: 'Mi fuerza interior, autoestima o poder de decisión', chakra: 4 },
      { label: 'Mis vínculos afectivos, familia o pareja', chakra: 3 },
    ],
  },
  {
    q: '¿Qué deseo sientes con más fuerza en este momento?',
    options: [
      { label: 'Sentirme seguro/a, con raíces firmes y presente en mi cuerpo', chakra: 6 },
      { label: 'Confiar en mi intuición y ver el camino con más claridad', chakra: 1 },
      { label: 'Encontrar mi propósito y sentirme conectado/a a algo superior', chakra: 0 },
      { label: 'Sanar mis vínculos y aprender a recibir amor libremente', chakra: 3 },
    ],
  },
]

const CHAKRAS = [
  {
    name: 'Corona',
    sanskrit: 'Sahasrara',
    color: '#9B5DE5',
    element: 'Pensamiento',
    affirmation: 'Soy uno con el universo. Confío en el flujo divino de la vida.',
    crystal: 'Cuarzo transparente',
    service: 'Registros Akáshicos',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es la Corona (Sahasrara). Me gustaría agendar una sesión de Registros Akáshicos.',
    desc: 'Tu chakra Corona pide atención. Hay desconexión de tu propósito más alto, un vacío espiritual o la sensación de que la vida debería tener un sentido más profundo. Es hora de abrir el canal hacia lo superior.',
    petals: 12,
  },
  {
    name: 'Tercer Ojo',
    sanskrit: 'Ajna',
    color: '#5B6BD6',
    element: 'Luz',
    affirmation: 'Confío en mi visión interior. Mi intuición me guía con claridad y sabiduría.',
    crystal: 'Amatista',
    service: 'Sanación Energética',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es el Tercer Ojo (Ajna). Me gustaría una sesión de Sanación Energética.',
    desc: 'Tu Tercer Ojo necesita activarse. La mente no para, dudas de tu intuición y el camino se ve confuso. Es momento de callar el ruido mental y reconectar con la sabiduría que ya está en ti.',
    petals: 2,
  },
  {
    name: 'Garganta',
    sanskrit: 'Vishuddha',
    color: '#3FA7D6',
    element: 'Éter',
    affirmation: 'Expreso mi verdad con amor y claridad. Mi voz tiene valor y merece ser escuchada.',
    crystal: 'Aguamarina',
    service: 'Reiki Presencial y a Distancia',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es la Garganta (Vishuddha). Me gustaría una sesión de Reiki.',
    desc: 'Tu chakra Garganta lleva el peso de palabras no dichas, verdades guardadas y una voz que aprendió a silenciarse. Tu alma necesita expresarse y ser escuchada en su verdad más profunda.',
    petals: 16,
  },
  {
    name: 'Corazón',
    sanskrit: 'Anahata',
    color: '#5BB97A',
    element: 'Aire',
    affirmation: 'Soy digno/a de amor. Doy y recibo con el corazón abierto y libre.',
    crystal: 'Cuarzo rosa',
    service: 'Constelaciones Familiares',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es el Corazón (Anahata). Me gustaría una sesión de Constelaciones Familiares.',
    desc: 'Tu chakra Corazón carga heridas que aún esperan sanar. Duelos, resentimientos o el miedo a amar y ser amado/a ocupan el espacio que le pertenece al amor libre. Es hora de liberar ese peso.',
    petals: 12,
  },
  {
    name: 'Plexo Solar',
    sanskrit: 'Manipura',
    color: '#E8C04B',
    element: 'Fuego',
    affirmation: 'Confío en mí mismo/a. Mi poder personal está aquí, firme y disponible.',
    crystal: 'Citrino',
    service: 'Masaje Energético con Reiki',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es el Plexo Solar (Manipura). Me gustaría un Masaje Energético con Reiki.',
    desc: 'Tu fuego interior necesita reavivarse. El Plexo Solar carga inseguridad, baja autoestima o la necesidad de controlarlo todo desde el miedo. Tu poder personal está ahí, esperando ser reclamado.',
    petals: 10,
  },
  {
    name: 'Sacro',
    sanskrit: 'Svadhisthana',
    color: '#E8893C',
    element: 'Agua',
    affirmation: 'Fluyo con la vida. Mi creatividad y mi alegría son sagradas.',
    crystal: 'Cornalina',
    service: 'Aromaterapia dōTERRA',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es el Sacro (Svadhisthana). Me gustaría una sesión de Aromaterapia dōTERRA.',
    desc: 'Tu chakra Sacro está bloqueado. La energía creativa no fluye con libertad, el placer de vivir se siente lejano y cargás culpa o vergüenza en el cuerpo. Es hora de soltar y volver a moverte.',
    petals: 6,
  },
  {
    name: 'Raíz',
    sanskrit: 'Muladhara',
    color: '#D6453F',
    element: 'Tierra',
    affirmation: 'Estoy seguro/a. Mis raíces son fuertes y la tierra me sostiene siempre.',
    crystal: 'Jaspe rojo',
    service: 'Limpieza y Armonización de Chakras',
    serviceMsg:
      'Hola Serenity 🙏, hice el quiz energético y mi chakra a sanar es la Raíz (Muladhara). Me gustaría una sesión de Limpieza y Armonización de Chakras.',
    desc: 'Tu chakra Raíz pide atención urgente. Vives en estado de alerta, sientes el suelo moverse bajo tus pies y el miedo o la ansiedad son compañeros frecuentes. Es hora de volver a la tierra.',
    petals: 4,
  },
]

function ChakraMandala({
  color,
  petals,
  size = 90,
  spin = false,
}: {
  color: string
  petals: number
  size?: number
  spin?: boolean
}) {
  const shown = Math.min(petals, 16)
  return (
    <svg
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      aria-hidden="true"
      className={spin ? 'chakra-spin' : ''}
    >
      <circle cx="0" cy="0" r="44" fill="none" stroke={color} strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="0" cy="0" r="36" fill="none" stroke={color} strokeOpacity="0.2" strokeWidth="0.8" />
      <g>
        {Array.from({ length: shown }).map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-26"
            rx="6"
            ry="16"
            fill={color}
            fillOpacity="0.85"
            transform={`rotate(${(360 / shown) * i})`}
          />
        ))}
      </g>
      <circle cx="0" cy="0" r="12" fill="#FBF6EC" fillOpacity="0.95" />
      <circle cx="0" cy="0" r="6.5" fill={color} />
    </svg>
  )
}

type Step = 'intro' | 'quiz' | 'result'

export default function ChakraQuiz() {
  const [step, setStep] = useState<Step>('intro')
  const [current, setCurrent] = useState(0)
  const [scores, setScores] = useState<number[]>(Array(7).fill(0))
  const [chosen, setChosen] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  const total = QUESTIONS.length

  const handleAnswer = (chakraIdx: number) => {
    if (transitioning) return
    setChosen(chakraIdx)
    setTransitioning(true)

    const next = [...scores]
    next[chakraIdx] += 1

    setTimeout(() => {
      setScores(next)
      setChosen(null)
      setTransitioning(false)
      if (current < total - 1) {
        setCurrent((c) => c + 1)
      } else {
        setStep('result')
      }
    }, 650)
  }

  const resultIdx = scores.indexOf(Math.max(...scores))
  const result = CHAKRAS[resultIdx]

  // Al llegar al resultado lo recordamos, para reconocer a la persona al volver.
  useEffect(() => {
    if (step !== 'result') return
    saveMemory({
      chakra: result.name,
      chakraSanskrit: result.sanskrit,
      chakraColor: result.color,
    })
  }, [step, result])

  const reset = () => {
    setStep('intro')
    setCurrent(0)
    setScores(Array(7).fill(0))
    setChosen(null)
  }

  return (
    <section
      id="quiz"
      className="relative overflow-hidden text-serenity-cream py-24 sm:py-32"
      style={{
        background:
          'radial-gradient(ellipse 120% 80% at 50% 0%, #1E0F35 0%, #120A22 50%, #0F0A1C 100%)',
      }}
    >
      {/* Anillo decorativo de fondo */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 chakra-spin opacity-[0.05]"
        style={{ width: 420, height: 420 }}
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[48, 32, 16].map((r) => (
            <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="#C9A84C" strokeWidth="0.25" />
          ))}
          {[[50, 18], [50, 82], [22, 34], [78, 34], [22, 66], [78, 66]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="16" fill="none" stroke="#C9A84C" strokeWidth="0.2" />
          ))}
        </svg>
      </div>

      <div className="relative max-w-2xl mx-auto px-6">
        {/* ---- INTRO ---- */}
        {step === 'intro' && (
          <Reveal>
            <div className="text-center">
              <p data-scroll-anchor className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4">
                Diagnóstico Energético
              </p>
              <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight mb-5">
                ¿Cuál es tu chakra bloqueado?
              </h2>
              <p className="text-base sm:text-lg text-serenity-mist mb-10 max-w-lg mx-auto leading-relaxed">
                7 preguntas para descubrir qué centro energético necesita tu atención hoy.
                Recibirás una recomendación personalizada de la terapia ideal para ti.
              </p>

              {/* Chakra dots preview */}
              <div className="flex justify-center items-end gap-2 mb-10">
                {[...CHAKRAS].reverse().map((c, i) => (
                  <div
                    key={c.name}
                    className="rounded-full chakra-breathe"
                    title={c.name}
                    style={{
                      width: 14 + i * 2,
                      height: 14 + i * 2,
                      background: c.color,
                      boxShadow: `0 0 14px 3px ${c.color}70`,
                      animationDelay: `${i * 0.3}s`,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setStep('quiz')}
                className="inline-flex items-center gap-2 bg-serenity-gold hover:bg-serenity-gold-light text-serenity-ink font-semibold px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 text-base"
              >
                Comenzar el diagnóstico <span aria-hidden="true">→</span>
              </button>
            </div>
          </Reveal>
        )}

        {/* ---- QUIZ ---- */}
        {step === 'quiz' && (
          <div>
            {/* Progreso */}
            <div className="mb-10">
              <div className="flex justify-between text-xs text-serenity-mist/70 mb-2.5 font-cinzel">
                <span>Pregunta {current + 1} de {total}</span>
                <span>{Math.round((current / total) * 100)}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${(current / total) * 100}%`,
                    background: 'linear-gradient(90deg, #5B2C82, #C9A84C)',
                  }}
                />
              </div>
              {/* Mini chakra indicators */}
              <div className="flex gap-1.5 mt-3">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{
                      background:
                        i < current
                          ? '#C9A84C'
                          : i === current
                          ? 'rgba(201,168,76,0.4)'
                          : 'rgba(255,255,255,0.08)',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Pregunta */}
            <div className="mb-8">
              <h3 className="font-playfair italic text-2xl sm:text-3xl text-serenity-cream leading-snug">
                {QUESTIONS[current].q}
              </h3>
            </div>

            {/* Opciones */}
            <div className="space-y-3">
              {QUESTIONS[current].options.map((opt, i) => {
                const chColor = CHAKRAS[opt.chakra].color
                const isChosen = chosen === opt.chakra
                return (
                  <button
                    key={`${current}-${i}`}
                    onClick={() => handleAnswer(opt.chakra)}
                    disabled={transitioning}
                    className="w-full text-left px-6 py-4 rounded-2xl border transition-all duration-300 disabled:cursor-not-allowed"
                    style={
                      isChosen
                        ? {
                            borderColor: chColor,
                            background: `${chColor}22`,
                            boxShadow: `0 0 24px ${chColor}40`,
                            transform: 'scale(1.015)',
                          }
                        : {
                            borderColor: 'rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.04)',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!transitioning && !isChosen) {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                          'rgba(255,255,255,0.22)'
                        ;(e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isChosen) {
                        ;(e.currentTarget as HTMLButtonElement).style.borderColor =
                          'rgba(255,255,255,0.1)'
                        ;(e.currentTarget as HTMLButtonElement).style.background =
                          'rgba(255,255,255,0.04)'
                      }
                    }}
                  >
                    <span className="text-sm sm:text-base text-serenity-cream/90 leading-relaxed">
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ---- RESULTADO ---- */}
        {step === 'result' && (
          <div>
            <div className="text-center mb-8">
              <p className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-3">
                Tu diagnóstico energético
              </p>
              <h2 className="font-playfair italic text-3xl sm:text-5xl leading-tight text-serenity-cream">
                Tu chakra a sanar es...
              </h2>
            </div>

            <div
              className="rounded-[2rem] border p-8 sm:p-10 mb-6"
              style={{
                borderColor: `${result.color}55`,
                background: `radial-gradient(140% 120% at 50% 0%, ${result.color}28, rgba(15,10,28,0.75) 62%)`,
                boxShadow: `0 0 80px ${result.color}18`,
              }}
            >
              {/* Mandala */}
              <div
                className="flex justify-center mb-6"
                style={{ filter: `drop-shadow(0 0 28px ${result.color}cc)` }}
              >
                <ChakraMandala color={result.color} petals={result.petals} size={110} spin />
              </div>

              <div className="text-center mb-6">
                <span
                  className="block text-xs font-cinzel uppercase tracking-[0.3em] mb-1"
                  style={{ color: result.color }}
                >
                  {result.element}
                </span>
                <h3
                  className="font-playfair italic text-5xl sm:text-6xl mb-1 leading-none"
                  style={{ color: result.color }}
                >
                  {result.sanskrit}
                </h3>
                <p className="text-serenity-mist text-lg">{result.name}</p>
              </div>

              <p className="text-serenity-cream/85 leading-relaxed mb-6 text-center sm:text-left">
                {result.desc}
              </p>

              {/* Afirmación */}
              <div
                className="rounded-2xl px-6 py-5 mb-5 border text-center"
                style={{ borderColor: `${result.color}45`, background: `${result.color}18` }}
              >
                <p
                  className="text-[10px] font-cinzel uppercase tracking-widest mb-2.5"
                  style={{ color: result.color }}
                >
                  Tu afirmación de sanación
                </p>
                <p className="font-playfair italic text-lg sm:text-xl text-serenity-cream leading-snug">
                  "{result.affirmation}"
                </p>
              </div>

              {/* Ficha */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-serenity-mist/55 mb-1">
                    Cristal aliado
                  </p>
                  <p className="text-sm text-serenity-cream">{result.crystal}</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-serenity-mist/55 mb-1">
                    Elemento
                  </p>
                  <p className="text-sm text-serenity-cream">{result.element}</p>
                </div>
              </div>

              {/* CTA */}
              <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center gap-4">
                <p className="text-sm text-serenity-mist flex-1">
                  Terapia recomendada:{' '}
                  <span className="text-serenity-cream font-semibold">{result.service}</span>
                </p>
                <a
                  href={wa(result.serviceMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-serenity-ink font-semibold px-7 py-3.5 rounded-full transition-all hover:scale-[1.04] active:scale-95 text-sm sm:text-base whitespace-nowrap"
                  style={{ background: result.color }}
                >
                  Agendar mi sanación <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={reset}
                className="text-sm text-serenity-mist/70 hover:text-serenity-cream transition-colors underline underline-offset-4"
              >
                Hacer el quiz de nuevo
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
