/**
 * Prerender: vuelca el HTML de la app dentro de `dist/index.html`.
 *
 * Corre al final de `npm run build`, después de los dos `vite build` (el del
 * navegador y el de servidor). Sin navegador ni Puppeteer: renderiza con
 * React en Node, así que funciona igual en tu PC y en el build de Vercel o
 * Cloudflare.
 *
 * Si algo falla, el build falla: mejor enterarse aquí que publicar un
 * `index.html` vacío pensando que va prerenderizado.
 */
import { readFile, rm, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const raiz = process.cwd()
const rutaIndex = resolve(raiz, 'dist/index.html')
const rutaServidor = resolve(raiz, 'dist-ssr/entry-server.js')
const MARCA = '<div id="root"></div>'

const { render } = await import(pathToFileURL(rutaServidor).href)
const html = await render()

const plantilla = await readFile(rutaIndex, 'utf8')
if (!plantilla.includes(MARCA)) {
  throw new Error(`prerender: no encuentro ${MARCA} en dist/index.html`)
}
if (html.length < 5000) {
  throw new Error(`prerender: el HTML generado es sospechosamente corto (${html.length} bytes)`)
}

await writeFile(rutaIndex, plantilla.replace(MARCA, `<div id="root">${html}</div>`))
// El bundle de servidor ya cumplió: no tiene que viajar al hosting.
await rm(resolve(raiz, 'dist-ssr'), { recursive: true, force: true })

const palabras = html.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length
console.log(`✓ prerender: ${(html.length / 1024).toFixed(0)} kB de HTML, ~${palabras} palabras en dist/index.html`)
