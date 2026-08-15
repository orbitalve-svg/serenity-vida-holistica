import Logo from './Logo'
import { wa, scrollToId, ADDRESS_SHORT, INSTAGRAM, INSTAGRAM_URL, PHONE_DISPLAY } from '../lib/site'

const NAV = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'galeria', label: 'Galería' },
  { id: 'formaciones', label: 'Formaciones' },
  { id: 'chakras', label: 'Chakras' },
  { id: 'sobre-mi', label: 'Sobre Mí' },
  { id: 'contacto', label: 'Contacto' },
]

export default function Footer() {
  return (
    <footer className="bg-serenity-void text-serenity-cream pt-16 pb-10 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Logo size={48} blanco />
              <span className="leading-tight">
                <span className="block font-playfair italic text-2xl text-serenity-cream">
                  Serenity
                </span>
                <span className="block font-cinzel text-xs tracking-[0.25em] text-serenity-gold uppercase">
                  Vida Holística
                </span>
              </span>
            </div>
            <p className="text-sm text-serenity-mist/80 leading-relaxed max-w-xs">
              Terapias holísticas y formación espiritual con Yulexy Rodríguez. Mente, cuerpo y
              alma en armonía.
            </p>
          </div>

          {/* Navegación */}
          <div className="md:justify-self-center">
            <h4 className="font-cinzel text-serenity-gold text-sm tracking-widest uppercase mb-4">
              Explora
            </h4>
            {/* py-2 en cada enlace: en móvil se tocan con el pulgar, no con un ratón */}
            <ul className="space-y-0.5">
              {NAV.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => scrollToId(n.id)}
                    className="block -mx-2 px-2 py-3 text-sm text-serenity-mist/80 hover:text-serenity-cream transition-colors rounded-lg"
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="font-cinzel text-serenity-gold text-sm tracking-widest uppercase mb-4">
              Contacto
            </h4>
            <ul className="space-y-0.5 text-sm text-serenity-mist/80">
              <li>
                <a
                  href={wa('Hola Serenity 🙏, quiero agendar una cita.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block -mx-2 px-2 py-3 hover:text-serenity-cream transition-colors rounded-lg"
                >
                  WhatsApp · {PHONE_DISPLAY}
                </a>
              </li>
              <li className="py-2">{ADDRESS_SHORT}</li>
              <li>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block -mx-2 px-2 py-3 hover:text-serenity-cream transition-colors rounded-lg"
                >
                  {INSTAGRAM}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-3 text-center">
          <p className="font-playfair italic text-lg sm:text-xl text-serenity-cream">
            “Regálate bienestar. Mente, Cuerpo y Alma en Armonía.”
          </p>
          <p className="text-xs text-serenity-mist/50">
            © {new Date().getFullYear()} Serenity Vida Holística · Yulexy Rodríguez. Todos los
            derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
