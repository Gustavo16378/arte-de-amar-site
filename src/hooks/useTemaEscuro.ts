import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'

/**
 * true quando a faixa do header está sobre uma seção `data-dark`
 * (Números, Nossa atuação, Como ajudar e o rodapé).
 *
 * Um ScrollTrigger por seção escura, com o gatilho na linha de baixo do
 * header. O conjunto guarda quais estão ativas, porque durante a troca de
 * uma seção para outra as duas podem cruzar a linha no mesmo quadro, e o
 * header não pode piscar de claro no meio.
 */
export function useTemaEscuro(alturaHeader: number) {
  const [escuro, setEscuro] = useState(false)

  useEffect(() => {
    const ativas = new Set<Element>()

    const gatilhos = [...document.querySelectorAll('[data-dark]')].map((secao) =>
      ScrollTrigger.create({
        trigger: secao,
        start: `top top+=${alturaHeader}`,
        end: `bottom top+=${alturaHeader}`,
        onToggle: (self) => {
          if (self.isActive) ativas.add(secao)
          else ativas.delete(secao)
          setEscuro(ativas.size > 0)
        },
      }),
    )

    return () => gatilhos.forEach((g) => g.kill())
  }, [alturaHeader])

  return escuro
}
