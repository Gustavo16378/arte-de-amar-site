import { useEffect, type RefObject } from 'react'

/**
 * Monta o motion de uma seção só quando ela se aproxima da tela.
 *
 * Por que isto existe: ligar tudo na carga custava caro. Cada seção cria
 * ScrollTriggers, mede o próprio tamanho e corta texto em linhas, e nove
 * seções fazendo isso de uma vez davam 690ms de bloqueio da thread principal
 * no Lighthouse mobile. Quem abre a página e não rola pagava por animação
 * que nunca ia ver.
 *
 * A margem de 150% dispara o preparo uma tela e meia antes, o que dá folga
 * de sobra: quando a seção chega, tudo já está armado.
 *
 * As seções que já nascem visíveis disparam na hora, como antes.
 */
export function useMotionProximo(
  alvo: RefObject<Element | null>,
  montar: (el: Element) => (() => void) | void,
  dependencias: unknown[] = [],
) {
  useEffect(() => {
    const el = alvo.current
    if (!el) return

    let desmontar: (() => void) | void
    let montado = false

    const observador = new IntersectionObserver(
      (entradas) => {
        if (montado || !entradas.some((e) => e.isIntersecting)) return
        montado = true
        observador.disconnect()
        desmontar = montar(el)
      },
      { rootMargin: '150% 0px' },
    )
    observador.observe(el)

    return () => {
      observador.disconnect()
      desmontar?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias)
}
