import { Fio } from '../Fio'
import { NUMEROS } from '../../content/site'

const formata = (n: number) => n.toLocaleString('pt-BR')

/**
 * Faixa verde profundo com os quatro números de impacto.
 * No mobile eles descem em coluna, desalinhados de propósito: esquerda,
 * direita, esquerda, centro. No desktop viram uma grade 2x2 alinhada.
 *
 * Os contadores entram na Fase 5; aqui o número já aparece no valor final.
 */
export function Numeros() {
  return (
    <section
      className="secao secao-escura numeros"
      data-secao="inicio"
      data-dark=""
      aria-label="Números de impacto"
    >
      <Fio secao="numeros" cor="menta" />

      <div className="numeros__grade">
        {NUMEROS.map((n) => (
          <div
            key={n.label}
            className="numeros__item"
            data-alinhamento={n.alinhamento}
            data-velocidade={n.velocidade}
          >
            <span className="numeros__valor" data-contador={n.valor} data-sufixo={n.sufixo}>
              {formata(n.valor)}
              {n.sufixo}
            </span>
            <span className="numeros__label">{n.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
