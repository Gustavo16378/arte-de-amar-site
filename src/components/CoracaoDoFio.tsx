import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { aplicarTraco, medirFio, TRACO_DESENHAVEL } from '../lib/desenho'
import {
  CORACAO_SEGMENTOS,
  CORACAO_TRACOS,
  CORACAO_VIEWBOX,
  CORACAO_FENDA,
} from '../lib/heart-path'

/** fatia do percurso em que o fio chega; o coração fecha no resto */
const CHEGADA_DO_FIO = 0.35

/**
 * O coração que o fio fecha no fim da página.
 *
 * Três coisas acontecem aqui.
 *
 * 1. O path do fio desta seção é calculado, não copiado. Ele precisa terminar
 *    exatamente na fenda superior do coração, e a fenda muda de lugar com a
 *    largura da janela. A conta leva o ponto (306, 260) do viewBox para a
 *    caixa real do SVG e daí para a porcentagem da seção.
 *
 * 2. O fio e o coração são desenhados pelo MESMO ScrollTrigger, em sequência:
 *    o fio ocupa os primeiros 35% do percurso e o coração o resto. Antes eles
 *    tinham gatilhos separados, e como a seção é alta o fio levava a seção
 *    inteira para chegar enquanto o coração fechava logo na entrada. O
 *    coração se fechava sozinho, antes de o fio encostar nele.
 *
 * 3. Os cinco traços seguem a ordem da prancha: os dois lóbulos partem juntos
 *    da fenda, depois a base em V, por fim as duas figuras. Termina de fechar
 *    quando o título já está inteiro na tela.
 */
export function CoracaoDoFio() {
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const elSvg = svg.current
    if (!elSvg) return

    const secao = elSvg.closest('section')
    if (!secao) return

    const tracos = [...elSvg.querySelectorAll<SVGGeometryElement>('[data-traco]')]
    const fios = () => [...secao.querySelectorAll<SVGPathElement>('.fio__traco')]

    /**
     * Faz o fio da seção terminar na fenda. O 0.2358 é a altura relativa da
     * fenda dentro do viewBox: (260 - 135) / 530.
     */
    const apontarParaAFenda = () => {
      const caixaSecao = secao.getBoundingClientRect()
      const caixaCoracao = elSvg.getBoundingClientRect()
      if (!caixaSecao.width || !caixaSecao.height) return

      const alturaRelativa = (CORACAO_FENDA.y - 135) / 530

      const x =
        ((caixaCoracao.left - caixaSecao.left + caixaCoracao.width * 0.5) /
          caixaSecao.width) *
        100
      const y =
        ((caixaCoracao.top - caixaSecao.top + caixaCoracao.height * alturaRelativa) /
          caixaSecao.height) *
        100

      for (const path of fios()) {
        const mobile = path.classList.contains('fio__traco--mobile')
        // o fio chega da margem no mobile e do centro no desktop
        const origem = mobile ? 5 : 50

        /*
         * Com o coração centralizado, no desktop a origem e a fenda ficam no
         * mesmo x e a curva degeneraria numa reta. Uma barriga para a
         * esquerda devolve o gesto de fio sem mexer no ponto de chegada nem
         * na emenda com a seção de cima.
         */
        const quaseReto = Math.abs(x - origem) < 5
        const barriga = quaseReto ? origem - 8 : (origem + x) / 2

        path.dataset.base =
          `M${origem} 0 ` +
          `C${origem} ${(y * 0.45).toFixed(1)} ` +
          `${barriga.toFixed(1)} ${(y * 0.78).toFixed(1)} ` +
          `${x.toFixed(1)} ${y.toFixed(1)}`
      }

      const svgDoFio = secao.querySelector<SVGSVGElement>('svg[data-fio]')
      if (svgDoFio) medirFio(svgDoFio)
    }

    apontarParaAFenda()

    const ro = new ResizeObserver(() => apontarParaAFenda())
    ro.observe(secao)
    ScrollTrigger.addEventListener('refreshInit', apontarParaAFenda)

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: reduce)', () => {
      for (const el of [...tracos, ...fios()]) aplicarTraco(el, 1)
    })

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      for (const el of tracos) aplicarTraco(el, 0)

      const estado = { p: 0 }
      gsap.to(estado, {
        p: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: secao,
          start: 'top bottom',
          end: 'top 15%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const p = estado.p

          // primeiro o fio chega
          const chegada = gsap.utils.clamp(0, 1, p / CHEGADA_DO_FIO)
          for (const el of fios()) aplicarTraco(el, chegada)

          // e só então o coração começa a se fechar
          const fechamento = gsap.utils.clamp(
            0,
            1,
            (p - CHEGADA_DO_FIO) / (1 - CHEGADA_DO_FIO),
          )
          tracos.forEach((traco, i) => {
            const [de, ate] = CORACAO_SEGMENTOS[i] ?? [0, 1]
            const local = gsap.utils.clamp(0, 1, (fechamento - de) / (ate - de))
            aplicarTraco(traco, local)
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
          <path key={t.nome} data-traco="" d={t.d} {...TRACO_DESENHAVEL} />
        ) : (
          <circle
            key={t.nome}
            data-traco=""
            cx={t.cx}
            cy={t.cy}
            r={t.r}
            {...TRACO_DESENHAVEL}
          />
        ),
      )}
    </svg>
  )
}
