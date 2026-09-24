import { useRef } from 'react'
import { useMotionProximo } from '../../hooks/useMotionProximo'
import { Coracao } from '../Coracao'
import { Foto } from '../Foto'
import { comEnfase } from '../Titulo'
import { gsap } from '../../lib/gsap'
import { parallax, revelar } from '../../lib/motion'
import { FOOTER, SITE } from '../../content/site'

/**
 * Rodapé. A foto do mural sangra atrás de um véu verde profundo. O fio já
 * terminou no coração: aqui é só o respiro depois da chegada.
 *
 * Motion: a foto sobe devagar em parallax e os textos entram em fade, em
 * stagger.
 */
export function Footer() {
  const ano = new Date().getFullYear()
  const rodape = useRef<HTMLElement>(null)

  useMotionProximo(rodape, () => {
    const el = rodape.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const foto = el.querySelector('.rodape__foto')
      if (foto) parallax(foto, -10, el)

      revelar(
        [
          el.querySelector('.rodape__marca'),
          el.querySelector('.rodape__frase'),
          el.querySelector('.rodape__links'),
          el.querySelector('.rodape__credito'),
        ].filter(Boolean) as Element[],
        { y: 16, intervalo: 0.1, gatilho: el, inicio: 'top 75%' },
      )
    })

    return () => mm.revert()
  })

  return (
    <footer
      ref={rodape}
      className="rodape secao-escura"
      data-secao="como-ajudar"
      data-dark=""
    >
      <Foto foto={FOOTER.foto} tamanhos="100vw" className="rodape__foto" />
      <div className="rodape__veu" aria-hidden="true" />

      <div className="rodape__conteudo">
        <div className="rodape__topo">
          <div>
            <div className="rodape__marca">
              <Coracao largura={34} />
              <span>{SITE.nome}</span>
            </div>
            <p className="rodape__frase">{comEnfase(FOOTER.frase)}</p>
          </div>

          <div className="rodape__links">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
              {SITE.instagram}
            </a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <span>
              {SITE.cidade} · {SITE.estado}
            </span>
          </div>
        </div>

        <div className="rodape__credito">
          <span>
            © {ano} {SITE.nomeCompleto}
          </span>
          <span>CNPJ {SITE.cnpj}</span>
        </div>
      </div>
    </footer>
  )
}
