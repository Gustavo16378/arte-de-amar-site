import { Fragment, useRef } from 'react'
import { useMotionProximo } from '../../hooks/useMotionProximo'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { Foto } from '../Foto'
import { comEnfase } from '../Titulo'
import { gsap } from '../../lib/gsap'
import { aplicarTraco, TRACO_DESENHAVEL } from '../../lib/desenho'
import { EASE_ENTRADA, revelar, revelarLinhas } from '../../lib/motion'
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
  const secao = useRef<HTMLElement>(null)

  useMotionProximo(secao, () => {
    const el = secao.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cortes: ReturnType<typeof revelarLinhas>[] = []
      let vivo = true

      document.fonts?.ready.then(() => {
        if (!vivo) return
        const titulo = el.querySelector('.historia__titulo')
        if (titulo) cortes.push(revelarLinhas(titulo, { intervalo: 0.08 }))
        const frase = el.querySelector('.historia__frase')
        if (frase) cortes.push(revelarLinhas(frase, { intervalo: 0.06, duracao: 0.8 }))
      })

      revelar(el.querySelector('.rotulo'), { y: 16 })

      return () => {
        vivo = false
        for (const c of cortes) c.revert()
      }
    })

    return () => mm.revert()
  })

  return (
    <section
      ref={secao}
      className="secao historia historia-mobile"
      aria-label="Nossa história"
    >
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

  const marcoRef = useRef<HTMLElement>(null)

  useMotionProximo(marcoRef, () => {
    const el = marcoRef.current
    const elPonto = ponto.current
    if (!el || !elPonto) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // o ponto acende quando o fio chega nele
      gsap.from(elPonto, {
        scale: 0,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: { trigger: elPonto, start: 'top 72%' },
      })

      /*
       * O ano sobe de trás de uma máscara no layout B, onde ele é
       * horizontal. No layout A ele é vertical e girado 180°, e uma máscara
       * ali subiria na direção errada: melhor um fade curto com deslocamento.
       */
      const anoMascarado = el.querySelector('.historia__ano-interno')
      if (anoMascarado) {
        gsap.from(anoMascarado, {
          yPercent: 100,
          duration: 0.8,
          ease: EASE_ENTRADA,
          scrollTrigger: { trigger: el, start: 'top 78%' },
        })
      }
      const anoVertical = el.querySelector('.historia__ano-vertical')
      if (anoVertical) {
        gsap.from(anoVertical, {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: EASE_ENTRADA,
          scrollTrigger: { trigger: el, start: 'top 78%' },
        })
      }

      // a foto do layout A é revelada da esquerda para a direita
      const fotoA = el.querySelector('.historia__foto-a')
      if (fotoA) {
        gsap.from(fotoA, {
          clipPath: 'inset(0 100% 0 0)',
          duration: 1,
          ease: EASE_ENTRADA,
          scrollTrigger: { trigger: fotoA, start: 'top 82%' },
        })
      }

      // a do layout B sangra nas duas bordas: entra com escala e fade
      const fotoB = el.querySelector('.historia__foto-b img')
      if (fotoB) {
        gsap.from(fotoB, {
          scale: 1.1,
          opacity: 0,
          duration: 1,
          ease: EASE_ENTRADA,
          scrollTrigger: { trigger: fotoB, start: 'top 82%' },
        })
      }

      revelar(el.querySelector('.historia__texto'), {
        y: 18,
        gatilho: el,
        inicio: 'top 75%',
      })
    })

    return () => mm.revert()
  })

  const foto = <Foto foto={marco.foto} tamanhos="(min-width: 1024px) 240px, 390px" />

  return (
    <article
      ref={marcoRef}
      className={`historia__marco historia__marco--${marco.layout.toLowerCase()}`}
    >
      <span ref={ponto} className="historia__ponto" aria-hidden="true" />

      {marco.layout === 'A' ? (
        <div className="historia__capa">
          <span className="historia__ano-vertical">{marco.ano}</span>
          <div className="historia__foto-a">{foto}</div>
        </div>
      ) : (
        <div className="historia__foto-b">
          {foto}
          <span className="historia__ano-sobreposto">
            <span className="historia__ano-interno">{marco.ano}</span>
          </span>
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

  useMotionProximo(secao, () => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      const elSecao = secao.current
      const elTrilho = trilho.current
      const elSvg = svg.current
      const elTraco = traco.current
      if (!elSecao || !elTrilho || !elSvg || !elTraco) return

      const marcos = [...elTrilho.querySelectorAll<HTMLElement>('[data-marco]')]
      // quanto o marco acende antes de a linha chegar nele
      const ANTECIPACAO = 60
      let larguraTrilho = 0
      let percurso = 0
      let rolagem = 0
      let comprimento = 0

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
        const alturaPalco = elTrilho.getBoundingClientRect().height || window.innerHeight
        elSvg.setAttribute('viewBox', `0 0 ${larguraTrilho} ${Math.round(alturaPalco)}`)
        elTraco.setAttribute(
          'd',
          caminhoDaLinhaDoTempo(
            larguraTrilho,
            window.innerWidth,
            alturaPalco,
            marcos.map((m) => m.offsetLeft),
          ),
        )
        comprimento = elTraco.getTotalLength()
      }
      medir()

      /*
       * O GSAP anima um número e nós aplicamos tudo a partir dele. Ligar o
       * scrub direto nas propriedades não interpolava, e num ScrollTrigger
       * sem animação o scrub também não suavizaria nada.
       */
      const aplicar = (p: number) => {
        gsap.set(elTrilho, { x: -p * percurso })
        aplicarTraco(elTraco, p)

        /*
         * Onde a ponta do traço está de verdade, perguntando ao próprio
         * path. Estimar por p * larguraTrilho errava, porque o path começa
         * e termina recuado 20% da janela em cada ponta.
         *
         * O marco acende quando o fio chega ao seu ponto, com um pouco de
         * antecedência: a foto tem que já estar subindo quando a linha
         * passa por ela, não depois.
         */
        const ponta = elTraco.getPointAtLength(p * comprimento).x
        for (const m of marcos) {
          m.classList.toggle('esta-aceso', ponta > m.offsetLeft - ANTECIPACAO)
        }
      }

      const estado = { p: 0 }
      const tween = gsap.to(estado, {
        p: 1,
        ease: 'none',
        onUpdate: () => aplicar(estado.p),
        scrollTrigger: {
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
        },
      })

      return () => {
        tween.scrollTrigger?.kill()
        tween.kill()
      }
    })

    return () => mm.revert()
  })

  return (
    <section ref={secao} className="historia-desktop" aria-label="Nossa história">
      <div ref={palco} className="historia-desktop__palco">
        <div ref={trilho} className="historia-desktop__trilho">
          {/* o d deste path é gerado a partir da largura real do trilho */}
          <svg
            ref={svg}
            className="historia-desktop__fio"
            viewBox="0 0 4000 900"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              ref={traco}
              d=""
              stroke="var(--esmeralda)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              {...TRACO_DESENHAVEL}
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
                <Blob
                  className="historia-desktop__foto"
                  variante={i % 5}
                  foto={m.foto}
                  tamanhos="240px"
                />
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
