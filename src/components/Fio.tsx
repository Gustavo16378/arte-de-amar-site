import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { FIO_DESKTOP, FIO_MOBILE, type SecaoFio } from '../lib/fio-paths'

type Props = {
  secao: SecaoFio
  /** menta nas seções escuras, gradiente menta para esmeralda nas claras */
  cor?: 'gradiente' | 'menta'
  /**
   * De onde o traço começa. O hero nasce em 30% porque o preloader já
   * desenhou esse tanto saindo do coração.
   */
  de?: string
  /** sobrescreve o start do ScrollTrigger; o hero precisa de 'top top' */
  inicio?: string
  fim?: string
}

/**
 * O fio de uma seção: um SVG absoluto cobrindo a seção inteira e UM path.
 *
 * O viewBox 0 0 100 100 com preserveAspectRatio="none" faz as coordenadas
 * valerem como porcentagem, e o vector-effect impede o traço de deformar
 * junto. Nada de stroke-dasharray visível, nada de fragmento solto.
 *
 * Os dois paths (desktop e mobile) ficam no DOM e a media query esconde o que
 * não serve. O gsap.matchMedia anima só o que está visível e refaz a conta
 * sozinho quando a largura cruza o breakpoint.
 */
export function Fio({ secao, cor = 'gradiente', de = '0%', inicio, fim }: Props) {
  const svg = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = svg.current
    if (!el) return

    const gatilho = el.closest('section') ?? el.parentElement
    if (!gatilho) return

    const mm = gsap.matchMedia()

    mm.add(
      {
        mobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
        desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
        reduzido: '(prefers-reduced-motion: reduce)',
      },
      (contexto) => {
        const { mobile, reduzido } = contexto.conditions as Record<string, boolean>

        // sem movimento, o fio já nasce desenhado
        if (reduzido) {
          gsap.set(el.querySelectorAll('.fio__traco'), { drawSVG: '100%' })
          return
        }

        const traco = el.querySelector(
          mobile ? '.fio__traco--mobile' : '.fio__traco--desktop',
        )
        if (!traco) return

        gsap.fromTo(
          traco,
          { drawSVG: de },
          {
            drawSVG: '100%',
            ease: 'none',
            scrollTrigger: {
              trigger: gatilho,
              start: inicio ?? 'top 80%',
              end: fim ?? 'bottom 20%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          },
        )
      },
    )

    return () => mm.revert()
  }, [de, inicio, fim])

  const traco = cor === 'menta' ? 'var(--menta)' : 'url(#fio-grad)'
  const desktop = FIO_DESKTOP[secao]
  const mobile = FIO_MOBILE[secao]

  return (
    <svg
      ref={svg}
      className="fio"
      data-fio={secao}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {mobile && (
        <path
          className="fio__traco fio__traco--mobile"
          d={mobile}
          vectorEffect="non-scaling-stroke"
          stroke={traco}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {desktop && (
        <path
          className="fio__traco fio__traco--desktop"
          d={desktop}
          vectorEffect="non-scaling-stroke"
          stroke={traco}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  )
}

/**
 * Definições SVG usadas por toda a página: o gradiente do fio e a granulação
 * fina que cobre tudo (feTurbulence, multiply, 13%), como no guia de estilo.
 */
export function DefinicoesSvg() {
  return (
    <>
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="fio-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0" stopColor="var(--menta)" />
            <stop offset="1" stopColor="var(--esmeralda)" />
          </linearGradient>
          {/* o mesmo degradê do fio, na horizontal, para a barra de progresso */}
          <linearGradient id="fio-grad-h" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--menta)" />
            <stop offset="1" stopColor="var(--esmeralda)" />
          </linearGradient>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--menta)" />
            <stop offset="1" stopColor="var(--esmeralda)" />
          </linearGradient>
        </defs>
      </svg>
      <svg className="granulado" aria-hidden="true" focusable="false">
        <filter id="granulacao">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#granulacao)" />
      </svg>
    </>
  )
}
