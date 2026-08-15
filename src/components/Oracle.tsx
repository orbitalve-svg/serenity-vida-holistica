import { useMemo, useState } from 'react'
import Reveal from './Reveal'
import { wa } from '../lib/site'

/* ─── Cartas del oráculo ─── */

interface Card {
  name: string
  glyph: string
  message: string
  affirmation: string
  color: string
}

const DECK: Card[] = [
  { name: 'La Luz Interior', glyph: '✦', color: '#E8C04B',
    message: 'Hay una luz en ti que ninguna sombra puede apagar. Hoy es día de recordarlo.',
    affirmation: 'Soy luz, incluso en la oscuridad.' },
  { name: 'El Renacer', glyph: '⟳', color: '#9B5DE5',
    message: 'Lo que termina abre espacio para lo nuevo. Permite que algo viejo muera en ti.',
    affirmation: 'Suelto lo que fui para florecer en lo que soy.' },
  { name: 'La Raíz', glyph: '⊕', color: '#C0392B',
    message: 'Tus raíces son más profundas de lo que crees. Conéctate con tu fuerza ancestral.',
    affirmation: 'Estoy firme, sostenido/a por mi linaje.' },
  { name: 'El Corazón Abierto', glyph: '♡', color: '#5BB97A',
    message: 'El amor que buscas afuera ya vive dentro de ti. Ábrete a darlo y recibirlo.',
    affirmation: 'Doy y recibo amor en perfecto equilibrio.' },
  { name: 'La Voz', glyph: '◈', color: '#3FA7D6',
    message: 'Tu verdad merece ser dicha. Hoy el universo te pide expresar lo que callas.',
    affirmation: 'Hablo mi verdad con amor y claridad.' },
  { name: 'La Visión', glyph: '◉', color: '#5B6BD6',
    message: 'Tu intuición te susurra el camino. Confía en lo que ves más allá de los ojos.',
    affirmation: 'Confío en mi sabiduría interior.' },
  { name: 'La Corona', glyph: '✷', color: '#9B5DE5',
    message: 'Estás conectado/a a algo más grande. Hoy el cielo te recuerda que no estás solo/a.',
    affirmation: 'Soy un canal de la energía universal.' },
  { name: 'El Fluir', glyph: '∿', color: '#3FA7D6',
    message: 'No fuerces. El agua siempre encuentra su camino. Permítete fluir con la vida.',
    affirmation: 'Fluyo con confianza y suelto el control.' },
  { name: 'La Abundancia', glyph: '❋', color: '#E8893C',
    message: 'El universo es generoso contigo. Abre las manos para recibir lo que mereces.',
    affirmation: 'Merezco y recibo abundancia con gratitud.' },
  { name: 'El Perdón', glyph: '☼', color: '#E8C04B',
    message: 'Perdonar te libera a ti, no al otro. Hoy es día de soltar una carga antigua.',
    affirmation: 'Me libero a través del perdón.' },
  { name: 'La Pausa', glyph: '☾', color: '#5B2C82',
    message: 'Descansar también es avanzar. Tu alma pide silencio y quietud hoy.',
    affirmation: 'Honro mi necesidad de descanso.' },
  { name: 'El Coraje', glyph: '✺', color: '#C0392B',
    message: 'El miedo es la puerta hacia tu próximo nivel. Da el paso que has estado evitando.',
    affirmation: 'Soy valiente y avanzo a pesar del miedo.' },
  { name: 'La Gratitud', glyph: '✸', color: '#5BB97A',
    message: 'Lo que agradeces se multiplica. Cuenta hoy tus bendiciones, grandes y pequeñas.',
    affirmation: 'Agradezco y mi vida se llena de bien.' },
  { name: 'El Despertar', glyph: '✶', color: '#E8A93C',
    message: 'Algo en ti está listo para despertar. Presta atención a las señales de hoy.',
    affirmation: 'Despierto a mi verdadero ser.' },
]

/* Carta del día — determinista por fecha (estable todo el día) */
function cardOfTheDay(): Card {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000)
  return DECK[dayOfYear % DECK.length]
}

export default function Oracle() {
  const card = useMemo(cardOfTheDay, [])
  const [flipped, setFlipped] = useState(false)

  return (
    <section
      className="relative overflow-hidden text-serenity-cream py-24 sm:py-32"
      style={{
        background:
          'radial-gradient(ellipse 120% 90% at 50% 100%, #21103D 0%, #0F0A1C 60%)',
      }}
    >
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <p className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4">
            Oráculo del Día
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">
            Una carta para tu alma hoy
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-4 text-serenity-mist text-base sm:text-lg mb-12">
            Respira hondo, pon una intención en tu corazón y descubre el mensaje que el
            universo tiene para ti.
          </p>
        </Reveal>

        {/* Carta */}
        <Reveal delay={180}>
          <div className="flex flex-col items-center">
            <button
              onClick={() => setFlipped((f) => !f)}
              className="relative outline-none group"
              style={{ width: 280, height: 420, perspective: 1600 }}
              aria-label={flipped ? 'Voltear carta' : 'Revelar carta del día'}
            >
              <div
                className="relative w-full h-full transition-transform duration-[900ms]"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                {/* Reverso (cerrada) */}
                <div
                  className="absolute inset-0 rounded-[1.5rem] border flex flex-col items-center justify-center gap-6 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    borderColor: 'rgba(201,168,76,0.4)',
                    background:
                      'radial-gradient(120% 100% at 50% 50%, #2D1547 0%, #160C28 70%)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background:
                        'repeating-conic-gradient(from 0deg at 50% 50%, rgba(201,168,76,0.12) 0deg 10deg, transparent 10deg 20deg)',
                    }}
                    aria-hidden="true"
                  />
                  <div className="chakra-spin text-serenity-gold text-6xl" aria-hidden="true">✶</div>
                  <p className="relative font-cinzel uppercase tracking-[0.3em] text-serenity-gold/80 text-xs">
                    Toca para revelar
                  </p>
                </div>

                {/* Frente (revelada) */}
                <div
                  className="absolute inset-0 rounded-[1.5rem] border flex flex-col items-center justify-center text-center px-7 py-8 gap-3"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    borderColor: `${card.color}66`,
                    background: `radial-gradient(120% 100% at 50% 0%, ${card.color}26, #160C28 70%)`,
                  }}
                >
                  <div className="text-5xl chakra-breathe" style={{ color: card.color }} aria-hidden="true">
                    {card.glyph}
                  </div>
                  <h3 className="font-playfair italic text-2xl" style={{ color: card.color }}>
                    {card.name}
                  </h3>
                  <p className="text-sm text-serenity-cream/85 leading-relaxed">{card.message}</p>
                  <p
                    className="text-sm italic mt-1 px-4 py-2 rounded-xl"
                    style={{ background: `${card.color}1a`, color: card.color }}
                  >
                    "{card.affirmation}"
                  </p>
                </div>
              </div>
            </button>

            {/* CTA tras revelar */}
            <div
              className="mt-8 transition-all duration-500"
              style={{ opacity: flipped ? 1 : 0, transform: flipped ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <a
                href={wa(`Hola Serenity 🙏, hoy saqué la carta "${card.name}" en el oráculo de la web y quiero profundizar en su mensaje con una sesión.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-serenity-gold text-serenity-ink font-semibold text-sm px-7 py-3.5 rounded-full transition-all hover:scale-[1.03] active:scale-95"
              >
                Profundiza en tu mensaje
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
