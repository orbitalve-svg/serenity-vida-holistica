/* ─── Cálculo de fase lunar (JS puro, sin API) ─── */

/** Duración del mes sinódico (de luna nueva a luna nueva), en días. */
export const SYNODIC_MONTH = 29.530588853

export interface LunarData {
  phase: number        // 0–1 (0 = luna nueva, 0.5 = luna llena)
  phaseName: string
  phaseEmoji: string
  illumination: number // 0–100 %
  daysInCycle: number  // día del ciclo de 29.5 días
  waning: boolean
}

export function getLunarData(date: Date): LunarData {
  // Luna nueva de referencia: 6 ene 2000 18:14 UTC
  const knownNew = new Date('2000-01-06T18:14:00Z').getTime()
  const CYCLE = 29.530588853 * 24 * 60 * 60 * 1000 // ms

  const elapsed = date.getTime() - knownNew
  const phase = ((elapsed % CYCLE) + CYCLE) % CYCLE / CYCLE // 0–1
  const daysInCycle = phase * 29.530588853
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100)
  const waning = phase > 0.5

  let phaseName: string
  let phaseEmoji: string

  if (phase < 0.03 || phase >= 0.97) {
    phaseName = 'Luna Nueva'; phaseEmoji = '🌑'
  } else if (phase < 0.22) {
    phaseName = 'Luna Creciente'; phaseEmoji = '🌒'
  } else if (phase < 0.28) {
    phaseName = 'Cuarto Creciente'; phaseEmoji = '🌓'
  } else if (phase < 0.47) {
    phaseName = 'Luna Gibosa Creciente'; phaseEmoji = '🌔'
  } else if (phase < 0.53) {
    phaseName = 'Luna Llena'; phaseEmoji = '🌕'
  } else if (phase < 0.72) {
    phaseName = 'Luna Gibosa Menguante'; phaseEmoji = '🌖'
  } else if (phase < 0.78) {
    phaseName = 'Cuarto Menguante'; phaseEmoji = '🌗'
  } else {
    phaseName = 'Luna Menguante'; phaseEmoji = '🌘'
  }

  return { phase, phaseName, phaseEmoji, illumination, daysInCycle, waning }
}

/* ─── Significado espiritual por fase ─── */

export interface PhaseGuide {
  energy: string
  intention: string
  ritual: string
  service: string
  serviceMsg: string
  color: string
}

export function getPhaseGuide(phaseName: string): PhaseGuide {
  const guides: Record<string, PhaseGuide> = {
    'Luna Nueva': {
      energy: 'Renacimiento y nuevos comienzos. El silencio antes de la creación.',
      intention: 'Siembra tus intenciones más profundas. ¿Qué deseas atraer a tu vida?',
      ritual: 'Escribe en papel lo que deseas manifestar. Enciende una vela blanca y declara en voz alta tu intención.',
      service: 'Registros Akáshicos',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Nueva y quiero abrir una sesión de Registros Akáshicos para plantar una intención de alma.',
      color: '#5B2C82',
    },
    'Luna Creciente': {
      energy: 'Impulso y acción. La energía empieza a moverse hacia la luz.',
      intention: 'Toma las primeras acciones hacia tus metas. La luna te da impulso.',
      ritual: 'Crea una lista de 3 acciones concretas que sostengan tu intención. Mueve el cuerpo: danza, camina, respira.',
      service: 'Masaje Energético con Reiki',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Creciente y quiero un Masaje Energético con Reiki para activar mi energía.',
      color: '#E8893C',
    },
    'Cuarto Creciente': {
      energy: 'Decisión y voluntad. Momento de comprometerte con lo que empezaste.',
      intention: 'Supera los obstáculos internos. ¿Qué creencia limita tu avance?',
      ritual: 'Medita 10 minutos sobre tus bloqueos. Escribe qué debes soltar para avanzar.',
      service: 'Sanación Energética',
      serviceMsg: 'Hola Serenity 🙏, estamos en Cuarto Creciente y quiero una sesión de Sanación Energética para disolver bloqueos.',
      color: '#E8C04B',
    },
    'Luna Gibosa Creciente': {
      energy: 'Refinamiento y perseverancia. Casi en la cima — ajusta y sostén.',
      intention: 'Revisa tus intenciones y afínalas. La manifestación está próxima.',
      ritual: 'Usa cristales de citrino o cuarzo transparente. Repite tu afirmación 9 veces en la noche.',
      service: 'Limpieza y Armonización de Chakras',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Gibosa Creciente y quiero una Limpieza y Armonización de Chakras para preparar mi campo.',
      color: '#C9A84C',
    },
    'Luna Llena': {
      energy: 'Plenitud, revelación y liberación. La luz ilumina todo lo que fue oculto.',
      intention: 'Suelta lo que ya no te sirve. Celebra tus logros y agradece.',
      ritual: 'Baño de sal marina con intención de purificación. Carga tus cristales bajo la luna. Escribe en papel lo que deseas liberar y quémalo con seguridad.',
      service: 'Constelaciones Familiares',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Llena y quiero una sesión de Constelaciones Familiares para liberar y cerrar ciclos familiares.',
      color: '#9B5DE5',
    },
    'Luna Gibosa Menguante': {
      energy: 'Gratitud y compartir. Da a los demás lo que aprendiste en este ciclo.',
      intention: 'Comparte tu luz. ¿Cómo puedes ser un instrumento de sanación?',
      ritual: 'Escribe una carta de gratitud a alguien que te haya enseñado algo. Dona o ayuda a quien lo necesita.',
      service: 'Reiki Presencial y a Distancia',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Gibosa Menguante y quiero una sesión de Reiki para integrar y compartir la energía del ciclo.',
      color: '#3FA7D6',
    },
    'Cuarto Menguante': {
      energy: 'Perdón y rendición. Suelta el control y confía en el proceso.',
      intention: 'Practica el perdón profundo — contigo mismo/a primero.',
      ritual: 'Escribe en papel el nombre de todo lo que no has perdonado. Sumérgelo en agua con sal y viértela en la tierra.',
      service: 'Sanación Energética',
      serviceMsg: 'Hola Serenity 🙏, estamos en Cuarto Menguante y quiero una sesión de Sanación Energética para trabajar el perdón y la rendición.',
      color: '#5B6BD6',
    },
    'Luna Menguante': {
      energy: 'Descanso, reflexión e integración. El ciclo se cierra con sabiduría.',
      intention: 'Descansa sin culpa. El silencio antes de la nueva luna es sagrado.',
      ritual: 'Meditación guiada en silencio. Journaling: ¿qué aprendió tu alma en este ciclo lunar?',
      service: 'Aromaterapia dōTERRA',
      serviceMsg: 'Hola Serenity 🙏, estamos en Luna Menguante y quiero una sesión de Aromaterapia dōTERRA para descansar y cerrar el ciclo.',
      color: '#5BB97A',
    },
  }
  return guides[phaseName] ?? guides['Luna Nueva']
}
