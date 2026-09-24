import { useRef } from 'react'
import { useMotionProximo } from '../hooks/useMotionProximo'
import { gsap } from '../lib/gsap'
import { aplicarTraco, TRACO_DESENHAVEL } from '../lib/desenho'

type Props = {
  feito: number
  total: number
  unidade: string
  rotulo: string
}

/**
 * A barra de progresso das campanhas com meta.
 *
 * Não é uma div com largura: é uma cópia curta do fio, o mesmo traço com o
 * mesmo gradiente e a mesma ponta arredondada, desenhado com DrawSVG de 0 até
 * a fração da meta quando entra na tela.
 */
export function BarraDoFio({ feito, total, unidade, rotulo }: Props) {
  const traco = useRef<SVGPathElement>(null)
  const fracao = Math.max(0, Math.min(1, feito / total))

  useMotionProximo(traco, () => {
    const el = traco.current
    if (!el) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      aplicarTraco(el, fracao)
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // o GSAP anima o número e nós escrevemos o traço, como no resto do fio
      const estado = { v: 0 }
      gsap.to(estado, {
        v: fracao,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => aplicarTraco(el, estado.v),
        scrollTrigger: { trigger: el, start: 'top 85%' },
      })
    })

    return () => mm.revert()
  }, [fracao])

  return (
    <div className="projetos__meta">
      <div
        className="projetos__barra"
        role="progressbar"
        aria-valuenow={feito}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progresso de ${rotulo}`}
      >
        <svg
          className="projetos__barra-svg"
          viewBox="0 0 100 2"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            ref={traco}
            d="M0 1 L100 1"
            vectorEffect="non-scaling-stroke"
            stroke="url(#fio-grad-h)"
            fill="none"
            strokeLinecap="round"
            {...TRACO_DESENHAVEL}
          />
        </svg>
      </div>
      <span className="projetos__meta-texto">
        {feito} de {total} {unidade}
      </span>
    </div>
  )
}
