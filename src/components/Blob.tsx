import type { CSSProperties, ReactNode } from 'react'
import { Foto } from './Foto'
import type { Foto as DadosFoto } from '../content/fotos'
import { BLOBS } from '../lib/blobs'

type Props = {
  /** índice da máscara orgânica, 0 a 4 */
  variante?: number
  /**
   * Um border-radius pronto, quando a máscara não vem de BLOBS.
   * `null` deixa a máscara por conta do CSS, que é o caso do hero: lá ela
   * muda entre mobile e desktop e um valor inline ganharia da media query.
   */
  mascara?: string | null
  foto?: DadosFoto
  /** quanto a foto ocupa na tela, para o srcset escolher a largura certa */
  tamanhos?: string
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
  tamanhos,
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
      {foto && <Foto foto={foto} tamanhos={tamanhos} prioridade={prioridade} />}
      {children}
    </div>
  )
}
