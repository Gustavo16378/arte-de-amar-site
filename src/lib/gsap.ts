import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'

/**
 * Registro único dos plugins. Todos são gratuitos desde o GSAP 3.13.
 *
 * O DrawSVGPlugin saiu: o fio é desenhado por `stroke-dashoffset` com
 * `pathLength="1"`, porque num viewBox esticado o DrawSVG erra o
 * comprimento do path. Veja lib/desenho.ts. Eram 3.7 kB gzip parados aqui.
 *
 * O ScrollToPlugin só entra em ação quando o Lenis está desligado, sob
 * `prefers-reduced-motion`; são 3 kB e ele é o caminho de acessibilidade.
 */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText)

/*
 * limitCallbacks agrupa os callbacks num quadro só em vez de disparar a cada
 * evento de scroll, e ignoreMobileResize evita um refresh inteiro quando a
 * barra de endereço do celular aparece ou some, que muda a altura da janela
 * sem mudar o layout.
 */
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true })

/** o easing padrão do projeto, o mesmo --ease-out do tokens.css */
export const EASE = 'power2.out'
export const EASE_SAIDA = 'expo.out'

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText }
