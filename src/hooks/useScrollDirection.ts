import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'

export type Direcao = 'cima' | 'baixo'

/**
 * Direção da rolagem, com limiar de 8px para não tremer.
 *
 * Padrão do time: o header some ao rolar para baixo e volta ao rolar para
 * cima. Perto do topo da página a direção é sempre 'cima', para o header
 * nunca ficar escondido no começo.
 *
 * Usa o onUpdate do ScrollTrigger em vez do evento de scroll porque o Lenis
 * já alimenta o ScrollTrigger: assim a leitura vem do mesmo quadro.
 */
export function useScrollDirection(limiar = 8, tetoDoTopo = 80) {
  const [direcao, setDirecao] = useState<Direcao>('cima')

  useEffect(() => {
    let ultimo = window.scrollY
    let atual: Direcao = 'cima'

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: () => {
        const y = window.scrollY
        const delta = y - ultimo
        if (Math.abs(delta) < limiar) return
        ultimo = y

        const nova: Direcao = y <= tetoDoTopo ? 'cima' : delta > 0 ? 'baixo' : 'cima'
        if (nova !== atual) {
          atual = nova
          setDirecao(nova)
        }
      },
    })

    return () => st.kill()
  }, [limiar, tetoDoTopo])

  return direcao
}
