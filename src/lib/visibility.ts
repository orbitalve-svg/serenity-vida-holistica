/**
 * Ejecuta un bucle de animación sólo mientras el elemento está en pantalla.
 *
 * Las piezas 3D (Cubo de Metatrón, esfera armilar, rueda astral, la luz del
 * Hero) corrían su `requestAnimationFrame` sin parar aunque estuvieran diez
 * pantallas fuera de la vista: cálculo y batería desperdiciados en móvil.
 * Un IntersectionObserver arranca y detiene el bucle según visibilidad.
 *
 * Devuelve la función de limpieza para el `useEffect`.
 */
export function runWhileVisible(
  el: Element,
  tick: (now: number) => void,
): () => void {
  let raf = 0
  let running = false

  const loop = (now: number) => {
    tick(now)
    if (running) raf = requestAnimationFrame(loop)
  }
  const start = () => {
    if (running) return
    running = true
    raf = requestAnimationFrame(loop)
  }
  const stop = () => {
    running = false
    cancelAnimationFrame(raf)
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) start()
      else stop()
    },
    // Margen para que arranque justo antes de entrar y no se vea el despertar.
    { rootMargin: '120px' },
  )
  io.observe(el)

  return () => {
    stop()
    io.disconnect()
  }
}
