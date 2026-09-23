import { Fragment } from 'react'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { MARCOS, MARCOS_MOBILE, type Marco } from '../../content/marcos'
import { HISTORIA } from '../../content/site'

/**
 * Nossa história.
 *
 * Mobile (versão principal): vertical, sem pin. O fio desce reto pela
 * esquerda e os marcos alternam dois layouts, A e B, com uma faixa de
 * respiro de 72px entre eles.
 *
 * Desktop: a seção tem 450vh, o conteúdo fica pinado e o fio vira a linha do
 * tempo horizontal.
 *
 * As duas árvores convivem no DOM e a media query escolhe qual mostrar. Como
 * as fotos são as mesmas nas duas, o navegador baixa cada arquivo uma vez só.
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
      {marco.layout === 'A' ? (
        <div className="historia__capa">
          <span className="historia__ano-vertical" data-ponto-fio="">
            {marco.ano}
          </span>
          <div className="historia__foto-a">{foto}</div>
        </div>
      ) : (
        <div className="historia__foto-b">
          {foto}
          <span className="historia__ano-sobreposto" data-ponto-fio="">
            {marco.ano}
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
  return (
    <section className="historia-desktop" aria-label="Nossa história">
      <div className="historia-desktop__palco">
        <div className="historia-desktop__trilho" data-trilho="">
          {/* o d deste path é gerado a partir da largura real do trilho, na Fase 4 */}
          <svg
            className="historia-desktop__fio"
            data-trilho-fio=""
            viewBox="0 0 4000 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <path
              data-trilho-traco=""
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
