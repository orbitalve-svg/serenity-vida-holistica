import { useEffect, useMemo, useState } from 'react'
import { getLunarData, getPhaseGuide } from '../lib/lunar'
import { clearMemory, hasMemory, loadMemory, type SerenityMemory } from '../lib/memory'
import { scrollToId } from '../lib/site'

/**
 * Saludo de reconocimiento.
 *
 * Sólo aparece si la persona ya nos dejó algo en visitas anteriores (su chakra
 * o su signo). Combina esa memoria con la fase lunar de hoy para darle una
 * lectura personal al entrar.
 */
export default function WelcomeBack() {
  const [memory, setMemory] = useState<SerenityMemory | null>(null)
  const [dismissed, setDismissed] = useState(false)

  // La memoria vive en el navegador: se lee después del montaje.
  useEffect(() => {
    const m = loadMemory()
    if (hasMemory(m)) setMemory(m)
  }, [])

  const lunar = useMemo(() => getLunarData(new Date()), [])
  const guide = useMemo(() => getPhaseGuide(lunar.phaseName), [lunar.phaseName])

  if (!memory || dismissed) return null

  const accent = memory.chakraColor ?? guide.color

  return (
    <section
      className="relative overflow-hidden border-y border-white/10"
      style={{
        background: `linear-gradient(90deg, rgba(11,7,22,0.96) 0%, ${accent}1c 50%, rgba(11,7,22,0.96) 100%)`,
      }}
      aria-label="Tu energía de hoy"
    >
      <div className="max-w-5xl mx-auto px-6 py-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="w-3 h-3 rounded-full chakra-breathe"
            style={{ background: accent, boxShadow: `0 0 14px 3px ${accent}` }}
            aria-hidden="true"
          />
          <p className="font-cinzel uppercase tracking-[0.26em] text-[10px] sm:text-[11px] text-serenity-gold">
            Bienvenida de nuevo
          </p>
        </div>

        <p className="flex-1 min-w-[240px] text-sm sm:text-[15px] text-serenity-cream/90 leading-relaxed">
          {memory.chakra && (
            <>
              Tu centro a trabajar es{' '}
              <strong className="font-semibold" style={{ color: accent }}>
                {memory.chakra}
              </strong>
            </>
          )}
          {memory.chakra && memory.sign && <span className="text-serenity-mist/50"> · </span>}
          {memory.sign && (
            <>
              Eres{' '}
              <strong className="font-semibold" style={{ color: accent }}>
                {memory.signGlyph} {memory.sign}
              </strong>
            </>
          )}
          <span className="text-serenity-mist/50"> · </span>
          Hoy la <em className="not-italic text-serenity-cream">{lunar.phaseName}</em> te invita a{' '}
          {guide.energy.split('.')[0].toLowerCase()}.
        </p>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => scrollToId('quiz')}
            className="text-xs font-semibold rounded-full px-5 py-3.5 transition-all hover:scale-[1.04] active:scale-95 text-serenity-ink"
            style={{ background: accent }}
          >
            Ver mi energía
          </button>
          <button
            onClick={() => {
              clearMemory()
              setDismissed(true)
            }}
            className="text-xs text-serenity-mist/60 hover:text-serenity-cream transition-colors underline underline-offset-4 py-3 px-2 -mx-2"
          >
            Olvidar
          </button>
        </div>
      </div>
    </section>
  )
}
