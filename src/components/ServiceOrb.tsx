import { useMemo, type ReactNode } from 'react'
import ServiceIcon from './ServiceIcon'
import type { ServiceIconName } from './ServiceIcon'

interface ServiceOrbProps {
  /** ícono propio de Serenity; se ignora si se pasan `children` */
  icon?: ServiceIconName
  /** color de la terapia */
  color: string
  size?: number
  /** contenido alternativo al ícono (por ejemplo, un ícono de librería) */
  children?: ReactNode
}

/**
 * Orbe de la terapia: sustituye el cuadrado plano por una esfera con volumen
 * real (luz arriba a la izquierda, sombra abajo, resplandor exterior) rodeada
 * por un anillo de geometría sagrada que gira.
 *
 * Pensado para vivir dentro de un `.group`: al pasar el cursor por la tarjeta,
 * el orbe se ilumina.
 */
export default function ServiceOrb({ icon, color, size = 78, children }: ServiceOrbProps) {
  // Puntos del anillo exterior, como los pétalos de un chakra.
  const dots = useMemo(() => Array.from({ length: 8 }, (_, i) => (360 / 8) * i), [])

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Anillo de geometría sagrada, girando muy lento */}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full animate-spin-slow opacity-45 transition-opacity duration-500 group-hover:opacity-90"
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="none"
          stroke={color}
          strokeWidth="1.1"
          strokeDasharray="2 7"
        />
        {dots.map((a) => (
          <circle
            key={a}
            cx="50"
            cy="3.5"
            r="1.9"
            fill={color}
            transform={`rotate(${a} 50 50)`}
          />
        ))}
      </svg>

      {/* Cuerpo del orbe: degradado radial descentrado = volumen */}
      <div
        className="absolute rounded-full transition-all duration-500"
        style={{
          inset: '13%',
          background: `radial-gradient(circle at 32% 26%, #FFFFFF 0%, ${color}2E 40%, ${color}5C 74%, ${color}85 100%)`,
          boxShadow: [
            `inset 0 -7px 14px ${color}55`, // sombra inferior interna
            'inset 0 5px 10px rgba(255,255,255,0.85)', // luz superior interna
            `0 8px 20px ${color}38`, // sombra proyectada
          ].join(', '),
        }}
      />

      {/* Brillo especular */}
      <span
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '26%',
          top: '22%',
          width: '22%',
          height: '15%',
          background:
            'linear-gradient(140deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)',
          transform: 'rotate(-24deg)',
          filter: 'blur(1px)',
        }}
      />

      {/* Resplandor que crece al pasar el cursor por la tarjeta */}
      <div
        className="absolute rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
        style={{
          inset: '4%',
          boxShadow: `0 0 26px 6px ${color}55`,
        }}
      />

      {/* Ícono */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="transition-transform duration-500 group-hover:scale-110" style={{ color }}>
          {children ?? (
            <ServiceIcon
              name={icon ?? 'lotus'}
              size={Math.round(size * 0.47)}
              strokeWidth={1.7}
              gradient={['#8A5A1F', color]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
