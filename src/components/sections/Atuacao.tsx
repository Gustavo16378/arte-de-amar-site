import { useEffect, useRef } from 'react'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { gsap } from '../../lib/gsap'
import { EASE, revelar, revelarLinhas } from '../../lib/motion'
import { ATUACAO } from '../../content/site'

/**
 * Nossa atuação.
 * Mobile: faixa curta verde profundo com três frases grandes em Sentient,
 * uma palavra em itálico menta em cada.
 * Desktop: sobre creme, título e as mesmas três ideias em colunas de texto.
 * O fio é a única vez que corre reto na horizontal, como divisor.
 *
 * Motion: as frases entram por linha em stagger 0.15, e o itálico menta de
 * cada uma entra 0.2s depois da sua linha, com uma inclinação que desfaz.
 */
export function Atuacao() {
  const secao = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = secao.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cortes: ReturnType<typeof revelarLinhas>[] = []
      let vivo = true

      document.fonts?.ready.then(() => {
        if (!vivo) return
        const frases = [...el.querySelectorAll('.atuacao__frase')]
        frases.forEach((frase, i) => {
          cortes.push(revelarLinhas(frase, { atraso: i * 0.15, intervalo: 0.08 }))

          // o itálico chega logo depois da linha em que ele está
          const enfase = frase.querySelector('em')
          if (enfase) {
            gsap.from(enfase, {
              opacity: 0,
              skewX: -6,
              x: -8,
              duration: 0.7,
              ease: EASE,
              delay: i * 0.15 + 0.2,
              scrollTrigger: { trigger: frase, start: 'top 85%' },
            })
          }
        })

        const titulo = el.querySelector('.atuacao__titulo')
        if (titulo) cortes.push(revelarLinhas(titulo, { intervalo: 0.08 }))
      })

      revelar(el.querySelector('.rotulo'), { y: 16 })
      revelar(el.querySelectorAll('.atuacao__coluna'), {
        y: 20,
        intervalo: 0.1,
        gatilho: el.querySelector('.atuacao__colunas'),
      })

      return () => {
        vivo = false
        for (const c of cortes) c.revert()
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section
      ref={secao}
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
