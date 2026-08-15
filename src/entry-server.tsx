import { Writable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import App from './App'

/**
 * Renderiza la app a HTML, en Node, sin navegador.
 *
 * Lo usa `scripts/prerender.mjs` al construir: el `index.html` de producción
 * sale con las ~1.600 palabras dentro en vez de un `<div id="root">` vacío.
 * Google indexa igual con o sin esto, pero con retraso y menos fiabilidad, y
 * cualquier otro rastreador veía una página en blanco.
 *
 * `renderToPipeableStream` + `onAllReady`, y no `renderToString`: las
 * secciones perezosas (Formaciones, Chakras, carta astral…) van en
 * `React.lazy`, y `renderToString` las habría dejado en su *fallback*.
 */
export function render(): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = ''
    const sink = new Writable({
      write(chunk, _enc, cb) {
        html += chunk.toString()
        cb()
      },
    })
    sink.on('finish', () => resolve(html))
    sink.on('error', reject)

    const { pipe } = renderToPipeableStream(<App />, {
      onAllReady() {
        pipe(sink)
      },
      onError(err) {
        reject(err)
      },
    })
  })
}
