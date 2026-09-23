import { useEffect, useRef, useState } from 'react'
import { gsap } from '../lib/gsap'
import { useScrollLock } from '../hooks/useScrollLock'
import { CORACAO_PRELOADER, CORACAO_VIEWBOX } from '../lib/heart-path'
import { SITE } from '../content/site'

const CHAVE_SESSAO = 'aa-preloader'

type Props = {
  /** chamado quando a cortina termina de subir */
  aoTerminar?: () => void
}

/**
 * Preloader.
 *
 * O coração em contorno se desenha na ordem lóbulos, base, figuras. Ao lado,
 * "Arte de Amar" é escrito à mão: o texto existe só como contorno e um
 * recorte o revela da esquerda para a direita, e só então o creme preenche.
 * A porcentagem sobe junto. No fim o coração preenche em menta, pulsa uma
 * vez, e a tela sobe em cortina enquanto o fio do hero nasce do ponto onde o
 * coração estava.
 *
 * Só na primeira visita da sessão. Com `prefers-reduced-motion` o roteiro
 * inteiro vira um fade de 0.4s sobre o estado final.
 */
export function Preloader({ aoTerminar }: Props) {
  // decidido no primeiro render, para a tela não piscar o hero antes
  const [visivel, setVisivel] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return !sessionStorage.getItem(CHAVE_SESSAO)
    } catch {
      // navegação privada pode barrar o sessionStorage: mostra uma vez
      return true
    }
  })

  const raiz = useRef<HTMLDivElement>(null)
  const porcentagem = useRef<HTMLSpanElement>(null)

  useScrollLock(visivel)

  useEffect(() => {
    if (!visivel || !raiz.current) return

    try {
      sessionStorage.setItem(CHAVE_SESSAO, '1')
    } catch {
      /* sem sessionStorage o preloader aparece de novo, e tudo bem */
    }

    const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /*
     * O fio do hero é animado fora do contexto do preloader, de propósito.
     * Ele pertence ao hero, não a esta tela: se estivesse no contexto, o
     * `revert` do desmonte apagaria o traço recém-nascido.
     */
    const fioHero = reduzido ? null : visivelEntre('[data-fio="hero"] .fio__traco')
    if (fioHero) {
      // daqui em diante quem desenha é o scrub do próprio hero
      gsap.fromTo(
        fioHero,
        { drawSVG: '0%' },
        { drawSVG: '30%', duration: 1, ease: 'power2.out', delay: 2.5 },
      )
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setVisivel(false)
          aoTerminar?.()
        },
      })

      if (reduzido) {
        // tudo já no estado final; só a cortina vira um fade curto
        gsap.set('[data-pre-lobulos], [data-pre-base], [data-pre-figura]', {
          drawSVG: '100%',
        })
        gsap.set('[data-pre-coracao]', { fill: 'var(--menta)' })
        gsap.set('[data-pre-nome]', { '--recorte': '0%', color: 'var(--creme)' })
        if (porcentagem.current) porcentagem.current.textContent = '100%'
        tl.to('[data-pre]', { opacity: 0, duration: 0.4, ease: 'none' })
        return
      }

      // ------------------------------------------- o coração se desenha
      tl.fromTo(
        '[data-pre-lobulos]',
        { drawSVG: '0%' },
        { drawSVG: '100%', duration: 1, ease: 'power2.inOut' },
        0.05,
      )
        .fromTo(
          '[data-pre-base]',
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.5, ease: 'power2.out' },
          0.95,
        )
        .fromTo(
          '[data-pre-figura]',
          { drawSVG: '0%' },
          { drawSVG: '100%', duration: 0.3, ease: 'power2.out', stagger: 0.15 },
          1.35,
        )

        // ----------------------------- "Arte de Amar", escrito à mão
        .to('[data-pre-nome]', { '--recorte': '0%', duration: 1.2, ease: 'power2.out' }, 0.4)
        .to('[data-pre-nome]', { color: 'var(--creme)', duration: 0.5 }, 1.4)

        // ------------------------------------ a porcentagem sobe junto
        .to(
          { v: 0 },
          {
            v: 100,
            duration: 1.6,
            ease: 'power1.out',
            snap: { v: 1 },
            onUpdate() {
              const alvo = this.targets()[0] as { v: number }
              if (porcentagem.current) {
                porcentagem.current.textContent = `${Math.round(alvo.v)}%`
              }
            },
          },
          0,
        )

        // ------------------------- o coração preenche em menta e pulsa
        .to('[data-pre-coracao]', { fill: 'var(--menta)', duration: 0.45 }, 1.9)
        .to(
          '[data-pre-coracao]',
          { scale: 1.15, duration: 0.3, ease: 'power2.out', transformOrigin: 'center' },
          1.9,
        )
        .to('[data-pre-coracao]', { scale: 1, duration: 0.3, ease: 'power2.inOut' }, 2.2)

        // ------------ o fio desce do coração, e a cortina sobe com ele
        .to('[data-pre-fio]', { scaleY: 1, duration: 1, ease: 'power2.out' }, 2.5)
        .to('[data-pre]', { yPercent: -100, duration: 1, ease: 'power4.inOut' }, 2.5)
    }, raiz)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visivel])

  if (!visivel) return null

  return (
    <div ref={raiz}>
      <div className="preloader" data-pre="" role="status" aria-label="Carregando">
        <span className="preloader__local">{SITE.local}</span>

        <div className="preloader__centro">
          <svg
            className="preloader__coracao"
            data-pre-coracao=""
            viewBox={CORACAO_VIEWBOX}
            fill="rgba(111, 227, 176, 0)"
            stroke="var(--menta)"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            <path data-pre-lobulos="" d={CORACAO_PRELOADER.lobulos} />
            <path data-pre-base="" d={CORACAO_PRELOADER.base} />
            {CORACAO_PRELOADER.figuras.map((f) => (
              <circle key={f.cy} data-pre-figura="" cx={f.cx} cy={f.cy} r={f.r} />
            ))}
          </svg>

          <span className="preloader__nome" data-pre-nome="">
            {SITE.nome}
          </span>

          {/*
            O primeiro trecho do fio. Ele é desenhado sobre a cortina, e não
            no hero: assim fica preso ao coração e desce junto com ele
            enquanto a tela sobe, que é o que dá a leitura de fio sendo
            puxado para dentro da página. O fio do hero continua de onde
            este para.
          */}
          <span className="preloader__fio" data-pre-fio="" aria-hidden="true" />
        </div>

        <span className="preloader__pct" ref={porcentagem} aria-hidden="true">
          0%
        </span>
      </div>
    </div>
  )
}

/**
 * O fio tem um path para mobile e outro para desktop, e a media query esconde
 * um dos dois. O DrawSVG precisa do que está de fato visível.
 */
function visivelEntre(seletor: string): SVGPathElement | null {
  const candidatos = [...document.querySelectorAll<SVGPathElement>(seletor)]
  return candidatos.find((el) => getComputedStyle(el).display !== 'none') ?? null
}

/** true se o preloader ainda vai aparecer nesta sessão */
export function preloaderPendente() {
  try {
    return !sessionStorage.getItem(CHAVE_SESSAO)
  } catch {
    return true
  }
}
