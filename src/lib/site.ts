export const WHATSAPP_NUMBER = '584248042545'
export const PHONE_DISPLAY = '0424-8042545'
export const ADDRESS = 'C.C. Anna, Av. Principal de Lechería, Anzoátegui, Venezuela'
export const ADDRESS_SHORT = 'Av. Principal de Lechería · C.C. Anna · Local Étnicas'
export const INSTAGRAM = '@terapiasanacionyluz'
export const INSTAGRAM_URL = 'https://instagram.com/terapiasanacionyluz'

/** Build a wa.me link with a pre-filled message. */
export function wa(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

/** Aire entre la barra fija y el encabezado al que saltamos. */
const SCROLL_GAP = 28

/**
 * Posición del elemento dentro del documento, **ignorando transformaciones**.
 *
 * No sirve `getBoundingClientRect()` aquí: los encabezados van dentro de un
 * `.reveal`, que hasta que aparece mantiene `translateY(34px)`. Medir con el
 * rect daba una posición 34px más abajo de la real, así que el salto quedaba
 * corto y, al animarse el reveal, el título terminaba detrás de la barra.
 * `offsetTop` es posición de maquetación pura y no la afecta el transform.
 */
function layoutTop(el: HTMLElement): number {
  let y = 0
  let node: HTMLElement | null = el
  while (node) {
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return y
}

/**
 * Lleva a una sección por su id.
 *
 * Encuadra por el **encabezado** de la sección (marcado con
 * `data-scroll-anchor`), no por su borde superior. Las secciones tienen mucho
 * relleno y algunas abren con una pieza decorativa grande —el Cubo de
 * Metatrón, el orbe—, así que encuadrar por el borde hacía aterrizar el título
 * a alturas muy dispares (170px en Servicios, 434px en Contacto). Así todas
 * caen igual.
 *
 * Además descuenta la altura real de la barra fija, que antes tapaba los
 * primeros 72px de cada sección.
 */
export function scrollToId(id: string): void {
  const el = document.getElementById(id)
  if (!el) return

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const behavior: ScrollBehavior = reduce ? 'auto' : 'smooth'

  // El Hero ocupa la pantalla completa: su sitio es arriba del todo.
  if (id === 'inicio') {
    window.scrollTo({ top: 0, behavior })
    return
  }

  const nav = document.querySelector('nav')
  const navH = nav ? nav.getBoundingClientRect().height : 0

  const anchor = (el.querySelector('[data-scroll-anchor]') ??
    el.querySelector('h2') ??
    el) as HTMLElement
  const top = layoutTop(anchor) - navH - SCROLL_GAP

  window.scrollTo({ top: Math.max(0, top), behavior })
}
