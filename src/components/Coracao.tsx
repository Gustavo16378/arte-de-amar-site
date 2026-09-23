import { CORACAO_SOLIDO, CORACAO_SOLIDO_FIGURAS, CORACAO_VIEWBOX } from '../lib/heart-path'

type Props = {
  /** 'solido' preenche, 'contorno' só desenha o traço */
  variante?: 'solido' | 'contorno'
  largura?: number
  className?: string
  /** no contorno, a espessura vive no espaço do viewBox (572 de largura) */
  espessura?: number
  /** marca o SVG para o hover do botão preencher o coração */
  preencheNoHover?: boolean
}

/**
 * O coração do logo, SVG inline. Nada de biblioteca de ícone: são os mesmos
 * cinco traços de public/assets/logo/coracao-*.svg.
 * A proporção do viewBox é 572x530, daí o height = largura * 530 / 572.
 */
export function Coracao({
  variante = 'solido',
  largura = 24,
  className,
  espessura = 30,
  preencheNoHover = false,
}: Props) {
  const altura = Math.round((largura * 530) / 572)
  const contorno = variante === 'contorno'

  return (
    <svg
      viewBox={CORACAO_VIEWBOX}
      width={largura}
      height={altura}
      className={className}
      fill={contorno ? 'none' : 'currentColor'}
      stroke={contorno ? 'currentColor' : undefined}
      strokeWidth={contorno ? espessura : undefined}
      strokeLinejoin="round"
      strokeLinecap="round"
      data-preenche={preencheNoHover ? '' : undefined}
      aria-hidden="true"
      focusable="false"
    >
      {CORACAO_SOLIDO.map((d) => (
        <path key={d} d={d} />
      ))}
      {CORACAO_SOLIDO_FIGURAS.map((c) => (
        <circle key={c.cy} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </svg>
  )
}
