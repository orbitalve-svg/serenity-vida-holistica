import { useEffect, useMemo, useState } from 'react'
import Reveal from './Reveal'
import NightSky from './NightSky'
import { loadMemory, saveMemory } from '../lib/memory'
import { wa } from '../lib/site'
import { getLunarData, getPhaseGuide } from '../lib/lunar'
import ChartWheel3D from './ChartWheel3D'
import ArmillaryChart from './ArmillaryChart'
import PlaceSearch from './PlaceSearch'
import { computeChart, type Chart, type PlanetPos } from '../lib/astro'
import { PLACES, utcOffsetFor, type Place } from '../lib/places'

/* ─── Los doce signos (índice 0 = Aries, como floor(longitud/30)) ─── */

interface Sign {
  name: string
  glyph: string
  element: 'Fuego' | 'Tierra' | 'Aire' | 'Agua'
  planet: string
  chakra: string
  chakraColor: string
  crystal: string
  traits: string
  gift: string
  service: string
  serviceMsg: string
}

const SIGNS: Sign[] = [
  {
    name: 'Aries', glyph: '♈', element: 'Fuego', planet: 'Marte',
    chakra: 'Plexo Solar', chakraColor: '#E8C04B', crystal: 'Cornalina',
    traits: 'Valiente, pionero/a, lleno/a de iniciativa y fuego interior.',
    gift: 'el coraje de empezar de cero',
    service: 'Limpieza y Armonización de Chakras',
    serviceMsg: 'Hola Serenity 🙏, soy Aries y quiero una Limpieza y Armonización de Chakras para canalizar mi fuego interior.',
  },
  {
    name: 'Tauro', glyph: '♉', element: 'Tierra', planet: 'Venus',
    chakra: 'Garganta', chakraColor: '#3FA7D6', crystal: 'Cuarzo Rosa',
    traits: 'Estable, sensual, conectado/a con la belleza y la abundancia.',
    gift: 'la paciencia que construye raíces firmes',
    service: 'Masaje Energético con Reiki',
    serviceMsg: 'Hola Serenity 🙏, soy Tauro y quiero un Masaje Energético con Reiki para reconectar con mi cuerpo.',
  },
  {
    name: 'Géminis', glyph: '♊', element: 'Aire', planet: 'Mercurio',
    chakra: 'Garganta', chakraColor: '#3FA7D6', crystal: 'Citrino',
    traits: 'Curioso/a, comunicativo/a, mente ágil y espíritu versátil.',
    gift: 'la palabra que une mundos',
    service: 'Reiki Presencial y a Distancia',
    serviceMsg: 'Hola Serenity 🙏, soy Géminis y quiero una sesión de Reiki para aquietar mi mente.',
  },
  {
    name: 'Cáncer', glyph: '♋', element: 'Agua', planet: 'Luna',
    chakra: 'Sacro', chakraColor: '#E8893C', crystal: 'Piedra Lunar',
    traits: 'Sensible, protector/a, profundamente intuitivo/a y emocional.',
    gift: 'la ternura que sana el hogar interior',
    service: 'Constelaciones Familiares y Coaching Sistémico',
    serviceMsg: 'Hola Serenity 🙏, soy Cáncer y quiero una sesión de Constelaciones Familiares para sanar mi linaje.',
  },
  {
    name: 'Leo', glyph: '♌', element: 'Fuego', planet: 'Sol',
    chakra: 'Corazón', chakraColor: '#5BB97A', crystal: 'Ojo de Tigre',
    traits: 'Magnético/a, generoso/a, brilla con luz propia y corazón noble.',
    gift: 'la luz que inspira a los demás',
    service: 'Reiki Presencial y a Distancia',
    serviceMsg: 'Hola Serenity 🙏, soy Leo y quiero una sesión de Reiki para abrir mi corazón.',
  },
  {
    name: 'Virgo', glyph: '♍', element: 'Tierra', planet: 'Mercurio',
    chakra: 'Plexo Solar', chakraColor: '#E8C04B', crystal: 'Amazonita',
    traits: 'Analítico/a, servicial, busca la perfección y el orden sagrado.',
    gift: 'el detalle que todo lo armoniza',
    service: 'Limpieza y Armonización de Chakras',
    serviceMsg: 'Hola Serenity 🙏, soy Virgo y quiero una Limpieza y Armonización de Chakras para soltar la autoexigencia.',
  },
  {
    name: 'Libra', glyph: '♎', element: 'Aire', planet: 'Venus',
    chakra: 'Corazón', chakraColor: '#5BB97A', crystal: 'Cuarzo Rosa',
    traits: 'Diplomático/a, estético/a, busca equilibrio y relaciones armónicas.',
    gift: 'la balanza que restaura la paz',
    service: 'Constelaciones Familiares y Coaching Sistémico',
    serviceMsg: 'Hola Serenity 🙏, soy Libra y quiero Constelaciones Familiares para armonizar mis vínculos.',
  },
  {
    name: 'Escorpio', glyph: '♏', element: 'Agua', planet: 'Plutón',
    chakra: 'Sacro', chakraColor: '#E8893C', crystal: 'Obsidiana',
    traits: 'Intenso/a, magnético/a, maestro/a de la transformación profunda.',
    gift: 'el renacer desde las cenizas',
    service: 'Hipnosis de Regresión a Vidas Pasadas',
    serviceMsg: 'Hola Serenity 🙏, soy Escorpio y quiero una Hipnosis de Regresión a Vidas Pasadas para transformarme desde la raíz.',
  },
  {
    name: 'Sagitario', glyph: '♐', element: 'Fuego', planet: 'Júpiter',
    chakra: 'Tercer Ojo', chakraColor: '#5B6BD6', crystal: 'Lapislázuli',
    traits: 'Aventurero/a, filósofo/a, buscador/a de verdad y libertad.',
    gift: 'la visión que expande horizontes',
    service: 'Lectura de Registros Akáshicos',
    serviceMsg: 'Hola Serenity 🙏, soy Sagitario y quiero una Lectura de Registros Akáshicos para encontrar mi propósito.',
  },
  {
    name: 'Capricornio', glyph: '♑', element: 'Tierra', planet: 'Saturno',
    chakra: 'Raíz', chakraColor: '#C0392B', crystal: 'Turmalina Negra',
    traits: 'Disciplinado/a, ambicioso/a, construye con paciencia y maestría.',
    gift: 'la estructura que sostiene sueños',
    service: 'Masaje Energético con Reiki',
    serviceMsg: 'Hola Serenity 🙏, soy Capricornio y quiero un Masaje Energético con Reiki para soltar el exceso de control.',
  },
  {
    name: 'Acuario', glyph: '♒', element: 'Aire', planet: 'Urano',
    chakra: 'Tercer Ojo', chakraColor: '#5B6BD6', crystal: 'Amatista',
    traits: 'Visionario/a, libre, rebelde con causa y alma humanitaria.',
    gift: 'la idea que adelanta el futuro',
    service: 'Lectura de Registros Akáshicos',
    serviceMsg: 'Hola Serenity 🙏, soy Acuario y quiero una Lectura de Registros Akáshicos para conectar con mi propósito.',
  },
  {
    name: 'Piscis', glyph: '♓', element: 'Agua', planet: 'Neptuno',
    chakra: 'Corona', chakraColor: '#9B5DE5', crystal: 'Amatista',
    traits: 'Empático/a, soñador/a, conexión mística con lo invisible.',
    gift: 'la compasión que disuelve fronteras',
    service: 'Reiki Presencial y a Distancia',
    serviceMsg: 'Hola Serenity 🙏, soy Piscis y quiero una sesión de Reiki a distancia para proteger mi sensibilidad.',
  },
]

