import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { ATUACAO } from '../../content/site'

/**
 * Nossa atuação.
 * Mobile: faixa curta verde profundo com três frases grandes em Sentient,
 * uma palavra em itálico menta em cada.
 * Desktop: sobre creme, título e as mesmas três ideias em colunas de texto.
 * O fio é a única vez que corre reto na horizontal, como divisor.
 */
export function Atuacao() {
  return (
    <section
      className="secao secao-escura atuacao calha"
      data-secao="diretoria"
      data-dark=""
      aria-label="Nossa atuação"
    >
      <Fio secao="atuacao" cor="menta" />

      <div className="secao__conteudo atuacao__frases">
        <span className="rotulo">{ATUACAO.rotulo}</span>
        {ATUACAO.frases.map((f) => (
          <p key={f} className="atuacao__frase">
            {comEnfase(f)}
          </p>
        ))}
      </div>

      <div className="secao__conteudo">
        <h2 className="atuacao__titulo">{comEnfase(ATUACAO.tituloDesktop)}</h2>

        <div className="atuacao__colunas">
          {ATUACAO.colunas.map((c) => (
            <div key={c.rotulo} className="atuacao__coluna">
              <span className="rotulo-simples">{c.rotulo}</span>
              <p>{c.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
