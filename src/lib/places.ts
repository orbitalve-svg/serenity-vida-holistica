/**
 * Lugares de nacimiento — coordenadas y huso horario, sin API.
 *
 * El huso se resuelve con la fecha de nacimiento: Venezuela usó UTC−4:30
 * entre el 9-dic-2007 y el 1-may-2016 (media hora mueve el Ascendente ~7°,
 * así que no es un detalle). Para países con horario de verano se aplica una
 * regla estacional aproximada; el margen se declara en la interfaz.
 */

export interface Place {
  id: string
  name: string
  country: string
  lat: number
  lon: number
  /** huso estándar (horas respecto a UTC) */
  utc: number
  /** regla de horario de verano */
  dst: 'none' | 've' | 'eu' | 'us' | 'cl'
}

/** Atajo: en Venezuela todos comparten huso y regla de verano. */
const ve = (id: string, name: string, lat: number, lon: number): Place => ({
  id, name, country: 'Venezuela', lat, lon, utc: -4, dst: 've',
})

export const PLACES: Place[] = [
  // ── Venezuela — el público principal ──
  // Anzoátegui (donde está el consultorio)
  ve('lecheria', 'Lechería', 10.19, -64.69),
  ve('pto-la-cruz', 'Puerto La Cruz', 10.21, -64.63),
  ve('barcelona-ve', 'Barcelona', 10.13, -64.69),
  ve('el-tigre', 'El Tigre', 8.89, -64.25),
  ve('anaco', 'Anaco', 9.43, -64.47),
  ve('cantaura', 'Cantaura', 9.31, -64.36),
  ve('pto-piritu', 'Puerto Píritu', 10.06, -65.04),
  ve('guanta', 'Guanta', 10.24, -64.6),
  // Capital y Miranda
  ve('caracas', 'Caracas', 10.49, -66.88),
  ve('los-teques', 'Los Teques', 10.34, -67.04),
  ve('guatire', 'Guatire', 10.47, -66.54),
  ve('guarenas', 'Guarenas', 10.47, -66.61),
  ve('charallave', 'Charallave', 10.24, -66.86),
  ve('cua', 'Cúa', 10.16, -66.89),
  ve('ocumare-tuy', 'Ocumare del Tuy', 10.11, -66.77),
  ve('la-guaira', 'La Guaira', 10.6, -66.93),
  ve('catia-la-mar', 'Catia La Mar', 10.6, -67.03),
  // Zulia
  ve('maracaibo', 'Maracaibo', 10.65, -71.63),
  ve('cabimas', 'Cabimas', 10.39, -71.45),
  ve('cd-ojeda', 'Ciudad Ojeda', 10.2, -71.31),
  ve('machiques', 'Machiques', 10.06, -72.55),
  ve('sta-barbara-zulia', 'Santa Bárbara del Zulia', 8.96, -71.91),
  // Carabobo y Aragua
  ve('valencia-ve', 'Valencia', 10.16, -68.0),
  ve('guacara', 'Guacara', 10.23, -67.88),
  ve('pto-cabello', 'Puerto Cabello', 10.47, -68.01),
  ve('moron', 'Morón', 10.49, -68.2),
  ve('maracay', 'Maracay', 10.25, -67.6),
  ve('turmero', 'Turmero', 10.23, -67.47),
  ve('cagua', 'Cagua', 10.19, -67.46),
  ve('la-victoria', 'La Victoria', 10.23, -67.33),
  ve('villa-de-cura', 'Villa de Cura', 10.04, -67.49),
  // Lara y Yaracuy
  ve('barquisimeto', 'Barquisimeto', 10.07, -69.32),
  ve('cabudare', 'Cabudare', 10.03, -69.27),
  ve('carora', 'Carora', 10.17, -70.08),
  ve('quibor', 'Quíbor', 9.93, -69.62),
  ve('san-felipe', 'San Felipe', 10.34, -68.74),
  ve('yaritagua', 'Yaritagua', 10.08, -69.13),
  // Oriente y Guayana
  ve('cd-guayana', 'Ciudad Guayana (Puerto Ordaz)', 8.35, -62.65),
  ve('cd-bolivar', 'Ciudad Bolívar', 8.13, -63.55),
  ve('upata', 'Upata', 8.01, -62.4),
  ve('cumana', 'Cumaná', 10.46, -64.17),
  ve('carupano', 'Carúpano', 10.67, -63.26),
  ve('maturin', 'Maturín', 9.75, -63.18),
  ve('punta-de-mata', 'Punta de Mata', 9.72, -63.6),
  ve('tucupita', 'Tucupita', 9.06, -62.05),
  // Nueva Esparta
  ve('porlamar', 'Porlamar (Margarita)', 10.96, -63.85),
  ve('la-asuncion', 'La Asunción (Margarita)', 11.03, -63.86),
  ve('pampatar', 'Pampatar (Margarita)', 10.99, -63.79),
  // Andes
  ve('merida-ve', 'Mérida', 8.59, -71.14),
  ve('el-vigia', 'El Vigía', 8.62, -71.65),
  ve('san-cristobal', 'San Cristóbal', 7.77, -72.22),
  ve('rubio', 'Rubio', 7.7, -72.36),
  ve('trujillo', 'Trujillo', 9.37, -70.44),
  ve('valera', 'Valera', 9.32, -70.6),
  // Llanos y occidente
  ve('barinas', 'Barinas', 8.62, -70.21),
  ve('guanare', 'Guanare', 9.04, -69.75),
  ve('acarigua', 'Acarigua', 9.56, -69.2),
  ve('araure', 'Araure', 9.58, -69.23),
  ve('san-carlos', 'San Carlos', 9.66, -68.59),
  ve('tinaquillo', 'Tinaquillo', 9.92, -68.3),
  ve('san-juan-morros', 'San Juan de los Morros', 9.9, -67.35),
  ve('calabozo', 'Calabozo', 8.92, -67.43),
  ve('valle-la-pascua', 'Valle de la Pascua', 9.21, -66.01),
  ve('san-fernando-apure', 'San Fernando de Apure', 7.9, -67.47),
  ve('coro', 'Coro', 11.4, -69.67),
  ve('punto-fijo', 'Punto Fijo', 11.69, -70.2),
  ve('pto-ayacucho', 'Puerto Ayacucho', 5.66, -67.62),

  // Latinoamérica
  { id: 'bogota', name: 'Bogotá', country: 'Colombia', lat: 4.71, lon: -74.07, utc: -5, dst: 'none' },
  { id: 'medellin', name: 'Medellín', country: 'Colombia', lat: 6.25, lon: -75.56, utc: -5, dst: 'none' },
  { id: 'cali', name: 'Cali', country: 'Colombia', lat: 3.45, lon: -76.53, utc: -5, dst: 'none' },
  { id: 'barranquilla', name: 'Barranquilla', country: 'Colombia', lat: 10.96, lon: -74.8, utc: -5, dst: 'none' },
  { id: 'cartagena-co', name: 'Cartagena', country: 'Colombia', lat: 10.39, lon: -75.51, utc: -5, dst: 'none' },
  { id: 'cucuta', name: 'Cúcuta', country: 'Colombia', lat: 7.89, lon: -72.5, utc: -5, dst: 'none' },
  { id: 'bucaramanga', name: 'Bucaramanga', country: 'Colombia', lat: 7.12, lon: -73.13, utc: -5, dst: 'none' },
  { id: 'cuenca-ec', name: 'Cuenca', country: 'Ecuador', lat: -2.9, lon: -79.0, utc: -5, dst: 'none' },
  { id: 'arequipa', name: 'Arequipa', country: 'Perú', lat: -16.41, lon: -71.54, utc: -5, dst: 'none' },
  { id: 'cusco', name: 'Cusco', country: 'Perú', lat: -13.53, lon: -71.97, utc: -5, dst: 'none' },
  { id: 'cordoba-ar', name: 'Córdoba', country: 'Argentina', lat: -31.42, lon: -64.18, utc: -3, dst: 'none' },
  { id: 'rosario', name: 'Rosario', country: 'Argentina', lat: -32.95, lon: -60.64, utc: -3, dst: 'none' },
  { id: 'mendoza', name: 'Mendoza', country: 'Argentina', lat: -32.89, lon: -68.84, utc: -3, dst: 'none' },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brasil', lat: -23.55, lon: -46.63, utc: -3, dst: 'none' },
  { id: 'rio-janeiro', name: 'Río de Janeiro', country: 'Brasil', lat: -22.91, lon: -43.17, utc: -3, dst: 'none' },
  { id: 'guadalajara', name: 'Guadalajara', country: 'México', lat: 20.67, lon: -103.35, utc: -6, dst: 'none' },
  { id: 'monterrey', name: 'Monterrey', country: 'México', lat: 25.69, lon: -100.32, utc: -6, dst: 'none' },
  { id: 'cancun', name: 'Cancún', country: 'México', lat: 21.16, lon: -86.85, utc: -5, dst: 'none' },
  { id: 'guatemala', name: 'Ciudad de Guatemala', country: 'Guatemala', lat: 14.63, lon: -90.51, utc: -6, dst: 'none' },
  { id: 'san-salvador', name: 'San Salvador', country: 'El Salvador', lat: 13.69, lon: -89.22, utc: -6, dst: 'none' },
  { id: 'tegucigalpa', name: 'Tegucigalpa', country: 'Honduras', lat: 14.07, lon: -87.19, utc: -6, dst: 'none' },
  { id: 'managua', name: 'Managua', country: 'Nicaragua', lat: 12.11, lon: -86.24, utc: -6, dst: 'none' },
  { id: 'santiago-rd', name: 'Santiago de los Caballeros', country: 'Rep. Dominicana', lat: 19.45, lon: -70.7, utc: -4, dst: 'none' },
  { id: 'quito', name: 'Quito', country: 'Ecuador', lat: -0.18, lon: -78.47, utc: -5, dst: 'none' },
  { id: 'guayaquil', name: 'Guayaquil', country: 'Ecuador', lat: -2.19, lon: -79.89, utc: -5, dst: 'none' },
  { id: 'lima', name: 'Lima', country: 'Perú', lat: -12.05, lon: -77.04, utc: -5, dst: 'none' },
  { id: 'santiago-cl', name: 'Santiago', country: 'Chile', lat: -33.45, lon: -70.67, utc: -4, dst: 'cl' },
  { id: 'buenos-aires', name: 'Buenos Aires', country: 'Argentina', lat: -34.6, lon: -58.38, utc: -3, dst: 'none' },
  { id: 'montevideo', name: 'Montevideo', country: 'Uruguay', lat: -34.9, lon: -56.19, utc: -3, dst: 'none' },
  { id: 'asuncion', name: 'Asunción', country: 'Paraguay', lat: -25.28, lon: -57.63, utc: -4, dst: 'none' },
  { id: 'la-paz', name: 'La Paz', country: 'Bolivia', lat: -16.5, lon: -68.15, utc: -4, dst: 'none' },
  { id: 'cdmx', name: 'Ciudad de México', country: 'México', lat: 19.43, lon: -99.13, utc: -6, dst: 'none' },
  { id: 'panama', name: 'Ciudad de Panamá', country: 'Panamá', lat: 8.98, lon: -79.52, utc: -5, dst: 'none' },
  { id: 'san-jose-cr', name: 'San José', country: 'Costa Rica', lat: 9.93, lon: -84.08, utc: -6, dst: 'none' },
  { id: 'sto-domingo', name: 'Santo Domingo', country: 'Rep. Dominicana', lat: 18.49, lon: -69.93, utc: -4, dst: 'none' },
  { id: 'san-juan-pr', name: 'San Juan', country: 'Puerto Rico', lat: 18.47, lon: -66.11, utc: -4, dst: 'none' },
  { id: 'habana', name: 'La Habana', country: 'Cuba', lat: 23.11, lon: -82.37, utc: -5, dst: 'us' },

  // EE. UU. y Europa frecuentes
  { id: 'miami', name: 'Miami', country: 'EE. UU.', lat: 25.76, lon: -80.19, utc: -5, dst: 'us' },
  { id: 'orlando', name: 'Orlando', country: 'EE. UU.', lat: 28.54, lon: -81.38, utc: -5, dst: 'us' },
  { id: 'houston', name: 'Houston', country: 'EE. UU.', lat: 29.76, lon: -95.37, utc: -6, dst: 'us' },
  { id: 'nueva-york', name: 'Nueva York', country: 'EE. UU.', lat: 40.71, lon: -74.01, utc: -5, dst: 'us' },
  { id: 'madrid', name: 'Madrid', country: 'España', lat: 40.42, lon: -3.7, utc: 1, dst: 'eu' },
  { id: 'barcelona-es', name: 'Barcelona', country: 'España', lat: 41.39, lon: 2.17, utc: 1, dst: 'eu' },
  { id: 'canarias', name: 'Las Palmas (Canarias)', country: 'España', lat: 28.12, lon: -15.43, utc: 0, dst: 'eu' },
  { id: 'tenerife', name: 'Santa Cruz de Tenerife', country: 'España', lat: 28.47, lon: -16.25, utc: 0, dst: 'eu' },
  { id: 'valencia-es', name: 'Valencia', country: 'España', lat: 39.47, lon: -0.38, utc: 1, dst: 'eu' },
  { id: 'sevilla', name: 'Sevilla', country: 'España', lat: 37.39, lon: -5.98, utc: 1, dst: 'eu' },
  { id: 'malaga', name: 'Málaga', country: 'España', lat: 36.72, lon: -4.42, utc: 1, dst: 'eu' },
  { id: 'bilbao', name: 'Bilbao', country: 'España', lat: 43.26, lon: -2.93, utc: 1, dst: 'eu' },
  { id: 'lisboa', name: 'Lisboa', country: 'Portugal', lat: 38.72, lon: -9.14, utc: 0, dst: 'eu' },
  { id: 'roma', name: 'Roma', country: 'Italia', lat: 41.9, lon: 12.5, utc: 1, dst: 'eu' },
  { id: 'chicago', name: 'Chicago', country: 'EE. UU.', lat: 41.88, lon: -87.63, utc: -6, dst: 'us' },
  { id: 'los-angeles', name: 'Los Ángeles', country: 'EE. UU.', lat: 34.05, lon: -118.24, utc: -8, dst: 'us' },
  { id: 'toronto', name: 'Toronto', country: 'Canadá', lat: 43.65, lon: -79.38, utc: -5, dst: 'us' },
]

