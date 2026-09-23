import type { CSSProperties, ReactNode } from 'react'
import { BLOBS } from '../lib/blobs'

type Foto = {
  src: string
  alt: string
  largura: number
  altura: number
  posicao?: string
}

type Props = {
  /** índice da máscara orgânica, 0 a 4 */
  variante?: number
  /**
   * Um border-radius pronto, quando a máscara não vem de BLOBS.
   * `null` deixa a máscara por conta do CSS, que é o caso do hero: lá ela
   * muda entre mobile e desktop e um valor inline ganharia da media query.
   */
  mascara?: string | null
  foto?: Foto
  /** rotação leve da moldura, em graus */
  rotacao?: number
  /** o hero não é lazy */
  prioridade?: boolean
  className?: string
  style?: CSSProperties
  /** legenda ou overlay por cima da foto */
  children?: ReactNode
}

/**
 * Foto dentro de uma máscara orgânica. O hover (só em ponteiro fino) leva a
 * máscara para um retângulo de 16px e dá scale na imagem, via .foto no CSS.
 */
export function Blob({
  variante = 0,
  mascara,
  foto,
  rotacao,
  prioridade = false,
  className,
  style,
  children,
}: Props) {
  const borda =
    mascara === null ? undefined : (mascara ?? BLOBS[variante % BLOBS.length])

  return (
    <div
      className={['foto', className].filter(Boolean).join(' ')}
      style={{
        borderRadius: borda,
        transform: rotacao ? `rotate(${rotacao}deg)` : undefined,
        ...style,
      }}
    >
      {foto && (
        <img
          src={foto.src}
          alt={foto.alt}
          width={foto.largura}
          height={foto.altura}
          loading={prioridade ? 'eager' : 'lazy'}
          decoding={prioridade ? 'sync' : 'async'}
          // o React 18 ainda não conhece fetchPriority em camelCase
          {...(prioridade ? { fetchpriority: 'high' } : {})}
          style={{ objectPosition: foto.posicao }}
        />
      )}
      {children}
    </div>
  )
}
