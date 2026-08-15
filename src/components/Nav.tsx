import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { wa, scrollToId } from '../lib/site'

const LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'servicios', label: 'Servicios' },
  { id: 'galeria', label: 'Galería' },
  { id: 'formaciones', label: 'Formaciones' },
  { id: 'chakras', label: 'Chakras' },
  { id: 'sobre-mi', label: 'Sobre Mí' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('inicio')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is in view to highlight the pill.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  // En móvil se espera poder cerrar el menú tocando fuera o con Escape.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onOutside = (e: PointerEvent) => {
      const target = e.target as Element | null
      if (target && !target.closest('nav')) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    // `capture` para enterarnos antes de que algo detenga la propagación.
    document.addEventListener('pointerdown', onOutside, true)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onOutside, true)
    }
  }, [open])

  const go = (id: string) => {
    setOpen(false)
    scrollToId(id)
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 transition-colors duration-500 ${
        scrolled ? 'nav-scrolled' : ''
      }`}
    >
      {/* Izquierda — marca */}
      <button
        onClick={() => go('inicio')}
        className="flex items-center gap-2.5 group -my-1.5 py-1.5"
        aria-label="Ir al inicio"
      >
        <Logo size={34} blanco className="transition-transform group-hover:scale-105" />
        <span className="text-white text-2xl font-playfair italic leading-none">Serenity</span>
      </button>

      {/* Pill central */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {LINKS.map((l) => {
          const isActive = active === l.id
          return (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white bg-white/20'
                  : 'text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {l.label}
            </button>
          )
        })}
      </div>

      {/* Derecha — CTA */}
      <a
        href={wa('Hola Serenity 🙏, me gustaría agendar una cita.')}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        Agenda tu Cita
      </a>

      {/* Hamburguesa móvil — 48px de lado: el mínimo cómodo para el pulgar */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden text-white -mr-2 w-12 h-12 grid place-items-center rounded-full active:bg-white/10 transition-colors"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* Panel móvil */}
      {open && (
        <div className="md:hidden absolute top-full left-3 right-3 mt-2 rounded-3xl bg-serenity-void/95 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-1 shadow-2xl">
          {LINKS.map((l) => (
            <button
              key={l.id}
              onClick={() => go(l.id)}
              className="text-left text-white/85 hover:text-white hover:bg-white/10 px-4 py-3 rounded-2xl text-base font-medium transition-colors"
            >
              {l.label}
            </button>
          ))}
          <a
            href={wa('Hola Serenity 🙏, me gustaría agendar una cita.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-center bg-white text-gray-900 font-semibold px-6 py-3 rounded-full"
          >
            Agenda tu Cita
          </a>
        </div>
      )}
    </nav>
  )
}
