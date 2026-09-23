import { Fragment, useEffect, useRef } from 'react'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { caminhoDaLinhaDoTempo, medidasDaLinhaDoTempo } from '../../lib/timeline-path'
import { MARCOS, MARCOS_MOBILE, type Marco } from '../../content/marcos'
import { HISTORIA } from '../../content/site'

/**
 * Nossa história.
 *
 * Mobile (versão principal): vertical, sem pin. O fio desce reto pela
 * esquerda e recebe um ponto em cada marco, que acende quando o fio o
 * alcança. Os marcos alternam dois layouts, A e B, com uma faixa de respiro
 * de 72px entre eles.
 *
 * Desktop: a seção é pinada e o fio vira a linha do tempo horizontal, que
 * avança com o scroll e acende cada marco ao passar.
 *
 * As duas árvores convivem no DOM e a media query escolhe qual mostrar. Como
 * as fotos são as mesmas nas duas, o navegador baixa cada arquivo uma vez só.
 * Com `prefers-reduced-motion` o desktop também usa a versão vertical: ela é
 * a única das duas que se lê sem movimento nenhum.
 *
 * O id fica no invólucro para que o ScrollTo acerte a versão visível.
 */
export function Historia() {
  return (
    <div id="historia" data-secao="historia">
      <HistoriaMobile />
      <HistoriaDesktop />
    </div>
  )
}

function HistoriaMobile() {
  return (
    <section className="secao historia historia-mobile" aria-label="Nossa história">
      <Fio secao="historia" />

      <div className="secao__conteudo">
        <div className="historia__cabecalho">
          <span className="rotulo">{HISTORIA.rotulo}</span>
          <h2 className="titulo-secao historia__titulo">{comEnfase(HISTORIA.titulo)}</h2>
          <p className="historia__frase">{HISTORIA.frase}</p>
        </div>

        <div className="historia__respiro" />

        {MARCOS_MOBILE.map((m) => (
          <Fragment key={m.ano}>
            <MarcoMobile marco={m} />
            <div className="historia__respiro" />
          </Fragment>
        ))}
      </div>
    </section>
  )
}

function MarcoMobile({ marco }: { marco: Marco }) {
  const ponto = useRef<HTMLSpanElement>(null)

  // o ponto acende quando o fio chega nele
  useEffect(() => {
    const el = ponto.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        el,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: el, start: 'top 72%' },
        },
      )
    })
    return () => mm.revert()
  }, [])

  const foto = (
    <img
      src={marco.foto.src}
      alt={marco.foto.alt}
      width={marco.foto.largura}
      height={marco.foto.altura}
      loading="lazy"
      decoding="async"
      style={{ objectPosition: marco.foto.posicao }}
    />
  )

  return (
    <article className={`historia__marco historia__marco--${marco.layout.toLowerCase()}`}>
      <span ref={ponto} className="historia__ponto" aria-hidden="true" />

      {marco.layout === 'A' ? (
        <div className="historia__capa">
          <span className="historia__ano-vertical">{marco.ano}</span>
          <div className="historia__foto-a">{foto}</div>
        </div>
      ) : (
        <div className="historia__foto-b">
          {foto}
          <span className="historia__ano-sobreposto">{marco.ano}</span>
        </div>
      )}

      <div className="historia__texto">
        <strong className="historia__marco-titulo">{marco.titulo}</strong>
        <p className="historia__marco-desc">{marco.texto}</p>
      </div>
    </article>
  )
}

function HistoriaDesktop() {
  const secao = useRef<HTMLElement>(null)
  const palco = useRef<HTMLDivElement>(null)
  const trilho = useRef<HTMLDivElement>(null)
  const svg = useRef<SVGSVGElement>(null)
  const traco = useRef<SVGPathElement>(null)

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const elSecao = secao.current
      const elTrilho = trilho.current
      const elSvg = svg.current
      const elTraco = traco.current
      if (!elSecao || !elTrilho || !elSvg || !elTraco) return

      const marcos = [...elTrilho.querySelectorAll<HTMLElement>('[data-marco]')]
      let larguraTrilho = 0
      let percurso = 0
      let rolagem = 0

      /*
       * O caminho depende da largura real do trilho, que depende das fontes e
       * das fotos. Medimos de novo a cada refresh do ScrollTrigger, e não só
       * na montagem.
       */
      const medir = () => {
        larguraTrilho = elTrilho.scrollWidth
        const m = medidasDaLinhaDoTempo(larguraTrilho, window.innerWidth)
        percurso = m.percurso
        rolagem = m.rolagem
        elSvg.setAttribute('viewBox', `0 0 ${larguraTrilho} 100`)
        elTraco.setAttribute('d', caminhoDaLinhaDoTempo(larguraTrilho, window.innerWidth))
      }
      medir()

      const st = ScrollTrigger.create({
        trigger: elSecao,
        start: 'top top',
        end: () => `+=${rolagem}`,
        pin: palco.current,
        scrub: 1,
        invalidateOnRefresh: true,
        onRefreshInit: medir,
        /*
         * Enquanto a linha do tempo está pinada, o índice lateral sai de
         * cena: os marcos passam por baixo dele e o texto colidia. Aqui o
         * próprio fio já é o indicador de progresso da seção.
         */
        onToggle: (self) => {
          document.documentElement.classList.toggle('na-linha-do-tempo', self.isActive)
        },
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(elTrilho, { x: -p * percurso })
          gsap.set(elTraco, { drawSVG: `0% ${p * 100}%` })

          // a ponta do fio, um pouco à frente da borda esquerda da janela
          const ponta = p * larguraTrilho + window.innerWidth * 0.1
          for (const m of marcos) {
            m.classList.toggle('esta-aceso', ponta > m.offsetLeft + 200)
          }
        },
      })

      return () => st.kill()
    })

    return () => mm.revert()
  }, [])

  return (
    <section ref={secao} className="historia-desktop" aria-label="Nossa história">
      <div ref={palco} className="historia-desktop__palco">
        <div ref={trilho} className="historia-desktop__trilho">
          {/* o d deste path é gerado a partir da largura real do trilho */}
          <svg
            ref={svg}
            className="historia-desktop__fio"
            viewBox="0 0 4000 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              ref={traco}
              d=""
              vectorEffect="non-scaling-stroke"
              stroke="var(--esmeralda)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>

          <div className="historia-desktop__abertura">
            <div className="historia-desktop__cabecalho">
              <span className="rotulo">{HISTORIA.rotulo}</span>
              <h2 className="titulo-secao historia__titulo">
                {comEnfase(HISTORIA.titulo)}
              </h2>
            </div>
            <div className="historia-desktop__origem">
              <span className="rotulo-simples">{HISTORIA.origemRotulo}</span>
              <p>{HISTORIA.origem}</p>
            </div>
          </div>

          {MARCOS.map((m, i) => (
            <div
              key={m.ano}
              className="historia-desktop__marco"
              data-marco=""
              data-acima={String(m.acima)}
            >
              <span className="historia-desktop__ponto" aria-hidden="true" />
              <div className="historia-desktop__cartao">
                <span className="historia-desktop__ano">{m.ano}</span>
                <Blob className="historia-desktop__foto" variante={i % 5} foto={m.foto} />
                <h3 className="historia-desktop__marco-titulo">{m.titulo}</h3>
                <p className="historia-desktop__marco-desc">{m.textoDesktop}</p>
              </div>
            </div>
          ))}

          <div className="historia-desktop__respiro" />
        </div>
      </div>
    </section>
  )
}