/* ─── Textos de la carta ─── */

/** La Luna: cómo sientes y qué necesitas para estar en paz. */
const MOON_IN_SIGN = [
  'Necesitas acción e independencia; tus emociones encienden rápido y sanan en movimiento.',
  'Buscas calma y estabilidad; te nutre lo sencillo: el tacto, la naturaleza, los ritmos sin prisa.',
  'Procesas lo que sientes hablándolo; necesitas palabras, variedad y alguien que escuche.',
  'Emociones profundas y memoria del corazón; necesitas hogar, pertenencia y cuidar.',
  'Necesitas ser visto/a y celebrado/a; tu corazón se nutre creando y compartiendo tu luz.',
  'Te calma el orden y ser útil; aprendes a soltar la perfección para poder descansar.',
  'Te equilibra la armonía y la compañía; aprendes a no perderte por complacer.',
  'Sientes con intensidad extrema; necesitas intimidad real y transformar lo que callas.',
  'Te nutre la libertad y el sentido; tus emociones respiran en espacios abiertos.',
  'Contienes lo que sientes; aprendes que pedir apoyo también es fortaleza.',
  'Necesitas espacio y autenticidad; sientes con la mente y amas sin jaulas.',
  'Esponja emocional e intuición pura; necesitas silencio, agua y arte para volver a ti.',
]

