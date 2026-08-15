import { Heart, Leaf } from 'lucide-react'
import Reveal from './Reveal'
import retrato from '../assets/yulexy.webp'
import { wa } from '../lib/site'

const STATS = [
  { value: '9', label: 'años de experiencia' },
  { value: '6', label: 'terapias holísticas' },
  { value: '24', label: 'sesiones de formación akáshica' },
]

export default function About() {
  return (
    <section id="sobre-mi" className="relative bg-serenity-veil text-serenity-ink py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          {/* Retrato de Yulexy */}
          <Reveal className="order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-serenity-gold/30 to-serenity-purple/20 blur-xl" />
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-serenity-gold/40 bg-serenity-purple-deep">
                {/* La foto ya viene en 4:5, así que entra sin recorte */}
                <img
                  src={retrato}
                  alt="Yulexy Rodríguez sosteniendo un cuenco tibetano, sentada en la naturaleza"
                  width={900}
                  height={1125}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />

                {/* Velo inferior: asienta la foto luminosa en la paleta oscura
                    de la marca y da fondo legible al nombre. */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(26,14,46,0.92) 0%, rgba(26,14,46,0.55) 45%, transparent 100%)',
                  }}
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7 flex flex-col items-start gap-2">
                  <span className="h-px w-12 bg-serenity-gold/70" aria-hidden="true" />
                  <p className="font-playfair italic text-serenity-cream text-2xl sm:text-3xl leading-tight">
                    Yulexy Rodríguez
                  </p>
                  <p className="font-cinzel uppercase tracking-[0.24em] text-serenity-gold text-[10px] sm:text-[11px] leading-relaxed">
                    Terapeuta Holística · Coach Sistémico
                  </p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Texto */}
          <div className="order-1 lg:order-2">
            <Reveal>
              <p data-scroll-anchor className="font-cinzel uppercase tracking-[0.3em] text-serenity-purple text-xs sm:text-sm mb-4">
                Sobre Mí
              </p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="font-playfair italic text-4xl sm:text-5xl leading-tight text-serenity-purple-deep mb-6">
                Yulexy Rodríguez
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="text-base sm:text-lg leading-relaxed text-serenity-ink/80 mb-5">
                Soy Yulexy Elena Rodríguez Sucre, Lic. en Administración de Empresas, Terapeuta
                Holística y Coach Sistémico, con 9 años de experiencia en el mundo de las
                terapias holísticas y fundadora de Serenity Vida Holística. Mi enfoque integral
                hacia la salud y el bienestar me permite abordar las necesidades físicas,
                emocionales y espirituales de mis clientes.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="text-base sm:text-lg leading-relaxed text-serenity-ink/80 mb-8">
                A lo largo de mi formación trabajo con Reiki, Constelaciones Familiares, Coaching
                Sistémico, Hipnosis Regresiva a Vidas Pasadas, Lectura de Registros Akáshicos,
                Limpieza y Armonización de Chakras, y Masajes Energéticos y Relajantes. Mi
                objetivo es crear un espacio seguro y acogedor donde puedas explorar tu bienestar
                integral.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="flex flex-wrap gap-6 mb-9">
                {STATS.map((s) => (
                  <div key={s.label} className="min-w-[120px]">
                    <div className="font-playfair text-3xl sm:text-4xl text-serenity-purple">
                      {s.value}
                    </div>
                    <div className="text-xs sm:text-sm text-serenity-ink/60 mt-1 max-w-[140px]">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-serenity-ink/70 bg-white px-4 py-2 rounded-full border border-serenity-gold/40">
                  <Heart size={16} className="text-serenity-purple" /> Constelaciones Familiares
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-serenity-ink/70 bg-white px-4 py-2 rounded-full border border-serenity-gold/40">
                  <Leaf size={16} className="text-serenity-purple" /> Terapeuta Reiki
                </span>
                <a
                  href={wa('Hola Yulexy 🙏, me gustaría conocer más sobre tus terapias.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-semibold text-white bg-serenity-purple hover:bg-serenity-purple-deep px-6 py-3.5 rounded-full transition-colors"
                >
                  Conversemos
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