/** Quita acentos y pasa a minúsculas, para buscar sin importar cómo se escriba. */
export function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Busca lugares por nombre o país, tolerando acentos y coincidencias parciales.
 * Ordena poniendo primero los que empiezan por lo escrito.
 */
export function searchPlaces(query: string, limit = 8): Place[] {
  const q = normalize(query)
  if (!q) return PLACES.slice(0, limit)

  const scored = PLACES.map((p) => {
    const name = normalize(p.name)
    const country = normalize(p.country)
    let score = -1
    if (name.startsWith(q)) score = 0
    else if (name.includes(q)) score = 1
    else if (country.startsWith(q)) score = 2
    else if (country.includes(q)) score = 3
    return { p, score }
  }).filter((x) => x.score >= 0)

  scored.sort((a, b) => a.score - b.score || a.p.name.localeCompare(b.p.name))
  return scored.slice(0, limit).map((x) => x.p)
}

/**
 * Lugares más cercanos a unas coordenadas, por distancia sobre la esfera.
 *
 * Sirve de red de seguridad cuando el pueblo de alguien no está listado: a
 * menos de ~100 km la diferencia de longitud es ~1°, que desplaza el
 * Ascendente alrededor de un grado — irrelevante salvo justo en una cúspide.
 */
export function nearestPlaces(lat: number, lon: number, limit = 3): Place[] {
  const toRad = Math.PI / 180
  return [...PLACES]
    .map((p) => {
      const dLat = (p.lat - lat) * toRad
      const dLon = (p.lon - lon) * toRad
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat * toRad) * Math.cos(p.lat * toRad) * Math.sin(dLon / 2) ** 2
      return { p, km: 6371 * 2 * Math.asin(Math.sqrt(a)) }
    })
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map((x) => x.p)
}

