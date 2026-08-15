# Serenity Vida Holística

Web de **Serenity Vida Holística** — centro de terapias holísticas y formación
espiritual de Yulexy Rodríguez (Lechería, Anzoátegui, Venezuela).

Construida con **React 18 + TypeScript + Vite + Tailwind CSS + lucide-react**.

## Requisitos

- Node.js 18+ y npm.

## Cómo correr

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto `http://localhost:5173`).

Para compilar a producción:

```bash
npm run build
npm run preview
```

## La pieza central — Hero de revelado

El hero usa una "linterna espiritual": al mover el cursor sobre la imagen base
(persona meditando, `src/assets/hero-meditation.png` = `BG_IMAGE_1`) se revela,
a través de un círculo radial suave que sigue al cursor, la red de raíces
ancestrales con la Flor de la Vida (`src/assets/hero-roots.png` = `BG_IMAGE_2`).

La técnica (`src/components/RevealLayer.tsx`): un `<canvas>` oculto pinta un
gradiente radial centrado en el cursor y el resultado se aplica como
`mask-image` sobre el `<div>` de revelado. La posición del cursor se suaviza con
`requestAnimationFrame` (interpolación 0.1) en `src/components/Hero.tsx`.

## Estructura

```
src/
  assets/            hero-meditation.png · hero-roots.png
  components/        Logo, Nav, Hero, RevealLayer, About, Services,
                     Akashic, Chakras, Testimonials, FAQ, Contact, Footer, Reveal
  hooks/             useScrollReveal.ts (IntersectionObserver)
  lib/               site.ts (WhatsApp + datos de contacto)
  index.css          fuentes, paleta, animaciones del hero
  App.tsx · main.tsx
```

## Contacto / CTA

Todos los CTA enlazan a WhatsApp **0424-8042545**
(`https://wa.me/584248042545`) con un mensaje pre-llenado según el servicio.
