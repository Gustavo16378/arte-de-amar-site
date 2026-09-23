import { useEffect } from 'react'
import { ScrollTrigger } from '../lib/gsap'
import { pausarLenis, restaurarScroll, retomarLenis } from '../lib/lenis'

/**
 * Trava a rolagem enquanto o menu está aberto.
 *
 * Padrão do time: `position: fixed` no body com o scrollY negativo no `top`,
 * e restauração do scrollY ao fechar. É o único jeito que segura no iOS, onde
 * `overflow: hidden` no body não impede o arrasto. Nunca usamos
 * `overflow: hidden` no html ou no body para travar.
 *
 * O Lenis pausa junto, senão continuaria tentando rolar um body que saiu do
 * fluxo, e a posição restaurada sairia errada.
 */
export function useScrollLock(ativo: boolean) {
  useEffect(() => {
    if (!ativo) return

    const body = document.body
    const y = window.scrollY
    const anterior = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    }

    pausarLenis()
    body.style.position = 'fixed'
    body.style.top = `-${y}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'

    return () => {
      body.style.position = anterior.position
      body.style.top = anterior.top
      body.style.left = anterior.left
      body.style.right = anterior.right
      body.style.width = anterior.width
      retomarLenis()
      restaurarScroll(y)
      /*
       * Com o body fora do fluxo o documento tem altura de viewport, e todo
       * ScrollTrigger criado ou medido nesse intervalo fica com o fim em
       * zero: o progresso trava em 100% e o onUpdate para de acompanhar.
       * Remedir aqui conserta tanto o preloader quanto o menu.
       */
      ScrollTrigger.refresh()
    }
  }, [ativo])
}
