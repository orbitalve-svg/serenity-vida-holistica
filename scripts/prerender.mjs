/**
 * Prerender + URLs absolutas + sitemap.
 *
 * Corre al final de `npm run build`, tras los dos `vite build` (navegador y
 * servidor). Sin navegador ni Puppeteer: renderiza con React en Node, así que
 * funciona igual en tu PC y en el build del hosting.
 *
 * Con la variable de entorno SITE_URL definida (ej.
 * `SITE_URL=https://serenityvidaholistica.com npm run build`, o configurada en
 * el panel del hosting) además:
 *   · añade <link rel="canonical">
 *   · convierte og:url, og:image y twitter:image a URL absoluta — WhatsApp y
 *     Google exigen absolutas y hoy son relativas, así que la tarjeta al
 *     compartir no se ve
 *   · escribe sitemap.xml y lo enlaza desde robots.txt
 *
 * Si algo falla, el build falla: mejor enterarse aquí que publicar un
 * index.html vacío pensando que va prerenderizado.
 */
import { appendFile, readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const raiz = process.cwd()
const rutaIndex = resolve(raiz, 'dist/index.html')
const rutaServidor = resolve(raiz, 'dist-ssr/entry-server.js')
const MARCA = '<div id="root"></div>'

const { render } = await import(pathToFileURL(rutaServidor).href)
const html = await render()

let doc = await readFile(rutaIndex, 'utf8')
if (!doc.includes(MARCA)) {
  throw new Error(`prerender: no encuentro ${MARCA} en dist/index.html`)
}
if (html.length < 5000) {
  throw new Error(`prerender: el HTML generado es sospechosamente corto (${html.length} bytes)`)
}
doc = doc.replace(MARCA, `<div id="root">${html}</div>`)

// Sin barra final, para no generar rutas con doble barra.
const base = (process.env.SITE_URL || '').trim().replace(/\/+$/, '')

if (base) {
  doc = doc
    .replace('<title>', `<link rel="canonical" href="${base}/" />\n    <title>`)
    .replaceAll('content="/og-image.jpg"', `content="${base}/og-image.jpg"`)
  // Busca la etiqueta, no la cadena: «og:url» aparece también en un
  // comentario del HTML, y comprobarlo así daba siempre positivo — la
  // etiqueta no se añadía nunca.
  if (!doc.includes('property="og:url"')) {
    doc = doc.replace(
      '<meta property="og:type"',
      `<meta property="og:url" content="${base}/" />\n    <meta property="og:type"`,
    )
  }

  const hoy = new Date().toISOString().slice(0, 10)
  await writeFile(
    resolve(raiz, 'dist/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${base}/</loc>
    <lastmod>${hoy}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`,
  )
  await appendFile(resolve(raiz, 'dist/robots.txt'), `\nSitemap: ${base}/sitemap.xml\n`)
}

await writeFile(rutaIndex, doc)
// El bundle de servidor ya cumplió: no tiene que viajar al hosting.
await rm(resolve(raiz, 'dist-ssr'), { recursive: true, force: true })

const palabras = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
console.log(`✓ prerender: ${(html.length / 1024).toFixed(0)} kB de HTML, ~${palabras} palabras`)
console.log(
  base
    ? `✓ canonical, OG absolutas y sitemap.xml con dominio ${base}`
    : '⚠ SITE_URL no definida: sin canonical, sin sitemap y con og:image relativa (WhatsApp no mostrará la tarjeta). Defínela al publicar.',
)
