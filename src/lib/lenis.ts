import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

/**
 * Scroll suave.
 *
 * O Lenis vira a fonte de verdade da rolagem e o ScrollTrigger passa a ser
 * atualizado por ele, não pelo evento nativo. O rAF do Lenis roda dentro do
 * ticker do GSAP, para que motion e scroll compartilhem o mesmo quadro.
 *
 * Com `prefers-reduced-motion` nada disso é criado: a página rola do jeito
 * nativo e `obterLenis()` devolve null.
 *
 * É um singleton de módulo de propósito. O site é uma página só, e assim o
 * StrictMode do React, que monta os efeitos duas vezes em desenvolvimento,
 * não cria duas instâncias brigando pelo mesmo scroll.
 */

let instancia: Lenis | null = null
let iniciado = false

export function iniciarLenis(): Lenis | null {
  if (iniciado) return instancia
  iniciado = true

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null

  instancia = new Lenis({
    lerp: 0.1,
    // o toque no celular continua nativo: mais previsível e mais leve
    smoothWheel: true,
    syncTouch: false,
  })

  instancia.on('scroll', ScrollTrigger.update)
  gsap.ticker.add(aoQuadro)
  gsap.ticker.lagSmoothing(0)

  return instancia
}

function aoQuadro(tempo: number) {
  // o ticker do GSAP conta em segundos, o Lenis espera milissegundos
  instancia?.raf(tempo * 1000)
}

export function obterLenis() {
  return instancia
}

/** trava e destrava a rolagem, para o menu em tela cheia */
export function pausarLenis() {
  instancia?.stop()
}

export function retomarLenis() {
  instancia?.start()
}

/**
 * Devolve a página à posição `y`, sem animação.
 *
 * Existe por causa do menu: com o body em `position: fixed` o documento vai
 * para o topo, e o Lenis registra esse zero como sendo a rolagem atual. Um
 * `window.scrollTo` sozinho seria desfeito no quadro seguinte, quando o rAF
 * do Lenis reaplicasse o valor que ele guardou. Por isso quem manda aqui é o
 * próprio Lenis, com `immediate` e `force`.
 */
export function restaurarScroll(y: number) {
  if (!instancia) {
    window.scrollTo(0, y)
    return
  }
  instancia.resize()
  instancia.scrollTo(y, { immediate: true, force: true })
}

/**
 * Leva até uma seção, descontando a altura do header.
 * Com o Lenis ativo quem anima é ele; sem Lenis, o ScrollToPlugin faz o
 * mesmo papel, e sob reduced motion o salto é instantâneo, como deve ser.
 */
export function irPara(alvo: string | HTMLElement, recuo: number) {
  const el = typeof alvo === 'string' ? document.querySelector<HTMLElement>(alvo) : alvo
  if (!el) return

  if (instancia) {
    instancia.scrollTo(el, { offset: -recuo, duration: 1.1 })
    return
  }

  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  gsap.to(window, {
    duration: reduzido ? 0 : 1.1,
    ease: 'power2.inOut',
    scrollTo: { y: el, offsetY: recuo, autoKill: true },
  })
}
