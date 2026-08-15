import { useMemo } from 'react'

interface ChakraDisc3DProps {
  color: string
  /** número de pétalos del chakra — define los marcadores del anillo exterior */
  petals: number
  size?: number
}

/**
 * Disco de chakra en 3D: anillos concéntricos suspendidos a distintas
 * profundidades, inclinados en perspectiva y girando sobre el eje del disco.
 * Construido con transformaciones CSS 3D — sin librerías.
 */
export default function ChakraDisc3D({ color, petals, size = 104 }: ChakraDisc3DProps) {
  const marks = useMemo(
    () => Array.from({ length: petals }, (_, i) => (360 / petals) * i),
    [petals],
  )

  const ring = (inset: number, z: number, opacity: number, width = 1.5) => ({
    position: 'absolute' as const,
    inset,
    borderRadius: '50%',
    border: `${width}px solid ${color}`,
    opacity,
    transform: `translateZ(${z}px)`,
  })

  return (
    <div
      style={{ width: size, height: size, perspective: 520 }}
      className="relative shrink-0"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(56deg)' }}
      >
        {/* Anillo exterior con los pétalos del chakra */}
        <div
          className="absolute inset-0 disc-spin"
          style={{ transformStyle: 'preserve-3d', animationDuration: '18s' }}
        >
          <div style={ring(0, 0, 0.55)} />
          {marks.map((a) => (
            <span
              key={a}
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: 4,
                height: 4,
                marginLeft: -2,
                marginTop: -2,
                background: color,
                boxShadow: `0 0 8px 2px ${color}`,
                transform: `rotate(${a}deg) translateX(${size / 2 - 2}px)`,
              }}
            />
          ))}
        </div>

        {/* Anillo intermedio — gira en sentido contrario y más elevado */}
        <div
          className="absolute inset-0 disc-spin-rev"
          style={{ transformStyle: 'preserve-3d', animationDuration: '12s' }}
        >
          <div style={ring(size * 0.16, 9, 0.75)} />
        </div>

        {/* Anillo interior */}
        <div
          className="absolute inset-0 disc-spin"
          style={{ transformStyle: 'preserve-3d', animationDuration: '8s' }}
        >
          <div style={ring(size * 0.3, 18, 0.9, 2)} />
        </div>

        {/* Núcleo luminoso, flotando sobre el disco */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size * 0.42,
            transform: 'translateZ(26px)',
            background: color,
            boxShadow: `0 0 18px 6px ${color}, 0 0 34px 12px ${color}66`,
          }}
        />
      </div>

      {/* Halo plano bajo el disco, para asentarlo en el espacio */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 68%)`,
          filter: 'blur(6px)',
        }}
      />
    </div>
  )
}
