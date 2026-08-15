import type { Place } from './places'

/**
 * Búsqueda de cualquier localidad del mundo mediante Nominatim (OpenStreetMap).
 *
 * La lista propia de `places.ts` cubre las ciudades frecuentes y responde al
 * instante sin red; esto es el complemento para el resto: pueblos pequeños,
 * caseríos, cualquier sitio que alguien escriba.
 *
 * Nominatim no devuelve huso horario, así que se deduce del país y —en los
 * países que abarcan varios husos— de la longitud. Es exacto en casi toda
 * América; la interfaz muestra el huso aplicado para que se pueda comprobar.
 *
 * Si la red falla, la búsqueda degrada sola a la lista propia.
 */

const ENDPOINT = 'https://nominatim.openstreetmap.org/search'

/** Tipos de resultado que son realmente lugares habitados. */
const PLACE_TYPES = new Set([
  'city', 'town', 'village', 'hamlet', 'municipality', 'borough',
  'suburb', 'quarter', 'neighbourhood', 'administrative', 'isolated_dwelling',
])

/**
 * Huso estándar por país. En los que abarcan varios, se elige por longitud.
 * Devuelve también la regla de verano que ya usa `places.ts`.
 */
function zoneFor(cc: string, lon: number): { utc: number; dst: Place['dst'] } {
  const byLon = (bands: [number, number][], fallback: number): number => {
    for (const [limit, off] of bands) if (lon >= limit) return off
    return fallback
  }

  switch (cc) {
    case 've': return { utc: -4, dst: 've' }
    case 'co': case 'pe': case 'ec': case 'pa': case 'cu':
      return { utc: -5, dst: cc === 'cu' ? 'us' : 'none' }
    case 'bo': case 'py': case 'gy': case 'do': case 'pr':
      return { utc: -4, dst: 'none' }
    case 'cl': return { utc: -4, dst: 'cl' }
    case 'ar': case 'uy': case 'sr': case 'gf':
      return { utc: -3, dst: 'none' }
    case 'br':
      // Brasil: franja occidental a −5/−4, el resto a −3.
      return { utc: byLon([[-45, -3], [-60, -4]], -5), dst: 'none' }
    case 'mx':
      return { utc: byLon([[-98, -6], [-110, -7]], -8), dst: 'none' }
    case 'us':
      return { utc: byLon([[-85, -5], [-100, -6], [-115, -7]], -8), dst: 'us' }
    case 'ca':
      return { utc: byLon([[-90, -5], [-102, -6], [-115, -7]], -8), dst: 'us' }
    case 'gt': case 'sv': case 'hn': case 'ni': case 'cr': case 'bz':
      return { utc: -6, dst: 'none' }
    case 'es':
      // Canarias a UTC+0; península a +1.
      return { utc: lon < -12 ? 0 : 1, dst: 'eu' }
    case 'pt': return { utc: 0, dst: 'eu' }
    case 'it': case 'fr': case 'de': case 'nl': case 'be': case 'ch': case 'at':
      return { utc: 1, dst: 'eu' }
    default:
      // Aproximación por longitud para el resto del mundo.
      return { utc: Math.round(lon / 15), dst: 'none' }
  }
}

interface NominatimItem {
  display_name?: string
  name?: string
  lat?: string
  lon?: string
  type?: string
  address?: Record<string, string>
}

/**
 * Busca localidades por nombre. Devuelve `Place`s listos para la carta.
 * Nunca lanza: ante cualquier fallo devuelve lista vacía.
 */
export async function geocodePlaces(
  query: string,
  signal?: AbortSignal,
): Promise<Place[]> {
  const q = query.trim()
  if (q.length < 3) return []

  try {
    const url =
      `${ENDPOINT}?q=${encodeURIComponent(q)}` +
      '&format=jsonv2&addressdetails=1&limit=8&accept-language=es'
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return []

    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []

    const out: Place[] = []
    const vistos = new Set<string>()

    for (const raw of data as NominatimItem[]) {
      const lat = Number(raw.lat)
      const lon = Number(raw.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
      if (raw.type && !PLACE_TYPES.has(raw.type)) continue

      const addr = raw.address ?? {}
      const name =
        raw.name ||
        addr.city || addr.town || addr.village || addr.hamlet || addr.municipality ||
        (raw.display_name ?? '').split(',')[0]
      if (!name) continue

      const country = addr.country ?? ''
      const cc = (addr.country_code ?? '').toLowerCase()
      const region = addr.state ?? addr.province ?? addr.region ?? ''

      // Evita repetir el mismo pueblo devuelto por varias entradas.
      const clave = `${name}|${region}|${country}`
      if (vistos.has(clave)) continue
      vistos.add(clave)

      const { utc, dst } = zoneFor(cc, lon)
      out.push({
        // El prefijo distingue estos de los de la lista propia.
        id: `geo:${lat.toFixed(4)},${lon.toFixed(4)}`,
        name: region && region !== name ? `${name} (${region})` : name,
        country: country || 'Desconocido',
        lat,
        lon,
        utc,
        dst,
      })
    }
    return out
  } catch {
    // Sin red, bloqueado o cancelado: la lista propia sigue funcionando.
    return []
  }
}

/** ¿Es un lugar traído de la geocodificación (y no de la lista propia)? */
export const isGeocoded = (id: string) => id.startsWith('geo:')

/** Reconstruye un `Place` desde su id `geo:lat,lon`, para la memoria. */
export function placeFromId(id: string, name: string, country: string): Place | null {
  if (!isGeocoded(id)) return null
  const [lat, lon] = id.slice(4).split(',').map(Number)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  const cc = ''
  const { utc, dst } = zoneFor(cc, lon)
  return { id, name, country, lat, lon, utc, dst }
}
