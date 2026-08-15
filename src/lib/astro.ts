/**
 * Motor astronómico para la carta astral — sin APIs.
 *
 * Posiciones planetarias por elementos keplerianos (aproximación de Standish,
 * JPL, válida 1800–2050; error < ~1° en longitud, de sobra para ubicar signo
 * y casa). Luna por la serie principal de Meeus (cap. 47 truncado, ~0,2°).
 * Ascendente y Medio Cielo por tiempo sidéreo local. Casas por signos enteros
 * (whole-sign), el sistema más antiguo y el único robusto sin minutos exactos.
 */

const RAD = Math.PI / 180

const norm360 = (d: number) => ((d % 360) + 360) % 360

/* ─── Tiempo ─── */

/** Día juliano desde fecha y hora UTC. */
export function julianDay(
  y: number,
  m: number,
  d: number,
  hourUTC: number,
): number {
  if (m <= 2) {
    y -= 1
    m += 12
  }
  const a = Math.floor(y / 100)
  const b = 2 - a + Math.floor(a / 4)
  return (
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    d + b - 1524.5 + hourUTC / 24
  )
}

/** Siglos julianos desde J2000.0 */
const centuries = (jd: number) => (jd - 2451545.0) / 36525

/** Oblicuidad media de la eclíptica (grados). */
function obliquity(T: number): number {
  return 23.43929111 - 0.0130042 * T - 1.64e-7 * T * T
}

/** Tiempo sidéreo medio de Greenwich, en grados. */
function gmst(jd: number): number {
  const T = centuries(jd)
  return norm360(
    280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T,
  )
}

/* ─── Planetas (elementos keplerianos J2000 + variación secular) ─── */

type Kepler = readonly [number, number, number, number, number, number]

interface Body {
  name: string
  glyph: string
  el0: Kepler // a, e, I, L, ϖ, Ω en J2000
  rate: Kepler // variación por siglo juliano
}

// a (UA), e, I (°), L (°), longitud del perihelio ϖ (°), nodo Ω (°)
const BODIES: readonly Body[] = [
  { name: 'Mercurio', glyph: '☿',
    el0: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
    rate: [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081] },
  { name: 'Venus', glyph: '♀',
    el0: [0.72333566, 0.00677672, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
    rate: [0.0000039, -0.00004107, -0.0007889, 58517.81538729, 0.00268329, -0.27769418] },
  { name: 'Tierra', glyph: '⊕',
    el0: [1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0],
    rate: [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0] },
  { name: 'Marte', glyph: '♂',
    el0: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
    rate: [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343] },
  { name: 'Júpiter', glyph: '♃',
    el0: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
    rate: [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106] },
  { name: 'Saturno', glyph: '♄',
    el0: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
    rate: [-0.0012506, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794] },
  { name: 'Urano', glyph: '♅',
    el0: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503],
    rate: [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589] },
  { name: 'Neptuno', glyph: '♆',
    el0: [30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
    rate: [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664] },
  { name: 'Plutón', glyph: '♇',
    el0: [39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
    rate: [-0.00031596, 0.0000517, 0.00004818, 145.20780515, -0.04062942, -0.01183482] },
]

/** Resuelve la ecuación de Kepler M = E − e·sinE (iteración de Newton). */
function keplerE(Mdeg: number, e: number): number {
  const M = norm360(Mdeg) * RAD
  let E = M + e * Math.sin(M)
  for (let i = 0; i < 8; i++) {
    E -= (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
  }
  return E
}

/** Posición heliocéntrica eclíptica rectangular (UA). */
function heliocentric(b: Body, T: number): [number, number, number] {
  const [a, e, I, L, w, O] = b.el0.map((v, i) => v + b.rate[i] * T)
  const M = L - w
  const argPeri = (w - O) * RAD
  const E = keplerE(M, e)

  // en el plano orbital
  const xp = a * (Math.cos(E) - e)
  const yp = a * Math.sqrt(1 - e * e) * Math.sin(E)

  const cO = Math.cos(O * RAD), sO = Math.sin(O * RAD)
  const ci = Math.cos(I * RAD), si = Math.sin(I * RAD)
  const cw = Math.cos(argPeri), sw = Math.sin(argPeri)

  const x =
    (cw * cO - sw * sO * ci) * xp + (-sw * cO - cw * sO * ci) * yp
  const y =
    (cw * sO + sw * cO * ci) * xp + (-sw * sO + cw * cO * ci) * yp
  const z = sw * si * xp + cw * si * yp
  return [x, y, z]
}

/** Longitud eclíptica geocéntrica de un cuerpo (grados). */
function geoLongitude(b: Body, T: number): number {
  const [xe, ye] = heliocentric(BODIES[2], T)
  const [xp, yp] = heliocentric(b, T)
  return norm360(Math.atan2(yp - ye, xp - xe) / RAD)
}

/** Longitud geocéntrica del Sol = dirección opuesta a la Tierra. */
export function sunLongitude(T: number): number {
  const [xe, ye] = heliocentric(BODIES[2], T)
  return norm360(Math.atan2(-ye, -xe) / RAD)
}

/** Longitud eclíptica de la Luna — serie principal de Meeus (~0,2°). */
export function moonLongitude(T: number): number {
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
  const D = 297.8501921 + 445267.1114034 * T
  const M = 357.5291092 + 35999.0502909 * T
  const Mp = 134.9633964 + 477198.8675055 * T
  const F = 93.272095 + 483202.0175233 * T
  const s = (deg: number) => Math.sin(deg * RAD)

  const dL =
    6.288774 * s(Mp) +
    1.274027 * s(2 * D - Mp) +
    0.658314 * s(2 * D) +
    0.213618 * s(2 * Mp) -
    0.185116 * s(M) -
    0.114332 * s(2 * F) +
    0.058793 * s(2 * D - 2 * Mp) +
    0.057066 * s(2 * D - M - Mp) +
    0.053322 * s(2 * D + Mp) +
    0.045758 * s(2 * D - M) -
    0.040923 * s(M - Mp) -
    0.03472 * s(D) -
    0.030383 * s(M + Mp)

  return norm360(Lp + dL)
}

/* ─── Ascendente y Medio Cielo ─── */

export function ascendant(jd: number, latDeg: number, lonDeg: number): number {
  const T = centuries(jd)
  const eps = obliquity(T) * RAD
  const ramc = norm360(gmst(jd) + lonDeg) * RAD // tiempo sidéreo local
  const lat = latDeg * RAD

  const asc = Math.atan2(
    Math.cos(ramc),
    -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)),
  )
  return norm360(asc / RAD)
}

export function midheaven(jd: number): number {
  const T = centuries(jd)
  const eps = obliquity(T) * RAD
  const ramc = gmst(jd) * RAD
  return norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / RAD)
}