/**
 * Huso horario efectivo del lugar en la fecha de nacimiento.
 * Las reglas de verano son aproximaciones estacionales (±1 h en los bordes);
 * la venezolana es exacta.
 */
export function utcOffsetFor(place: Place, y: number, m: number, d: number): number {
  const stamp = y * 10000 + m * 100 + d
  switch (place.dst) {
    case 've':
      // UTC−4:30 desde el 9-dic-2007 hasta el 1-may-2016
      return stamp >= 20071209 && stamp < 20160501 ? -4.5 : -4
    case 'eu':
      // verano europeo aprox.: fin de marzo a fin de octubre
      return m > 3 && m < 10 ? place.utc + 1 : m === 3 && d >= 25 ? place.utc + 1 : m === 10 && d < 25 ? place.utc + 1 : place.utc
    case 'us':
      // verano EE. UU. aprox. (desde 2007): marzo a comienzos de noviembre
      return m > 3 && m < 11 ? place.utc + 1 : m === 3 && d >= 8 ? place.utc + 1 : m === 11 && d < 7 ? place.utc + 1 : place.utc
    case 'cl':
      // Chile: verano austral aprox. (sep–abr)
      return m >= 9 || m <= 3 ? place.utc + 1 : place.utc
    default:
      return place.utc
  }
}
