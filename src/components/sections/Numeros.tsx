import { useRef } from 'react'
import { useMotionProximo } from '../../hooks/useMotionProximo'
import { Fio } from '../Fio'
import { gsap } from '../../lib/gsap'
import { contar, parallax } from '../../lib/motion'
import { NUMEROS } from '../../content/site'

const formata = (n: number) => n.toLocaleString('pt-BR')

/**
 * Faixa verde profundo com os quatro números de impacto.
 * No mobile eles descem em coluna, desalinhados de propósito: esquerda,
 * direita, esquerda, centro. No desktop viram uma grade 2x2 alinhada.
 *
 * Motion: cada número conta de 0 ao valor em 1.8s quando entra a 70% da
 * tela, e o sufixo só aparece no fim. Um parallax mínimo dá velocidades
 * diferentes a cada um, para a coluna não subir como um bloco só.
 */
export function Numeros() {
  const secao = useRef<HTMLElement>(null)

  useMotionProximo(secao, () => {
    const el = secao.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      for (const item of el.querySelectorAll<HTMLElement>('.numeros__item')) {
        const valor = item.querySelector<HTMLElement>('.numeros__valor')
        if (valor?.dataset.contador) {
          contar(valor, Number(valor.dataset.contador), valor.dataset.sufixo ?? '')
        }
        // velocidades de .04 a .07, como nas notas de motion
        const velocidade = Number(item.dataset.velocidade ?? 0.05)
        parallax(item, velocidade * -260, el)
      }
    })

    return () => mm.revert()
  })

  return (
    <section
      ref={secao}
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
            <span
              className="numeros__valor"
              data-contador={n.valor}
              data-sufixo={n.sufixo}
            >
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
