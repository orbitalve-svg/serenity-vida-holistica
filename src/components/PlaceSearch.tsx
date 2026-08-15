import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { searchPlaces, type Place } from '../lib/places'
import { geocodePlaces } from '../lib/geocode'

interface Props {
  value: Place | null
  onChange: (p: Place) => void
}

/** Espera antes de consultar la red, para no lanzar una petición por tecla. */
const DEBOUNCE_MS = 400

/**
 * Buscador del lugar de nacimiento.
 *
 * Combina dos fuentes: la lista propia responde al instante y sin red, y la
 * geocodificación de OpenStreetMap cubre el resto del mundo —cualquier pueblo
 * que alguien escriba—. Si la red falla, sigue funcionando con la lista propia.
 *
 * La búsqueda tolera acentos: «maturin» encuentra «Maturín».
 */
export default function PlaceSearch({ value, onChange }: Props) {
  const uid = useId().replace(/:/g, '')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const [remote, setRemote] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)

  const boxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const local = useMemo(() => searchPlaces(query, 6), [query])

  /** Lista final: primero lo propio, luego lo remoto sin repetir nombres. */
  const results = useMemo(() => {
    const seen = new Set(local.map((p) => `${p.name}|${p.country}`.toLowerCase()))
    const extra = remote.filter(
      (p) => !seen.has(`${p.name}|${p.country}`.toLowerCase()),
    )
    return [...local, ...extra].slice(0, 12)
  }, [local, remote])

  // Consulta a la red, retrasada y cancelable.
  useEffect(() => {
    const q = query.trim()
    if (!open || q.length < 3) {
      setRemote([])
      setLoading(false)
      return
    }
    const ctrl = new AbortController()
    setLoading(true)
    const t = window.setTimeout(async () => {
      const found = await geocodePlaces(q, ctrl.signal)
      if (!ctrl.signal.aborted) {
        setRemote(found)
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    return () => {
      clearTimeout(t)
      ctrl.abort()
    }
  }, [query, open])

  // Cerrar al tocar fuera.
  useEffect(() => {
    if (!open) return
    const onOutside = (e: PointerEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onOutside)
    return () => document.removeEventListener('pointerdown', onOutside)
  }, [open])

  const choose = (p: Place) => {
    onChange(p)
    setQuery('')
    setRemote([])
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      setHighlight((h) => {
        const n = results.length
        if (n === 0) return 0
        return e.key === 'ArrowDown' ? (h + 1) % n : (h - 1 + n) % n
      })
      return
    }
    if (e.key === 'Enter' && open && results[highlight]) {
      e.preventDefault()
      choose(results[highlight])
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`places${uid}`}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Escribe tu ciudad…"
        value={open ? query : value ? `${value.name} · ${value.country}` : ''}
        onChange={(e) => {
          setQuery(e.target.value)
          setHighlight(0)
          setOpen(true)
        }}
        onFocus={() => {
          setQuery('')
          setHighlight(0)
          setOpen(true)
        }}
        onKeyDown={onKeyDown}
        // `[color-scheme:dark]` evita que el navegador imponga fondo blanco.
        className="w-full rounded-2xl bg-white/[0.08] border border-serenity-gold/30 px-4 py-3.5 text-serenity-cream outline-none focus:border-serenity-gold/70 transition-colors placeholder:text-serenity-mist/40 [color-scheme:dark]"
      />

      {loading && (
        <span
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-widest text-serenity-mist/50 pointer-events-none"
          aria-live="polite"
        >
          buscando…
        </span>
      )}

      {open && (
        <ul
          id={`places${uid}`}
          role="listbox"
          className="absolute z-30 left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-serenity-gold/30 bg-serenity-void/95 backdrop-blur-xl shadow-2xl py-1"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-xs text-serenity-mist/80 leading-relaxed">
              {query.trim().length < 3
                ? 'Escribe al menos tres letras.'
                : loading
                  ? 'Buscando en el mapa mundial…'
                  : `No encuentro «${query}». Prueba con otra forma del nombre o elige la ciudad conocida más cercana.`}
            </li>
          ) : (
            results.map((p, i) => (
              <li key={p.id} role="option" aria-selected={p.id === value?.id}>
                <button
                  type="button"
                  // `onMouseDown`: si no, el blur del campo cierra la lista
                  // antes de que llegue el clic.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    choose(p)
                  }}
                  onPointerEnter={() => setHighlight(i)}
                  className="w-full text-left px-4 py-3 text-sm transition-colors"
                  style={{
                    background: i === highlight ? 'rgba(201,168,76,0.16)' : 'transparent',
                    color: p.id === value?.id ? '#E8A93C' : '#FBF6EC',
                  }}
                >
                  {p.name}
                  <span className="text-serenity-mist/60"> · {p.country}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
