# Serenity Vida Holística

> Reglas propias de este proyecto. Las reglas técnicas generales están en el
> CLAUDE.md global; las de seguridad e infraestructura, en PROTOCOLO.md.

## Documentos que rigen este proyecto

- **PROTOCOLO.md** — blindaje y clasificación por niveles. Léelo antes de
  escribir código la primera vez y ejecuta la Sección 1 (Entrevista de
  Clasificación). Vuelve a leerlo cuando se añada un formulario, una base de
  datos, login o pagos, y antes del deploy (Sección 7, Auditoría
  pre-lanzamiento). No lo cargues entero en cada sesión.
- **PROJECT-LEVEL.md** — ficha de estado. Léela al inicio de cada sesión para
  saber en qué nivel estamos y qué capas faltan. Actualízala en cada escalada.

Estado al 2026-08-15: **N0 — Estático**, entrevista hecha. Ver PROJECT-LEVEL.md.

## El negocio

- Qué vende / hace: terapias holísticas (Reiki, Constelaciones Familiares,
  Coaching Sistémico, Hipnosis Regresiva, Lectura de Registros Akáshicos,
  Limpieza de Chakras, Masajes energéticos) y **Formaciones** certificadas
  de Reiki Usui y de Registros Akáshicos.
- A quién: personas que buscan bienestar y sanación en **Ecuador y Venezuela**,
  y alumnas de las Formaciones de toda Latinoamérica hispanohablante.
  **~80 % del tráfico llega desde el teléfono**, casi siempre por WhatsApp
  o Instagram.
- **Sin local fijo.** Las sesiones presenciales se hacen en un espacio que se
  coordina al agendar; el resto, a distancia por videollamada. La web **no
  publica dirección**: no se atiende en un sitio público y fijo, y anunciar
  uno confunde al visitante y a Google. En schema.org eso es
  `ProfessionalService` con `areaServed`, nunca `LocalBusiness` con
  `PostalAddress`.
- Qué lo diferencia: Yulexy Rodríguez, 9 años de experiencia, fundadora;
  enfoque integral (mente, cuerpo, alma); Formaciones con niveles y
  certificado.
- Objetivo del sitio: que escriban por WhatsApp para agendar cita o pedir
  información de las Formaciones.
- Acción principal del visitante: **WhatsApp**. Todos los CTA van a `wa()`
  de `src/lib/site.ts` con un mensaje prellenado.

## Stack y estructura

- Framework: React 18 + Vite 5 + TypeScript
- Estilos: Tailwind CSS v3 (config con rutas absolutas: el servidor a veces
  arranca desde otra carpeta y los globs relativos no compilaban)
- Contenido: en constantes dentro de cada componente (`src/components/*.tsx`)
  y datos globales en `src/lib/site.ts` (teléfono, dirección, Instagram).
- Imágenes: `src/assets/` en WebP; galería en `src/assets/galeria/`
  (`<evento>-<nn>-thumb.webp` 480×600 y `-full.webp` lado largo 1600).
  Se importan con `import.meta.glob`, no una por una.
- Fuentes: `@fontsource` autoalojadas (Inter, Playfair Display, Cinzel). No
  cargar Google Fonts por `<link>` ni `@import`.
- 3D: **CSS puro** (`preserve-3d`, `translateZ`, `rotateY`) y SVG. No Three.js:
  el bundle importa más que el efecto.
- Cálculos astronómicos: propios, en `src/lib/astro.ts` (Kepler, día
  juliano, Meeus). Sin APIs.
- Hosting: Vercel. Cabeceras de seguridad en `vercel.json`.
- Base de datos: ninguna. Persistencia sólo en `localStorage` del visitante
  (`src/lib/memory.ts`).
- Idioma y locale: es-VE. Tratamiento de **tú**.
- Estructura de URLs: una sola página con anclas — `#inicio`, `#servicios`,
  `#galeria`, `#formaciones`, `#chakras`, `#sobre-mi`, `#contacto`.
- Desarrollo: `npx vite --host --port 5176`. Verificar siempre con
  `npx tsc -b` y `npm run build` antes de dar algo por hecho.
- **Prerender (SEO):** `npm run build` renderiza la app en Node
  (`src/entry-server.tsx` + `scripts/prerender.mjs`) y vuelca el HTML en
  `dist/index.html`. Reglas que impone: **nada de `window`, `document`,
  `localStorage` ni `matchMedia` durante el render** (solo en `useEffect`
  o handlers); **nada de `Math.random()` en el render** (usar semilla);
  el estado inicial de un componente debe ser el mismo en Node y en el
  navegador. Si el build falla en el paso «prerender», casi seguro es eso.

## Marca

- Tono de voz: cercano, cálido y sereno. Espiritual sin cursilería ni
  promesas milagrosas. Frases cortas.
