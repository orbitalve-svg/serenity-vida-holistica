import { MapPin, Instagram, Phone } from 'lucide-react'
import Reveal from './Reveal'
import MetatronCube from './MetatronCube'
import { wa, INSTAGRAM, INSTAGRAM_URL, MODALIDAD_DETALLE, PHONE_DISPLAY } from '../lib/site'

function WhatsappIcon({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.82 11.82 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.207zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  )
}

export default function Contact() {
  return (
    <section
      id="contacto"
      className="relative overflow-hidden text-serenity-cream py-28 sm:py-36"
      style={{
        background:
          'radial-gradient(120% 100% at 50% 100%, #2D1547 0%, #160C28 50%, #0F0A1C 100%)',
      }}
    >
      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          {/* Gira algo más lento y se abre menos que el de Formaciones: aquí
              cierra la página y no debe robarle atención al botón. */}
          <MetatronCube
            size={208}
            speed={0.04}
            wobble={0.13}
            className="mx-auto mb-10 w-[208px] max-w-[56vw] h-auto"
          />
        </Reveal>
        <Reveal delay={60}>
          <p data-scroll-anchor className="font-cinzel uppercase tracking-[0.32em] text-serenity-gold text-xs sm:text-sm mb-4">
            Contacto
          </p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="font-playfair italic text-4xl sm:text-6xl leading-tight">
            Da el primer paso hacia tu armonía
          </h2>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-5 text-base sm:text-lg text-serenity-mist max-w-xl mx-auto">
            Escríbeme por WhatsApp y conversemos sobre el proceso que tu mente, cuerpo y alma
            necesitan hoy.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <a
            href={wa('Hola Serenity 🙏, vengo de la web y quiero agendar mi cita.')}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-10 inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-lg px-9 py-4 rounded-full animate-pulse-ring transition-colors"
          >
            <WhatsappIcon size={26} />
            Agenda tu Cita por WhatsApp
          </a>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-12 grid sm:grid-cols-3 gap-4 text-left">
            <a
              href={wa()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 hover:border-serenity-gold/50 transition-colors"
            >
              <Phone className="text-serenity-gold shrink-0 mt-0.5" size={20} aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-widest text-serenity-mist/70">
                  WhatsApp
                </span>
                <span className="block text-serenity-cream">{PHONE_DISPLAY}</span>
              </span>
            </a>
            <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4">
              <MapPin className="text-serenity-gold shrink-0 mt-0.5" size={20} aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-widest text-serenity-mist/70">
                  Modalidad
                </span>
                <span className="block text-serenity-cream text-sm leading-snug">
                  {MODALIDAD_DETALLE}
                </span>
              </span>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-4 hover:border-serenity-gold/50 transition-colors"
            >
              <Instagram className="text-serenity-gold shrink-0 mt-0.5" size={20} aria-hidden="true" />
              <span>
                <span className="block text-xs uppercase tracking-widest text-serenity-mist/70">
                  Instagram
                </span>
                <span className="block text-serenity-cream">{INSTAGRAM}</span>
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