/** MC con longitud local. */
export function midheavenLocal(jd: number, lonDeg: number): number {
  const T = centuries(jd)
  const eps = obliquity(T) * RAD
  const ramc = norm360(gmst(jd) + lonDeg) * RAD
  return norm360(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / RAD)
}

/* ─── Carta completa ─── */

export interface PlanetPos {
  name: string
  glyph: string
  /** longitud eclíptica 0–360 */
  lon: number
  /** índice de signo 0=Aries … 11=Piscis */
  sign: number
  /** grados dentro del signo */
  deg: number
  retrograde: boolean
}

export interface Chart {
  jd: number
  planets: PlanetPos[] // Sol y Luna incluidos, en orden tradicional
  /** null cuando no hay hora de nacimiento */
  asc: number | null
  mc: number | null
  /** casa (1–12) por índice de signo, sistema de signos enteros; null sin hora */
  houseOfSign: ((signIdx: number) => number) | null
}

const signOf = (lon: number) => Math.floor(norm360(lon) / 30)

/**
 * Calcula la carta.
 * @param hourLocal hora local decimal (p. ej. 14.5 = 14:30); null si se desconoce
 * @param utcOffset horas respecto a UTC del lugar y fecha de nacimiento
 */
export function computeChart(
  y: number,
  m: number,
  d: number,
  hourLocal: number | null,
  utcOffset: number,
  lat: number | null,
  lon: number | null,
): Chart {
  // Sin hora: usamos mediodía local para minimizar el error máximo de la Luna.
  const h = hourLocal ?? 12
  const jd = julianDay(y, m, d, h - utcOffset)
  const T = centuries(jd)
  const Tb = centuries(jd - 1) // ayer, para detectar retrogradación

  const mk = (name: string, glyph: string, lonNow: number, lonPrev: number): PlanetPos => ({
    name,
    glyph,
    lon: lonNow,
    sign: signOf(lonNow),
    deg: norm360(lonNow) % 30,
    // retrógrado si la longitud disminuye (con cuidado del cruce 360→0)
    retrograde: norm360(lonNow - lonPrev + 180) - 180 < 0,
  })

  const planets: PlanetPos[] = [
    mk('Sol', '☉', sunLongitude(T), sunLongitude(Tb)),
    mk('Luna', '☾', moonLongitude(T), moonLongitude(Tb)),
    ...BODIES.filter((b) => b.name !== 'Tierra').map((b) =>
      mk(b.name, b.glyph, geoLongitude(b, T), geoLongitude(b, Tb)),
    ),
  ]
  // El Sol y la Luna nunca retrogradan; limpia el falso positivo numérico.
  planets[0].retrograde = false
  planets[1].retrograde = false

  const hasTime = hourLocal !== null && lat !== null && lon !== null
  const asc = hasTime ? ascendant(jd, lat, lon) : null
  const mc = hasTime ? midheavenLocal(jd, lon) : null

  const ascSign = asc !== null ? signOf(asc) : null
  const houseOfSign =
    ascSign !== null ? (s: number) => ((s - ascSign + 12) % 12) + 1 : null

  return { jd, planets, asc, mc, houseOfSign }
}
