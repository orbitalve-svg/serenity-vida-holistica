/**
 * Memoria del visitante.
 *
 * Guarda lo que la persona ya nos contó (su chakra bloqueado y su fecha de
 * nacimiento) para que la web la reconozca al volver, en lugar de pedirle todo
 * de nuevo. Todo vive en el navegador — no se envía a ningún servidor.
 */

import type { Place } from './places'

const KEY = 'serenity.memory.v1'

export interface SerenityMemory {
  /** Chakra resultante del diagnóstico */
  chakra?: string
  chakraSanskrit?: string
  chakraColor?: string
  /** Fecha de nacimiento en formato YYYY-MM-DD */
  birthDate?: string
  /** Hora de nacimiento HH:MM, si la persona la conoce */
  birthTime?: string
  /**
   * Lugar de nacimiento completo.
   *
   * Se guarda el objeto entero, no un id, porque los lugares que llegan de la
   * geocodificación no están en `places.ts` y no podrían reconstruirse.
   * Las versiones anteriores guardaban sólo el id: por eso se admite `string`.
   */
  birthPlace?: Place | string
  sign?: string
  signGlyph?: string
  /** Última visita, ISO */
  lastVisit?: string
}

/** Lee la memoria. Devuelve `{}` si no hay nada o si el almacenamiento falla. */
export function loadMemory(): SerenityMemory {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    return parsed as SerenityMemory
  } catch {
    // Modo privado o almacenamiento bloqueado: seguimos sin memoria.
    return {}
  }
}

/** Fusiona y persiste. Nunca lanza. */
export function saveMemory(patch: Partial<SerenityMemory>): SerenityMemory {
  const next = { ...loadMemory(), ...patch, lastVisit: new Date().toISOString() }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* sin persistencia disponible */
  }
  return next
}

/** Borra todo lo recordado. */
export function clearMemory(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* nada que hacer */
  }
}

/** ¿Hay algo que valga la pena saludar? */
export function hasMemory(m: SerenityMemory): boolean {
  return Boolean(m.chakra || m.sign)
}
