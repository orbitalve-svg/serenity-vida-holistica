import { useId } from 'react'

/**
 * Iconos holísticos a medida para las terapias de Serenity — line-art en el
 * estilo dorado/morado de la marca. Reemplazan los iconos genéricos de librería.
 */
export type ServiceIconName =
  | 'reiki'
  | 'masaje'
  | 'chakra'
  | 'lotus'
  | 'aroma'
  | 'tree'
  | 'spiral'

const PATHS: Record<ServiceIconName, React.ReactNode> = {
  // Manos abiertas sosteniendo un corazón de luz (Reiki / sanación con las manos)
  reiki: (
    <>
      <path d="M4.6 12.8c0 4 3.3 6.4 7.4 6.4s7.4-2.4 7.4-6.4" />
      <path d="M4.6 12.8V11M19.4 12.8V11" />
      <path d="M12 9.2c-.9-1.4-3.1-.8-3.1 1 0 1.3 1.7 2.4 3.1 3.4 1.4-1 3.1-2.1 3.1-3.4 0-1.8-2.2-2.4-3.1-1z" />
    </>
  ),
  // Espiral de energía / chi en movimiento (masaje energético)
  masaje: (
    <>
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <path d="M12 9.8a2.2 2.2 0 0 1 2.2 2.2 3.8 3.8 0 0 1-3.8 3.8 5.6 5.6 0 0 1-5.6-5.6 7.6 7.6 0 0 1 7.6-7.6 9.4 9.4 0 0 1 6.6 2.7" />
    </>
  ),
  // Columna de centros energéticos (chakras)
  chakra: (
    <>
      <line x1="12" y1="3.4" x2="12" y2="20.6" />
      <circle cx="12" cy="6.6" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="12" cy="17.4" r="1.7" />
      <path d="M6.3 6.6h3M17.7 6.6h-3M6.3 12h3M17.7 12h-3M6.3 17.4h3M17.7 17.4h-3" />
    </>
  ),
  // Flor de loto sobre el agua (sanación / renacimiento)
  lotus: (
    <>
      <path d="M12 3.6c-1.7 3-1.7 6.7 0 9.9 1.7-3.2 1.7-6.9 0-9.9z" />
      <path d="M12 13.5C9.4 10.8 5.7 10.8 4.2 13c2.1.6 4.6 1.3 7.8.5z" />
      <path d="M12 13.5c2.6-2.7 6.3-2.7 7.8-.5-2.1.6-4.6 1.3-7.8.5z" />
      <path d="M4 15.4c2.6 3.1 13.4 3.1 16 0" />
    </>
  ),
  // Gota de aceite esencial con hoja (aromaterapia)
  aroma: (
    <>
      <path d="M12 3.1C12 3.1 6.4 9 6.4 13.1a5.6 5.6 0 0 0 11.2 0C17.6 9 12 3.1 12 3.1z" />
      <path d="M12 17V9.6M12 12.4c1.5 0 2.4-1 2.4-1M12 13.6c-1.5 0-2.4-1-2.4-1" />
    </>
  ),
  // Árbol de la vida con raíces (constelaciones familiares / linaje)
  tree: (
    <>
      <circle cx="12" cy="7.4" r="4.6" />
      <path d="M12 3.6v6.4M9.5 7.8 12 9.4l2.5-1.6" />
      <path d="M12 12v3M12 15c-1.4 1-2 2.2-2.3 3.9M12 15c1.4 1 2 2.2 2.3 3.9M12 15c-.4 1.4-.5 2.6-.5 4M12 15c.4 1.4.5 2.6.5 4" />
    </>
  ),
  // Espiral hipnótica hacia el pasado (hipnosis de regresión a vidas pasadas)
  spiral: (
    <>
      <path d="M12 12a2 2 0 1 0-2-2" />
      <path d="M12 12a4.4 4.4 0 1 0-4.4-4.4" />
      <path d="M12 12a7 7 0 1 0-7-7" />
      <circle cx="12" cy="12" r="9.6" strokeDasharray="1 3.4" strokeWidth="1.3" />
    </>
  ),
}

interface ServiceIconProps {
  name: ServiceIconName
  size?: number
  className?: string
  /** Trazo con degradado `[desde, hasta]`. Sin él, usa `currentColor`. */
  gradient?: readonly [string, string]
  strokeWidth?: number
}

export default function ServiceIcon({
  name,
  size = 26,
  className,
  gradient,
  strokeWidth = 1.7,
}: ServiceIconProps) {
  // Cada instancia necesita su propio id: varios íconos conviven en la página.
  const uid = useId().replace(/:/g, '')
  const gradId = `svcGrad${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={gradient ? `url(#${gradId})` : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
      )}
      {PATHS[name]}
    </svg>
  )
}
