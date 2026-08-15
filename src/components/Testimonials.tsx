import { Quote, Star } from 'lucide-react'
import Reveal from './Reveal'

interface Testimonial {
  quote: string
  name: string
  role: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Salí de la primera sesión de Reiki sintiendo que solté un peso que cargaba hace años. Yulexy tiene un don para sostener el espacio.',
    name: 'Mariana G.',
    role: 'Sesión de Reiki',
  },
  {
    quote:
      'La constelación familiar me mostró algo que ninguna terapia había logrado. Entendí mi historia y por fin pude ocupar mi lugar.',
    name: 'Daniel P.',
    role: 'Constelaciones Familiares',
  },
  {
    quote:
      'La Formación de Registros Akáshicos cambió mi forma de ver la vida. Aprendí a leer mi alma y hoy acompaño a otros. Eterna gratitud.',
    name: 'Roxana M.',
    role: 'Formación Akáshica · Nivel 3',
  },
]

export default function Testimonials() {
  return (
    <section className="relative bg-serenity-veil text-serenity-ink py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Reveal>
            <p className="font-cinzel uppercase tracking-[0.3em] text-serenity-purple text-xs sm:text-sm mb-4">
              Testimonios
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-5xl text-serenity-purple-deep leading-tight">
              Historias que volvieron a su centro
            </h2>
          </Reveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100}>
              <figure className="h-full flex flex-col bg-white rounded-3xl border border-serenity-gold/30 p-8">
                <Quote className="text-serenity-gold mb-4" size={30} aria-hidden="true" />
                <blockquote className="text-serenity-ink/80 leading-relaxed flex-1">
                  “{t.quote}”
                </blockquote>
                <div className="flex gap-0.5 mt-6 mb-4 text-serenity-gold">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={16} fill="currentColor" aria-hidden="true" />
                  ))}
                </div>
                <figcaption>
                  <span className="block font-cinzel text-serenity-purple-deep">{t.name}</span>
                  <span className="block text-sm text-serenity-ink/55">{t.role}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
