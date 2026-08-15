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
- A quién: personas que buscan bienestar y sanación en Lechería / Anzoátegui
  (Venezuela) y alrededores; alumnas de las Formaciones de toda Venezuela.
  **~80 % del tráfico llega desde el teléfono**, casi siempre por WhatsApp
  o Instagram.
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
  `npx tsc -b` y `npx vite build` antes de dar algo por hecho.

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

| Sección | Keyword objetivo | Intención |
|---|---|---|
| Home / Servicios | terapias holísticas Lechería · Reiki Lechería | comercial |
| Formaciones | formación Reiki Usui Venezuela · formación Registros Akáshicos | transaccional |
| Sobre mí | Yulexy Rodríguez terapeuta holística | navegacional |
| Chakras / Carta astral | test de chakras · carta astral gratis | informacional (captación) |

- Competidores directos a vigilar: pendiente.
- OG/Twitter: `og:image` y `og:url` deben pasar a **URL absoluta** al tener
  dominio; hoy son relativas y WhatsApp no muestra la tarjeta.

## Negocio local

Estos datos deben ser idénticos en el footer, en `src/lib/site.ts` y en el
perfil de Google Business.

- Nombre exacto: Serenity Vida Holística
- Dirección: C.C. Anna, Av. Principal de Lechería, Local Étnicas, Lechería,
  Anzoátegui, Venezuela
- Teléfono: +58 424-8042545 (WhatsApp)
- Instagram: @terapiasanacionyluz
- Horario: pendiente de confirmar con Yulexy
- Zona de servicio: Lechería, Barcelona y Puerto La Cruz (presencial);
  Reiki a distancia y Formaciones online a toda Venezuela

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
- 2026-08-15 — Entrevista de Clasificación: N0. Hosting Vercel. Repo privado:
  `github.com/orbitalve-svg/serenity-vida-holistica` (rama `main`). Es
  privado a propósito: las fotos de la galería son de personas reales en
  sesiones íntimas.
