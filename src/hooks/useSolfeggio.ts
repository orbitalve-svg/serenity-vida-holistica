/**
 * Genera las frecuencias Solfeggio con la Web Audio API — síntesis pura, sin
 * archivos de audio.
 *
 * Todas las voces cuelgan de un mismo nodo de ganancia («el bus»): así una sola
 * operación las funde y las detiene a todas. La versión anterior conectaba el
 * armónico directamente a la salida y sólo guardaba el oscilador principal, de
 * modo que al apagar seguía sonando el armónico — y cada reproducción apilaba
 * uno nuevo.
 */

let ctx: AudioContext | null = null

interface Voice {
  /** todos los osciladores del tono, para detenerlos juntos */
  oscs: OscillatorNode[]
  /** ganancia común: fundido de entrada y de salida */
  bus: GainNode
}

let voice: Voice | null = null

/** Volumen del tono ya asentado. */
const PEAK = 0.12
const FADE_IN = 0.8
const FADE_OUT = 0.6

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  return ctx
}

/** Hace sonar la frecuencia `hz`, con entrada suave, hasta que se detenga. */
export function playSolfeggio(hz: number): void {
  stopSolfeggio()

  const ac = getCtx()
  // Los navegadores arrancan el audio suspendido hasta que hay un gesto.
  if (ac.state === 'suspended') void ac.resume()

  const now = ac.currentTime

  const bus = ac.createGain()
  bus.gain.setValueAtTime(0, now)
  bus.gain.linearRampToValueAtTime(PEAK, now + FADE_IN)
  bus.connect(ac.destination)

  // Tono principal: seno puro a la frecuencia Solfeggio.
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = hz
  osc.connect(bus)
  osc.start()

  // Armónico una octava arriba, a un tercio del volumen, para dar cuerpo.
  const harmGain = ac.createGain()
  harmGain.gain.value = 1 / 3
  harmGain.connect(bus)

  const harmonic = ac.createOscillator()
  harmonic.type = 'sine'
  harmonic.frequency.value = hz * 2
  harmonic.connect(harmGain)
  harmonic.start()

  voice = { oscs: [osc, harmonic], bus }
}

/** Funde y detiene el tono activo, liberando todos sus nodos. */
export function stopSolfeggio(): void {
  if (!voice || !ctx) return

  const { oscs, bus } = voice
  const ac = ctx
  const now = ac.currentTime

  // Si aún estaba subiendo el volumen, hay que cancelar esa rampa y fijar el
  // valor actual; si no, el fundido de salida partiría del valor programado.
  bus.gain.cancelScheduledValues(now)
  bus.gain.setValueAtTime(bus.gain.value, now)
  bus.gain.linearRampToValueAtTime(0, now + FADE_OUT)

  let pendientes = oscs.length
  oscs.forEach((o) => {
    o.stop(now + FADE_OUT + 0.05)
    o.onended = () => {
      o.disconnect()
      pendientes -= 1
      if (pendientes === 0) bus.disconnect()
    }
  })

  voice = null
}

/** ¿Hay algún tono sonando ahora mismo? */
export function isSolfeggioPlaying(): boolean {
  return voice !== null
}
