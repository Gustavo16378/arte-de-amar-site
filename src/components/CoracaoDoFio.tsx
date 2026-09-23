import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import {
  CORACAO_SEGMENTOS,
  CORACAO_TRACOS,
  CORACAO_VIEWBOX,
  CORACAO_FENDA,
} from '../lib/heart-path'

/**
 * O coração que o fio fecha no fim da página.
 *
 * Duas coisas acontecem aqui.
 *
 * 1. O path do fio desta seção é calculado, não copiado. Ele precisa terminar
 *    exatamente na fenda superior do coração, e a fenda muda de lugar com a
 *    largura da janela. A conta leva o ponto (306, 260) do viewBox para a
 *    caixa real do SVG e daí para a porcentagem da seção.
 *
 * 2. Os cinco traços se desenham com scrub, cada um na sua fatia do percurso:
 *    os dois lóbulos partem juntos da fenda, depois a base em V, por fim as
 *    duas figuras. Termina de fechar quando o título já está inteiro na tela.
 */
export function CoracaoDoFio() {
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const elSvg = svg.current
    if (!elSvg) return

    const secao = elSvg.closest('section')
    if (!secao) return

    const tracos = [...elSvg.querySelectorAll<SVGGeometryElement>('[data-traco]')]

    /**
     * Faz o fio da seção terminar na fenda. O 0.2358 é a altura relativa da
     * fenda dentro do viewBox: (260 - 135) / 530.
     */
    const apontarParaAFenda = () => {
      const caixaSecao = secao.getBoundingClientRect()
      const caixaCoracao = elSvg.getBoundingClientRect()
      if (!caixaSecao.width || !caixaSecao.height) return

      const alturaRelativa =
        (CORACAO_FENDA.y - 135) / 530 // = 0.2358, a fenda dentro do viewBox

      const x =
        ((caixaCoracao.left - caixaSecao.left + caixaCoracao.width * 0.5) /
          caixaSecao.width) *
        100
      const y =
        ((caixaCoracao.top - caixaSecao.top + caixaCoracao.height * alturaRelativa) /
          caixaSecao.height) *
        100

      for (const path of secao.querySelectorAll<SVGPathElement>('.fio__traco')) {
        const mobile = path.classList.contains('fio__traco--mobile')
        // o fio chega da margem no mobile e do centro no desktop
        const origem = mobile ? 5 : 50
        path.setAttribute(
          'd',
          `M${origem} 0 C${origem} ${(y * 0.5).toFixed(1)} ${x.toFixed(1)} ${(
            y * 0.3
          ).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`,
        )
      }
    }

    apontarParaAFenda()

    const ro = new ResizeObserver(() => apontarParaAFenda())
    ro.observe(secao)
    // o fio recém-medido precisa que o ScrollTrigger releia o path
    ScrollTrigger.addEventListener('refreshInit', apontarParaAFenda)

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(tracos, { drawSVG: '100%' })
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.set(tracos, { drawSVG: '0%' })

      ScrollTrigger.create({
        trigger: secao,
        start: 'top 85%',
        end: 'top 25%',
        scrub: 0.6,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress
          tracos.forEach((traco, i) => {
            const [de, ate] = CORACAO_SEGMENTOS[i] ?? [0, 1]
            const local = gsap.utils.clamp(0, 1, (p - de) / (ate - de))
            gsap.set(traco, { drawSVG: `0% ${local * 100}%` })
          })
        },
      })
    })

    return () => {
      ro.disconnect()
      ScrollTrigger.removeEventListener('refreshInit', apontarParaAFenda)
      mm.revert()
    }
  }, [])

  return (
    <svg
      ref={svg}
      className="ajudar__coracao"
      viewBox={CORACAO_VIEWBOX}
      fill="none"
      stroke="var(--menta)"
      strokeWidth="2"
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      {CORACAO_TRACOS.map((t) =>
        t.tipo === 'path' ? (
          <path key={t.nome} data-traco="" d={t.d} vectorEffect="non-scaling-stroke" />
        ) : (
          <circle
            key={t.nome}
            data-traco=""
            cx={t.cx}
            cy={t.cy}
            r={t.r}
            vectorEffect="non-scaling-stroke"
          />
        ),
      )}
    </svg>
  )
}
