import emblemaColor from '../assets/logo-emblema.png'
import emblemaBlanco from '../assets/logo-emblema-blanco.png'

interface LogoProps {
  size?: number
  className?: string
  /**
   * Versión blanca, para fondos oscuros donde el morado del sello no
   * contrastaría lo suficiente.
   */
  blanco?: boolean
}

/**
 * Marca de Serenity Vida Holística.
 *
 * Usa el archivo real de la marca, recortado a la flor de lis: el sello
 * completo lleva «Serenity Vida Holística» dentro del anillo y a los 34 px de
 * la barra ese texto sería ilegible. El nombre ya va en tipografía al lado.
 */
export default function Logo({ size = 30, className = '', blanco = false }: LogoProps) {
  return (
    <img
      src={blanco ? emblemaBlanco : emblemaColor}
      width={size}
      height={size}
      alt="Serenity Vida Holística"
      className={className}
      draggable={false}
      style={{ objectFit: 'contain' }}
    />
  )
}
