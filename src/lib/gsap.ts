import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { SplitText } from 'gsap/SplitText'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

/**
 * Registro único dos plugins. Todos são gratuitos desde o GSAP 3.13.
 *
 * SplitText e DrawSVG só entram em cena nas Fases 4 e 5, mas ficam
 * registrados aqui para não haver dois pontos de configuração.
 */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin)

/** o easing padrão do projeto, o mesmo --ease-out do tokens.css */
export const EASE = 'power2.out'
export const EASE_SAIDA = 'expo.out'

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, DrawSVGPlugin }
