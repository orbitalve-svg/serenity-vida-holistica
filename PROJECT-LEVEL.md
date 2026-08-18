# Estado del Proyecto — Serenity Vida Holística

**Nivel actual:** N0 — Estático
**Nivel previsto:** N0 (sin formularios, login ni pagos previstos; toda la conversión va por WhatsApp)
**Última revisión:** 2026-08-15
**Entrevista de Clasificación:** hecha el 2026-08-15 — P1 No · P2 No · P3 No

## Stack
- Framework: React 18 + Vite 5 + TypeScript
- Estilos: Tailwind CSS v3
- Hosting: Vercel (CDN y HTTPS incluidos)
- Base de datos: ninguna
- Persistencia: sólo `localStorage` del visitante (resultado del quiz de chakras, datos de nacimiento para la carta astral). No sale nada del navegador.
- Servicios externos: Nominatim (OpenStreetMap) para geocodificar lugares de nacimiento — llamada directa desde el navegador, sin clave, se degrada sin red.

## Historial de escaladas
| Fecha | De → A | Disparador |
|---|---|---|
| — | — | Sin escaladas |

## Capas aplicadas (N0)
- [x] **3.1 Git + remoto** — hecho el 2026-08-15. Repo privado en `https://github.com/orbitalve-svg/serenity-vida-holistica`, rama `main`, primer commit `834ee16`. Regla: `git status` limpio antes de cada sesión grande de cambios; commit al cerrar cada bloque de trabajo.
- [ ] 3.7 Monitoreo ligero — pendiente: monitor de uptime (UptimeRobot / Better Stack) al publicar.
- [x] 3.12 Imágenes — todas en WebP y dimensionadas al uso (hero, retrato, 70 fotos de galería en dos tamaños, con `loading="lazy"` bajo el pliegue). CDN: lo da Vercel, verificar con `curl -I` tras el primer deploy.
- [ ] 3.14 Cabeceras de seguridad — `vercel.json` creado el 2026-08-15 con CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. **Verificar en securityheaders.com tras el deploy** (objetivo: B o mejor).
- [x] 3.16 Auditoría de dependencias — `npm audit --production`: 0 vulnerabilidades (2026-08-15). Repetir antes de cada deploy.

## Auditoría pre-lanzamiento (Sección 7, N0)
- [x] Repo en remoto y actualizado
- [ ] HTTPS activo, `http://` redirige (Vercel lo hace solo — confirmar)
- [ ] Cabeceras de seguridad, nota B+ en securityheaders.com
- [x] Imágenes en WebP y dimensionadas
- [ ] PageSpeed móvil > 85 — medir sobre la URL de producción
- [ ] Monitor de uptime
- [x] Meta tags, favicon, OG image — hechos. **Pendiente:** `og:image` y `og:url` a URL absoluta cuando haya dominio (hoy son relativas y WhatsApp no las mostrará)
- [x] SEO on-page (2026-08-15): **prerender** en el build (`scripts/prerender.mjs`, React en Node, sin navegador) — el `index.html` sale con ~1.590 palabras en vez de vacío; JSON-LD `LocalBusiness`; title con la ciudad; description ≤155; H1 con espacio entre líneas. Verificado: hidratación sin errores en consola.
- [ ] `<link rel="canonical">` — pendiente de dominio
- [x] `robots.txt` con los rastreadores de IA permitidos explícitamente
      (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot)
- [x] Página 404 útil (`public/404.html`), con enlaces de vuelta y a WhatsApp
- [x] `sitemap.xml` y `canonical` — **se generan solos en el build** cuando
      `SITE_URL` está definida; también convierten og:image y twitter:image a
      URL absoluta. Sin esa variable el build avisa por consola.
- [ ] Enlaces revisados (ninguno a `localhost` ni a `#`)

## Cumplimiento del CLAUDE.md global
Auditado el 2026-08-18 (el global se instaló el 15 y esta sesión arrancó el 14,
así que no se cargó: sus reglas se aplicaron a posteriori).
- [x] Regla #1 — HTML completo desde el servidor (prerender, ~1.648 palabras)
- [x] Un solo h1, distinto del title · jerarquía h2/h3 real
- [x] title 60 caracteres · description 150
- [x] canonical, OG y Twitter (absolutas con SITE_URL)
- [x] robots.txt real, sitemap, 404, favicon
- [x] Imágenes WebP, con `alt`, con `width`/`height`, y 20 de 22 diferidas
      (las 2 sin diferir son las del Hero, que están sobre el pliegue)
- [x] font-display: swap · HTML semántico · sin CTA fijo que tape el móvil
- [x] JSON-LD en la home · sin llms.txt
- [ ] «Responde la pregunta principal en el primer párrafo» — el h1 es un
      eslogan y el primer párrafo es poético. Decisión de marca pendiente de
      revisar con la clienta.
- [ ] «Nombra la entidad en lugar de usar pronombres» — la web habla en
      primera persona («escríbeme»). Igual: decisión de voz de marca.

## Deuda de seguridad aceptada
| Fecha | Qué | Riesgo | Revisar en |
|---|---|---|---|
| — | — | — | — |

## Disparadores a vigilar (Sección 4)
Si en algún momento se pide: formulario de contacto o reservas → **N1** (validación en servidor + rate limiting). Área de alumnas o guardar algo en base → **N2**. Cobrar las Formaciones online → **N3**. Anunciarlo antes de escribir el código.

## Notas
- 2026-08-15 — El proyecto vive fuera de APUESTAS (`Serenity_extracted/serenity-vida-holistica`); no mezclar configuración entre ambos.
- 2026-08-15 — Servidor de desarrollo en el puerto 5176; el `.claude/launch.json` del proyecto usa 5174. Túnel ngrok compartido con otro proyecto (`crearte`): el plan gratuito da un solo dominio, van por turnos.
