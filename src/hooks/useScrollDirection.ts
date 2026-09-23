import { useEffect, useState } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { observarRolagemProgramada } from '../lib/lenis'

export type Direcao = 'cima' | 'baixo'

/**
 * Direção da rolagem, com limiar de 8px para não tremer.
 *
 * Padrão do time: o header some ao rolar para baixo e volta ao rolar para
 * cima. Perto do topo da página a direção é sempre 'cima', para o header
 * nunca ficar escondido no começo.
 *
 * Durante uma rolagem por clique (menu, índice, Doar) a direção fica
 * congelada em 'cima': o header não pode fugir justamente quando o usuário
 * pediu para ir a algum lugar. A posição continua sendo acompanhada, para
 * que ao soltar não haja um salto de direção.
 *
 * Usa o onUpdate do ScrollTrigger em vez do evento de scroll porque o Lenis
 * já alimenta o ScrollTrigger: assim a leitura vem do mesmo quadro.
 */
export function useScrollDirection(limiar = 8, tetoDoTopo = 80) {
  const [direcao, setDirecao] = useState<Direcao>('cima')

  useEffect(() => {
    let ultimo = window.scrollY
    let atual: Direcao = 'cima'
    let programada = false

    const aplicar = (nova: Direcao) => {
      if (nova === atual) return
      atual = nova
      setDirecao(nova)
    }

    const pararDeObservar = observarRolagemProgramada((ativo) => {
      programada = ativo
      if (ativo) aplicar('cima')
    })

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: () => {
        const y = window.scrollY
        const delta = y - ultimo
        if (Math.abs(delta) < limiar) return
        ultimo = y

        // acompanha a posição, mas não muda de direção no meio do trajeto
        if (programada) return

        aplicar(y <= tetoDoTopo ? 'cima' : delta > 0 ? 'baixo' : 'cima')
      },
    })

    return () => {
      pararDeObservar()
      st.kill()
    }
  }, [limiar, tetoDoTopo])

  return direcao
}
