import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Reveal from './Reveal'

interface QA {
  q: string
  a: string
}

const FAQS: QA[] = [
  {
    q: '¿Qué es el Reiki y qué sentiré en una sesión?',
    a: 'El Reiki es una técnica japonesa de canalización de energía vital a través de la imposición de manos. La mayoría de las personas siente calor, hormigueo o una profunda relajación. Es una terapia complementaria, suave y no invasiva.',
  },
  {
    q: '¿Necesito experiencia previa para las Formaciones de Reiki o Registros Akáshicos?',
    a: 'No. Ambos primeros niveles están diseñados para comenzar desde cero. En Reiki Usui, el Nivel I (Shoden) abre tu canal y te enseña a darte Reiki a ti y a otros. En Registros Akáshicos, el Nivel 1 (Despertar) te acompaña paso a paso con la Oración Sagrada, la ética del lector y tus primeras lecturas guiadas. Los niveles siguientes profundizan en sanación y maestría.',
  },
  {
    q: '¿Las sesiones son presenciales o a distancia?',
    a: 'Ambas. El Reiki, la sanación energética y los Registros Akáshicos pueden realizarse a distancia con la misma efectividad. Las terapias de contacto, como el masaje energético, son presenciales en el consultorio.',
  },
  {
    q: '¿Cuánto dura una sesión y cada cuánto debo asistir?',
    a: 'Una sesión individual dura entre 60 y 90 minutos. La frecuencia depende de tu proceso: lo conversamos en tu primera consulta para diseñar un acompañamiento a tu medida.',
  },
  {
    q: '¿Dónde están ubicados?',
    a: 'Estamos en el C.C. Anna, Av. Principal de Lechería, Anzoátegui (Local Étnicas). Puedes escribirme por WhatsApp para coordinar tu cita y recibir la ubicación exacta.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="relative bg-serenity-veil text-serenity-ink py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-serenity-gold/40 to-transparent" />
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <Reveal>
            <p className="font-cinzel uppercase tracking-[0.3em] text-serenity-purple text-xs sm:text-sm mb-4">
              Preguntas Frecuentes
            </p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="font-playfair italic text-4xl sm:text-5xl text-serenity-purple-deep leading-tight">
              Lo que quizás te preguntas
            </h2>
          </Reveal>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 60}>
                <div className="rounded-2xl border border-serenity-gold/30 bg-white overflow-hidden">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-serenity-purple-deep">{item.q}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-serenity-purple transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    className="grid transition-all duration-300 ease-out"
                    style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-serenity-ink/70 leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