/** El Ascendente: la puerta por la que el mundo te conoce. */
const ASC_IN_SIGN = [
  'Llegas con fuerza y decisión: el mundo te ve valiente antes de conocerte.',
  'Transmites calma y presencia; inspiras confianza con solo estar.',
  'Curiosidad y palabra fácil: conectas con todos apenas llegas.',
  'Tu sensibilidad se percibe; acoges y proteges desde el primer momento.',
  'Entras y se nota: irradias un brillo natural que convoca miradas.',
  'Observas antes de actuar; te presentas impecable, atento/a al detalle.',
  'Encanto y diplomacia: el mundo te ve amable y justo/a.',
  'Mirada intensa y magnetismo; guardas tu misterio, y eso atrae.',
  'Optimismo expansivo: llegas con historias, risa y horizonte.',
  'Seriedad y solvencia; el mundo confía en ti responsabilidades.',
  'Original y libre: te perciben adelantado/a a tu tiempo.',
  'Dulzura y empatía; la gente siente que puede soñar contigo.',
]

/** Las doce casas (signos enteros): el área de vida donde actúa cada planeta. */
const HOUSES = [
  'Identidad y cuerpo',
  'Recursos y valores',
  'Comunicación y aprendizaje',
  'Hogar y raíces',
  'Creatividad y placer',
  'Salud y rutinas',
  'Vínculos y pareja',
  'Transformación y lo oculto',
  'Expansión y sentido',
  'Vocación y logro',
  'Comunidad y sueños',
  'Interioridad y espíritu',
]

/** Qué gobierna cada planeta. */
const PLANET_ROLE: Record<string, string> = {
  Sol: 'Esencia y propósito',
  Luna: 'Mundo emocional',
  Mercurio: 'Mente y palabra',
  Venus: 'Amor y valores',
  Marte: 'Impulso y deseo',
  Júpiter: 'Expansión y fe',
  Saturno: 'Estructura y maestría',
  Urano: 'Cambio y libertad',
  Neptuno: 'Intuición y sueños',
  Plutón: 'Poder y transformación',
}

/* ─── Numerología (igual que antes) ─── */

interface SoulNumber {
  number: number
  title: string
  meaning: string
}

const SOUL_MEANINGS: Record<number, { title: string; meaning: string }> = {
  1: { title: 'El Líder', meaning: 'Tu alma vino a iniciar y abrir caminos. Independencia y voluntad creadora.' },
  2: { title: 'La Pacificadora', meaning: 'Tu alma busca la unión, la diplomacia y el equilibrio entre opuestos.' },
  3: { title: 'La Creativa', meaning: 'Vienes a expresar, comunicar y alegrar al mundo con tu luz creativa.' },
  4: { title: 'La Constructora', meaning: 'Tu misión es dar estructura, estabilidad y bases firmes a la vida.' },
  5: { title: 'La Libre', meaning: 'Tu alma anhela libertad, cambio y experiencias que expandan tu ser.' },
  6: { title: 'La Sanadora', meaning: 'Vienes a cuidar, sanar y armonizar el amor en la familia y el hogar.' },
  7: { title: 'La Mística', meaning: 'Tu camino es la introspección, la sabiduría espiritual y la verdad interior.' },
  8: { title: 'La Manifestadora', meaning: 'Tu alma trabaja la abundancia, el poder personal y el karma material.' },
  9: { title: 'La Humanitaria', meaning: 'Vienes a servir, compadecer y elevar a la humanidad con amor universal.' },
  11: { title: 'La Iluminada (Maestro)', meaning: 'Número maestro: intuición elevada, inspiración y un canal espiritual abierto.' },
  22: { title: 'La Gran Arquitecta (Maestro)', meaning: 'Número maestro: capacidad de manifestar grandes sueños al servicio del mundo.' },
}

function reduceNumber(n: number): number {
  while (n > 9 && n !== 11 && n !== 22) {
    n = String(n).split('').reduce((a, d) => a + Number(d), 0)
  }
  return n
}

