import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/gsap'
import { aplicarTraco, medirFio, TRACO_DESENHAVEL } from '../lib/desenho'
import { FIO_DESKTOP, FIO_MOBILE, type SecaoFio } from '../lib/fio-paths'

type Props = {
  secao: SecaoFio
  /** menta nas seções escuras, gradiente menta para esmeralda nas claras */
  cor?: 'gradiente' | 'menta'
  /**
   * Fração já desenhada quando o traço entra em cena. O hero nasce em 0.3
   * porque o preloader já desenhou esse tanto saindo do coração.
   */
  de?: number
  /** sobrescreve o start do ScrollTrigger; o hero precisa de 'top top' */
  inicio?: string
  fim?: string
  /**
   * Desliga a animação própria. Como ajudar usa isto: lá o fio e o coração
   * são desenhados em sequência pelo mesmo ScrollTrigger, em CoracaoDoFio.
   */
  externo?: boolean
}

/**
 * O fio de uma seção: um SVG absoluto cobrindo a seção inteira e UM path.
 *
 * As coordenadas do path são porcentagens da seção, guardadas em `data-base`
 * e convertidas para pixels a cada medição. O SVG fica em escala 1:1 com a
 * seção, o que é o que torna o desenho por `stroke-dashoffset` exato; o
 * porquê está em lib/desenho.ts.
 *
 * Os dois paths (desktop e mobile) ficam no DOM e a media query esconde o que
 * não serve. O gsap.matchMedia anima só o que está visível e refaz a conta
 * sozinho quando a largura cruza o breakpoint.
 */
export function Fio({ secao, cor = 'gradiente', de = 0, inicio, fim, externo }: Props) {
  const svg = useRef<SVGSVGElement>(null)

  // escala 1:1 com a seção, refeita a cada mudança de tamanho
  useEffect(() => {
    const el = svg.current
    if (!el) return

    const alvo = el.closest('section') ?? el.parentElement
    if (!alvo) return

    const medir = () => medirFio(el)
    medir()

    const ro = new ResizeObserver(medir)
    ro.observe(alvo)
    ScrollTrigger.addEventListener('refreshInit', medir)

    return () => {
      ro.disconnect()
      ScrollTrigger.removeEventListener('refreshInit', medir)
    }
  }, [])

  useEffect(() => {
    const el = svg.current
    if (!el || externo) return

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
          for (const t of el.querySelectorAll<SVGPathElement>('.fio__traco')) {
            aplicarTraco(t, 1)
          }
          return
        }

        const traco = el.querySelector<SVGPathElement>(
          mobile ? '.fio__traco--mobile' : '.fio__traco--desktop',
        )
        if (!traco) return

        /*
         * O GSAP anima um número solto e nós escrevemos o traço a partir
         * dele. Ligar o scrub direto no strokeDashoffset não interpola: o
         * valor saltava de 0 a 1 no meio do percurso, que é o que fazia a
         * linha aparecer de uma vez em vez de ser desenhada.
         */
        const estado = { fracao: de }
        gsap.to(estado, {
          fracao: 1,
          ease: 'none',
          onUpdate: () => aplicarTraco(traco, estado.fracao),
          scrollTrigger: {
            trigger: gatilho,
            start: inicio ?? 'top 80%',
            end: fim ?? 'bottom 20%',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        })
      },
    )

    return () => mm.revert()
  }, [de, inicio, fim, externo])

  const idDegrade = `fio-grad-${secao}`
  const cordaCor = cor === 'menta' ? 'var(--menta)' : `url(#${idDegrade})`
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
      <defs>
        {/* menta em cima, esmeralda embaixo, ao longo da altura da seção */}
        <linearGradient
          id={idDegrade}
          data-degrade=""
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2="0"
          y2="100"
        >
          <stop offset="0" stopColor="var(--menta)" />
          <stop offset="1" stopColor="var(--esmeralda)" />
        </linearGradient>
      </defs>
      {mobile && (
        <path
          className="fio__traco fio__traco--mobile"
          data-base={mobile}
          d={mobile}
          stroke={cordaCor}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...TRACO_DESENHAVEL}
        />
      )}
      {desktop && (
        <path
          className="fio__traco fio__traco--desktop"
          data-base={desktop}
          d={desktop}
          stroke={cordaCor}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...TRACO_DESENHAVEL}
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
          {/*
            O degradê da barra de progresso, em coordenadas reais: a barra é
            uma linha horizontal, e em objectBoundingBox a caixa dela tem
            altura zero, o que faz o navegador não desenhar nada.
          */}
          <linearGradient
            id="fio-grad-h"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2="100"
            y2="0"
          >
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
