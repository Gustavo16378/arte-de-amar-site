import { Fragment, useEffect, useRef } from 'react'
import { Blob } from '../Blob'
import { Botao } from '../Botao'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { gsap, SplitText } from '../../lib/gsap'
import { EASE, EASE_ENTRADA, parallax } from '../../lib/motion'
import { FOTO_HERO, HERO } from '../../content/site'

type Props = {
  /** o hero só anima depois que a cortina do preloader sobe */
  liberado: boolean
}

/**
 * Início. Foto full-bleed no mobile com o título sobre o gradiente escuro;
 * no desktop a foto vira um blob à direita e o título ocupa a margem creme.
 *
 * Motion: foto scale 1.08 → 1 em 2.4s; título por linha, cada uma subindo de
 * trás de uma máscara; subtítulo e botões entram depois. No scroll a foto
 * desce e o título sobe, em velocidades diferentes.
 */
export function Hero({ liberado }: Props) {
  const secao = useRef<HTMLElement>(null)

  // entrada, uma vez só, quando a cortina libera
  useEffect(() => {
    const el = secao.current
    if (!liberado || !el) return

    const mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const foto = el.querySelector<HTMLImageElement>('.hero__foto img')
      const titulo = el.querySelector<HTMLElement>('.hero__titulo')
      const sub = el.querySelector<HTMLElement>('.hero__sub')
      const cta = el.querySelector<HTMLElement>('.hero__cta')

      const tl = gsap.timeline()
      if (foto) tl.from(foto, { scale: 1.08, duration: 2.4, ease: EASE }, 0)
      if (sub && cta) {
        tl.from(
          [sub, cta],
          { opacity: 0, y: 16, duration: 0.9, ease: EASE, stagger: 0.18 },
          0.6,
        )
      }

      /*
       * O título só é cortado em linhas depois que a fonte carrega: antes
       * disso as quebras são as da fonte de fallback, e o corte sairia nos
       * lugares errados.
       */
      let corte: SplitText | undefined
      let vivo = true
      if (titulo) {
        document.fonts?.ready.then(() => {
          if (!vivo) return
          corte = SplitText.create(titulo, {
            type: 'lines',
            mask: 'lines',
            autoSplit: true,
            linesClass: 'linha-motion',
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 112,
                duration: 1.1,
                ease: EASE_ENTRADA,
                stagger: 0.12,
                delay: 0.1,
              }),
          })
        })
      }

      return () => {
        vivo = false
        corte?.revert()
      }
    })

    return () => mm.revert()
  }, [liberado])

  // parallax: a foto desce, o título sobe
  useEffect(() => {
    const el = secao.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const foto = el.querySelector('.hero__foto')
      const copy = el.querySelector('.hero__copy')
      if (foto) parallax(foto, 12, el, { inicio: 'top top', fim: 'bottom top' })
      if (copy) parallax(copy, -18, el, { inicio: 'top top', fim: 'bottom top' })
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={secao} id="inicio" className="secao hero" data-secao="inicio">
      {/* o preloader já desenhou os primeiros 30%, saindo do coração */}
      <Fio secao="hero" de={0.3} inicio="top top" />

      <Blob className="hero__foto" mascara={null} foto={FOTO_HERO} prioridade />
      <div className="hero__veu" aria-hidden="true" />

      <div className="hero__copy">
        <h1 className="hero__titulo">
          {HERO.titulo.map((linha, i) => (
            <Fragment key={linha}>
              {i > 0 && ' '}
              <span className="hero__linha">
                <span>{comEnfase(linha)}</span>
              </span>
            </Fragment>
          ))}
        </h1>

        <p className="hero__sub">{HERO.subtitulo}</p>

        <div className="hero__cta">
          <Botao href="#como-ajudar" aparencia="menta" comCoracao className="hero__doar">
            {HERO.ctaPrimario}
          </Botao>
          <a href="#quem-somos" className="link-fio">
            {HERO.ctaSecundario}
          </a>
        </div>
      </div>

      <div className="hero__role" aria-hidden="true">
        <span>{HERO.role}</span>
        <span />
      </div>
    </section>
  )
}
