import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { QUEM_SOMOS } from '../../content/site'

/**
 * Quem somos, sobre creme. O fio passa atrás do título e entra atrás da foto,
 * que sangra para a esquerda junto com as linhas de missão, visão e valores.
 */
export function QuemSomos() {
  return (
    <section id="quem-somos" className="secao quem calha" data-secao="quem-somos">
      <Fio secao="quem" />

      <div className="secao__conteudo quem__grade">
        <div>
          <span className="rotulo">{QUEM_SOMOS.rotulo}</span>

          <h2 className="titulo-secao quem__titulo">{comEnfase(QUEM_SOMOS.titulo)}</h2>

          <p className="corpo quem__texto so-mobile">{QUEM_SOMOS.paragrafoMobile}</p>

          <div className="quem__moldura">
            <Blob className="quem__foto" variante={0} foto={QUEM_SOMOS.foto}>
              <span className="quem__legenda so-mobile">
                {QUEM_SOMOS.legenda[0]}
                <br />
                {QUEM_SOMOS.legenda[1]}
              </span>
            </Blob>
            <span className="quem__legenda so-desktop">
              {QUEM_SOMOS.legenda[0]}
              <br />
              {QUEM_SOMOS.legenda[1]}
            </span>
          </div>
        </div>

        <div className="quem__coluna-texto">
          <p className="corpo quem__texto so-desktop">{QUEM_SOMOS.paragrafoDesktop}</p>

          <div className="quem__pilares">
            {QUEM_SOMOS.pilares.map((p) => (
              <div key={p.rotulo} className="quem__pilar">
                <span className="quem__pilar-rotulo">{p.rotulo}</span>
                <span className="quem__pilar-texto so-mobile">{p.curto}</span>
                <span className="quem__pilar-texto so-desktop">{p.longo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
