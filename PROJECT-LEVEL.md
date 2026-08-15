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
- [ ] **3.1 Git + remoto** — **NO HECHO.** El proyecto no es un repositorio Git. Prioridad máxima: `git init`, primer commit, remoto en GitHub.
- [ ] 3.7 Monitoreo ligero — pendiente: monitor de uptime (UptimeRobot / Better Stack) al publicar.
- [x] 3.12 Imágenes — todas en WebP y dimensionadas al uso (hero, retrato, 70 fotos de galería en dos tamaños, con `loading="lazy"` bajo el pliegue). CDN: lo da Vercel, verificar con `curl -I` tras el primer deploy.
- [ ] 3.14 Cabeceras de seguridad — `vercel.json` creado el 2026-08-15 con CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy. **Verificar en securityheaders.com tras el deploy** (objetivo: B o mejor).
- [x] 3.16 Auditoría de dependencias — `npm audit --production`: 0 vulnerabilidades (2026-08-15). Repetir antes de cada deploy.

## Auditoría pre-lanzamiento (Sección 7, N0)
- [ ] Repo en remoto y actualizado
- [ ] HTTPS activo, `http://` redirige (Vercel lo hace solo — confirmar)
- [ ] Cabeceras de seguridad, nota B+ en securityheaders.com
- [x] Imágenes en WebP y dimensionadas
- [ ] PageSpeed móvil > 85 — medir sobre la URL de producción
- [ ] Monitor de uptime
- [x] Meta tags, favicon, OG image — hechos. **Pendiente:** `og:image` y `og:url` a URL absoluta cuando haya dominio (hoy son relativas y WhatsApp no las mostrará)
- [ ] `robots.txt` y `sitemap.xml` — pendientes de dominio
- [ ] Enlaces revisados (ninguno a `localhost` ni a `#`)

## Deuda de seguridad aceptada
| Fecha | Qué | Riesgo | Revisar en |
|---|---|---|---|
| — | — | — | — |

## Disparadores a vigilar (Sección 4)
Si en algún momento se pide: formulario de contacto o reservas → **N1** (validación en servidor + rate limiting). Área de alumnas o guardar algo en base → **N2**. Cobrar las Formaciones online → **N3**. Anunciarlo antes de escribir el código.

## Notas
- 2026-08-15 — El proyecto vive fuera de APUESTAS (`Serenity_extracted/serenity-vida-holistica`); no mezclar configuración entre ambos.
- 2026-08-15 — Servidor de desarrollo en el puerto 5176; el `.claude/launch.json` del proyecto usa 5174. Túnel ngrok compartido con otro proyecto (`crearte`): el plan gratuito da un solo dominio, van por turnos.
