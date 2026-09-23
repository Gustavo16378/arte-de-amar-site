import { FIO_DESKTOP, FIO_MOBILE, type SecaoFio } from '../lib/fio-paths'

type Props = {
  secao: SecaoFio
  /** menta nas seções escuras, gradiente menta para esmeralda nas claras */
  cor?: 'gradiente' | 'menta'
}

/**
 * O fio de uma seção: um SVG absoluto cobrindo a seção inteira e UM path.
 *
 * O viewBox 0 0 100 100 com preserveAspectRatio="none" faz as coordenadas
 * valerem como porcentagem, e o vector-effect impede o traço de deformar
 * junto. Nada de stroke-dasharray visível, nada de fragmento solto.
 *
 * Os dois paths (desktop e mobile) ficam no DOM e a media query esconde o que
 * não serve. É de propósito: evita medir a viewport em JS e não pisca na
 * primeira pintura. Na Fase 4 o ScrollTrigger anima só o path visível.
 */
export function Fio({ secao, cor = 'gradiente' }: Props) {
  const traco = cor === 'menta' ? 'var(--menta)' : 'url(#fio-grad)'
  const desktop = FIO_DESKTOP[secao]
  const mobile = FIO_MOBILE[secao]

  return (
    <svg
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