- Tratamiento: tú.
- Colores (tokens `serenity.*` en `tailwind.config.js`):
  void `#0F0A1C` · purple-deep `#2D1547` · purple `#5B2C82` · gold `#C9A84C`
  · gold-light `#E8A93C` · cream `#FBF6EC` · ink `#241830` · mist `#CBB8DC`
  · veil `#ECE6F4`. Fondo oscuro violeta con acentos dorados; las secciones
  claras usan `veil`.
- Tipografías: Playfair Display *itálica* para titulares; Cinzel en
  mayúsculas con tracking para etiquetas y rótulos; Inter para cuerpo.
- Logo: la flor de lis recortada del sello real (`src/assets/logo-emblema*.png`),
  blanca sobre fondos oscuros. El sello completo sólo en la OG image.
- Cosas que nunca decimos: **«cursos»** (son *Formaciones*); «solución
  integral»; «líderes»; nada que suene a garantía médica.

## SEO de este proyecto

Página única; las keywords se reparten por sección, no por URL.

Se compite por **modalidad, no por ciudad**: no hay local fijo y se atiende a
distancia, así que «reiki Lechería» no es el objetivo — lo es «reiki a
distancia».

| Sección | Keyword objetivo | Intención |
|---|---|---|
| Home / Servicios | reiki a distancia · terapias holísticas online | comercial |
| Servicios | constelaciones familiares online · lectura registros akáshicos | comercial |
| Formaciones | formación Reiki Usui online certificada · curso registros akáshicos online | transaccional |
| Sobre mí | Yulexy Rodríguez terapeuta holística | navegacional |
| Chakras / Carta astral | test de chakras · carta astral gratis | informacional (captación) |

- Español neutro: el público está en varios países. Evitar modismos de uno solo.
- Al hablar de horarios de sesiones online, indicar siempre la zona horaria:
  Ecuador (UTC−5) y Venezuela (UTC−4) llevan una hora de diferencia.
- Precios en **USD**: es la moneda oficial de Ecuador y la de referencia de
  facto en Venezuela. Una sola lista sirve para ambos públicos.
- Competidores directos a vigilar: pendiente.
- OG/Twitter: `og:image` y `og:url` deben pasar a **URL absoluta** al tener
  dominio; hoy son relativas y WhatsApp no muestra la tarjeta.

## Datos de contacto

Estos datos deben ser idénticos en el pie, en `src/lib/site.ts` y en el
JSON-LD de `index.html`.

- Nombre exacto: Serenity Vida Holística
- Teléfono: **+593 96 405 3009** (WhatsApp de Yulexy) — constante
  `WHATSAPP_NUMBER` en `src/lib/site.ts`; ahí se cambia una vez y se propaga
- Instagram: @terapiasanacionyluz
- **Dirección: ninguna, a propósito** (ver «El negocio»)
- Zona de servicio: Ecuador y Venezuela presencial con cita coordinada;
  online a toda Latinoamérica
- Google Business: **no aplica** mientras no haya un espacio fijo donde se
  atienda al público. Google exige atención presencial en la dirección
  declarada; una ficha sin eso acaba suspendida.

## Notas y decisiones

- 2026-08-03 — El proyecto vive fuera de APUESTAS. Nada de Serenity se
  instala ni configura en APUESTAS, y viceversa.
- 2026-08-03 — Se dice **Formaciones**, nunca cursos (decisión de la clienta).
- 2026-08-10 — Testimonios va justo después de Servicios (prueba social en
  el momento de decidir). Sin botón flotante de WhatsApp: se probó y no.
- 2026-08-10 — Se descarta la paleta clara rosa/lavanda que sugieren las
  guías de "wellness": la identidad es violeta oscuro + dorado.
- 2026-08-14 — Fotos de la galería en local (`src/assets/galeria/`), no en un
  hosting externo: 70 fotos fijas no lo justifican. Categorías: Formaciones ·
  Círculos & Encuentros · Ceremonias & Sanación.
- 2026-08-15 — Galería como anillo 3D (port de «CSS infinite scroll gallery»
  de Ana Tudor) que **gira solo, despacio** (`GRADOS_POR_SEGUNDO`), sin
  depender del scroll: la versión ligada al scroll obligaba a recorrer 70
  fotos para poder seguir bajando.
- 2026-08-15 — Móvil: el hero usa `100svh` (no `dvh`: en Safari el hero se
  estiraba al recogerse la barra y la página rebotaba); la barra fija no
  usa `backdrop-filter` en táctil; la luz del hero se mueve con **toque e
  inclinación** (giroscopio con permiso en iPhone), no con el arrastre.
- 2026-08-15 — **El negocio no tiene local fijo**: presencial con cita
  coordinada + online. Se retira la dirección de toda la web (pie, contacto,
  FAQ, JSON-LD) y el SEO pasa de local a modalidad. WhatsApp nuevo:
  +593 96 405 3009 (Ecuador).
- 2026-08-15 — Entrevista de Clasificación: N0. Hosting Vercel. Repo privado:
  `github.com/orbitalve-svg/serenity-vida-holistica` (rama `main`). Es
  privado a propósito: las fotos de la galería son de personas reales en
  sesiones íntimas.