function getSoulNumber(y: number, m: number, d: number): SoulNumber {
  const sum = String(y).split('').reduce((a, x) => a + Number(x), 0) + m + d
  const number = reduceNumber(sum)
  const info = SOUL_MEANINGS[number] ?? SOUL_MEANINGS[1]
  return { number, ...info }
}

const ELEMENT_TODAY: Record<Sign['element'], string> = {
  Fuego: 'Tu fuego está activo: canaliza esta energía en acción consciente, no en impulsos.',
  Tierra: 'Tu energía pide cuerpo y presencia: conéctate con la tierra y lo tangible.',
  Aire: 'Tu mente vuela alto hoy: comunica, aprende y comparte tus ideas.',
  Agua: 'Tus emociones fluyen profundas: hónralas, escúchalas y déjalas mover.',
}

/* ─── Componente ─── */

interface Result {
  chart: Chart
  soul: SoulNumber
  hadTime: boolean
}

export default function AstralChart() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [place, setPlace] = useState<Place>(
    () => PLACES.find((p) => p.id === 'lecheria') ?? PLACES[0],
  )
  const [remembered, setRemembered] = useState(false)
  const [view, setView] = useState<'esfera' | 'rueda'>('esfera')
  const [result, setResult] = useState<Result | null>(null)

  const lunar = useMemo(() => getLunarData(new Date()), [])
  const guide = useMemo(() => getPhaseGuide(lunar.phaseName), [lunar.phaseName])

  function computeFor(dateStr: string, timeStr: string, pl: Place): Result | null {
    const [y, m, d] = dateStr.split('-').map(Number)
    if (!y || !m || !d) return null
    const hour = timeStr
      ? Number(timeStr.slice(0, 2)) + Number(timeStr.slice(3, 5)) / 60
      : null
    const offset = utcOffsetFor(pl, y, m, d)
    const chart = computeChart(
      y, m, d,
      hour,
      offset,
      hour !== null ? pl.lat : null,
      hour !== null ? pl.lon : null,
    )
    return { chart, soul: getSoulNumber(y, m, d), hadTime: hour !== null }
  }

  function reveal() {
    if (!date) return
    const next = computeFor(date, time, place)
    if (!next) return
    setResult(next)
    const sun = SIGNS[next.chart.planets[0].sign]
    saveMemory({
      birthDate: date,
      birthTime: time || undefined,
      birthPlace: place,
      sign: sun.name,
      signGlyph: sun.glyph,
    })
  }

  // Si ya nos dejó sus datos en otra visita, mostramos la carta resuelta.
  useEffect(() => {
    const m = loadMemory()
    if (!m.birthDate) return

    // Las visitas antiguas guardaban sólo el id del lugar; las nuevas, el
    // objeto completo (necesario para los lugares geocodificados).
    const guardado =
      typeof m.birthPlace === 'string'
        ? PLACES.find((p) => p.id === m.birthPlace)
        : m.birthPlace
    const pl = guardado ?? place

    const restored = computeFor(m.birthDate, m.birthTime ?? '', pl)
    if (!restored) return
    setDate(m.birthDate)
    setTime(m.birthTime ?? '')
    setPlace(pl)
    setResult(restored)
    setRemembered(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sun = result ? SIGNS[result.chart.planets[0].sign] : null
  const moon = result ? result.chart.planets[1] : null
  const ascSign = result && result.chart.asc !== null ? Math.floor(result.chart.asc / 30) : null

  return (
    <section
      id="mapa-energetico"
      className="relative overflow-hidden text-serenity-cream py-24 sm:py-32"
      style={{
        background:
          'radial-gradient(ellipse 120% 90% at 50% 0%, #1B0F33 0%, #0F0A1C 60%)',
      }}
    >
      <NightSky count={120} brightCount={6} seed={54} />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Reveal>
            <p
              data-scroll-anchor
              className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4"
            >
              Tu Mapa Energético
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">
              Descubre tu carta astral
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-4 text-serenity-mist text-base sm:text-lg">
              Con tu fecha, hora y lugar de nacimiento calculamos tu cielo completo: Sol, Luna,
              Ascendente, los diez planetas y sus casas — junto a tu chakra, tu cristal y tu
              número del alma.
            </p>
          </Reveal>
        </div>

        {/* Entrada de datos */}
        <Reveal delay={180}>
          <div className="grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-cinzel uppercase tracking-widest text-serenity-gold/80">
                Fecha de nacimiento
              </span>
              <input
                type="date"
                value={date}
                max="2026-12-31"
                min="1920-01-01"
                onChange={(e) => setDate(e.target.value)}
                className="rounded-2xl bg-white/[0.08] border border-serenity-gold/30 px-4 py-3.5 text-serenity-cream outline-none focus:border-serenity-gold/70 transition-colors [color-scheme:dark]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-cinzel uppercase tracking-widest text-serenity-gold/80">
                Hora (si la sabes)
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="rounded-2xl bg-white/[0.08] border border-serenity-gold/30 px-4 py-3.5 text-serenity-cream outline-none focus:border-serenity-gold/70 transition-colors [color-scheme:dark]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-cinzel uppercase tracking-widest text-serenity-gold/80">
                Lugar
              </span>
              <PlaceSearch value={place} onChange={setPlace} />
            </label>
          </div>

          <div className="text-center mt-5 mb-3">
            <button
              onClick={reveal}
              disabled={!date}
              className="rounded-full bg-serenity-gold text-serenity-ink font-semibold px-9 py-3.5 transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
            >
              {remembered ? 'Actualizar mi carta' : 'Revelar mi carta'}
            </button>
          </div>

          {remembered && (
            <p className="mb-2 text-center text-xs text-serenity-mist/60">
              Recordamos tus datos de una visita anterior · guardados sólo en este dispositivo
            </p>
          )}
          {!time && (
            <p className="mb-8 text-center text-xs text-serenity-mist/60 max-w-md mx-auto">
              Sin hora de nacimiento no podemos calcular tu Ascendente ni tus casas — pero sí tu
              Sol, tu Luna y los planetas.
            </p>
          )}
        </Reveal>

        {/* Resultado */}
        {result && sun && moon && (
          <div className="mt-10 space-y-5 animate-[heroFadeUp_0.6s_ease-out]">
            {/* Rueda + Los Tres Grandes */}
            <div className="grid lg:grid-cols-2 gap-5 items-center">
              <div
                className="rounded-[2rem] border border-white/10 p-6 sm:p-8"
                style={{ background: 'radial-gradient(120% 100% at 50% 0%, rgba(91,107,214,0.10), rgba(15,10,28,0.6) 70%)' }}
              >
                {view === 'esfera' ? (
                  <ArmillaryChart chart={result.chart} size={330} />
                ) : (
                  <ChartWheel3D chart={result.chart} />
                )}

                {/* Alternar entre la esfera y la rueda técnica */}
                <div className="mt-5 flex justify-center gap-1.5 p-1 rounded-full border border-white/10 bg-white/5 w-fit mx-auto">
                  {(['esfera', 'rueda'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      aria-pressed={view === v}
                      className="rounded-full px-4 py-2 text-xs font-semibold transition-colors"
                      style={
                        view === v
                          ? { background: '#C9A84C', color: '#241830' }
                          : { color: 'rgba(203,184,220,0.8)' }
                      }
                    >
                      {v === 'esfera' ? 'Esfera armilar' : 'Rueda técnica'}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-center text-[11px] text-serenity-mist/60">
                  Casas por signos enteros · posiciones calculadas, no aproximadas
                  {!result.hadTime && ' · sin hora: Luna estimada a mediodía'}
                </p>
              </div>

              <div className="space-y-4">
                {/* Sol */}
                <div
                  className="rounded-[1.5rem] border p-6"
                  style={{ borderColor: `${sun.chakraColor}45`, background: `radial-gradient(120% 100% at 0% 0%, ${sun.chakraColor}1c, rgba(15,10,28,0.5) 65%)` }}
                >
                  <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold mb-1.5">
                    ☉ Sol en {sun.name} {sun.glyph} · tu esencia
                  </p>
                  <p className="text-sm text-serenity-cream/90 leading-relaxed">{sun.traits}</p>
                  <p className="text-xs italic mt-1.5" style={{ color: sun.chakraColor }}>
                    Tu don: {sun.gift}.
                  </p>
                </div>

                {/* Luna */}
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-mist mb-1.5">
                    ☾ Luna en {SIGNS[moon.sign].name} {SIGNS[moon.sign].glyph} · tu mundo emocional
                  </p>
                  <p className="text-sm text-serenity-cream/90 leading-relaxed">
                    {MOON_IN_SIGN[moon.sign]}
                  </p>
                </div>

                {/* Ascendente */}
                {ascSign !== null ? (
                  <div className="rounded-[1.5rem] border border-serenity-gold/30 bg-serenity-gold/5 p-6">
                    <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold mb-1.5">
                      ↗ Ascendente en {SIGNS[ascSign].name} {SIGNS[ascSign].glyph} · tu presencia
                    </p>
                    <p className="text-sm text-serenity-cream/90 leading-relaxed">
                      {ASC_IN_SIGN[ascSign]}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-white/[0.15] p-6">
                    <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-mist/70 mb-1.5">
                      ↗ Ascendente
                    </p>
                    <p className="text-xs text-serenity-mist/80 leading-relaxed">
                      Necesita tu hora de nacimiento. Si la consigues (partida de nacimiento,
                      familia), vuelve y tu carta se completa.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Tabla de planetas */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8 overflow-x-auto">
              <p className="font-cinzel uppercase tracking-[0.24em] text-serenity-gold text-xs mb-5">
                Tus diez planetas
              </p>
              <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {result.chart.planets.map((p: PlanetPos) => (
                  <li key={p.name} className="flex items-center gap-3 text-sm">
                    <span className="w-7 text-center text-lg shrink-0" aria-hidden="true">
                      {p.glyph}
                    </span>
                    <span className="w-24 shrink-0 text-serenity-cream font-medium">
                      {p.name}
                      {p.retrograde && (
                        <span className="text-serenity-gold/90 ml-1" title="Retrógrado">℞</span>
                      )}
                    </span>
                    <span className="text-serenity-cream/85 whitespace-nowrap">
                      {SIGNS[p.sign].glyph} {SIGNS[p.sign].name} {Math.floor(p.deg)}°
                    </span>
                    <span className="text-serenity-mist/60 text-xs truncate">
                      {result.chart.houseOfSign
                        ? `· Casa ${result.chart.houseOfSign(p.sign)} — ${HOUSES[result.chart.houseOfSign(p.sign) - 1]}`
                        : `· ${PLANET_ROLE[p.name]}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Chakra, cristal, alma, energía de hoy y terapia */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold/80 mb-2">
                  Tu chakra a trabajar
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full shrink-0"
                    style={{ background: sun.chakraColor, boxShadow: `0 0 18px ${sun.chakraColor}80` }}
                    aria-hidden="true"
                  />
                  <p className="font-playfair text-xl" style={{ color: sun.chakraColor }}>
                    {sun.chakra}
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold/80 mb-2">
                  Tu cristal aliado
                </p>
                <p className="font-playfair text-xl text-serenity-cream">{sun.crystal}</p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
                <p className="text-[10px] font-cinzel uppercase tracking-widest text-serenity-gold/80 mb-2">
                  Número del alma · {result.soul.number}
                </p>
                <p className="font-playfair text-lg text-serenity-cream mb-1">{result.soul.title}</p>
                <p className="text-xs text-serenity-mist leading-relaxed">{result.soul.meaning}</p>
              </div>

              <div
                className="rounded-[1.5rem] border p-6"
                style={{ borderColor: `${guide.color}40`, background: `${guide.color}12` }}
              >
                <p className="text-[10px] font-cinzel uppercase tracking-widest mb-2" style={{ color: guide.color }}>
                  Tu energía hoy · {lunar.phaseName}
                </p>
                <p className="text-xs text-serenity-cream/85 leading-relaxed">
                  {ELEMENT_TODAY[sun.element]}
                </p>
              </div>

              {/* CTA: la carta interpretada por Yulexy */}
              <div className="sm:col-span-2 rounded-[1.5rem] border border-white/10 bg-white/5 p-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                  <p className="text-xs text-serenity-mist/70 mb-0.5">
                    Esta es tu carta calculada. La lectura profunda — lo que tu cielo significa
                    para tu camino — se hace en sesión.
                  </p>
                  <p className="font-semibold text-serenity-cream">{sun.service}</p>
                </div>
                <a
                  href={wa(sun.serviceMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-serenity-ink font-semibold text-sm px-7 py-3.5 rounded-full transition-all hover:scale-[1.04] active:scale-95"
                  style={{ background: sun.chakraColor }}
                >
                  Agendar <span aria-hidden="true">→</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
