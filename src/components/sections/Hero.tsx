import { Fragment } from 'react'
import { Blob } from '../Blob'
import { Botao } from '../Botao'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { FOTO_HERO, HERO } from '../../content/site'

/**
 * Início. Foto full-bleed no mobile com o título sobre o gradiente escuro;
 * no desktop a foto vira um blob à direita e o título ocupa a margem creme.
 */
export function Hero() {
  return (
    <section id="inicio" className="secao hero" data-secao="inicio">
      {/* o preloader já desenhou os primeiros 30%, saindo do coração */}
      <Fio secao="hero" de={0.3} inicio="top top" />

      <Blob className="hero__foto" mascara={null} foto={FOTO_HERO} prioridade />
      <div className="hero__veu" aria-hidden="true" />

      <div className="hero__copy">
        <h1 className="hero__titulo">
          {HERO.titulo.map((linha, i) => (
            <Fragment key={linha}>
              {i > 0 && ' '}
              <span className="hero__linha">
                <span>{comEnfase(linha)}</span>
              </span>
            </Fragment>
          ))}
        </h1>

        <p className="hero__sub">{HERO.subtitulo}</p>

        <div className="hero__cta">
          <Botao href="#como-ajudar" aparencia="menta" comCoracao className="hero__doar">
            {HERO.ctaPrimario}
          </Botao>
          <a href="#quem-somos" className="link-fio">
            {HERO.ctaSecundario}
          </a>
        </div>
      </div>

      <div className="hero__role" aria-hidden="true">
        <span>{HERO.role}</span>
        <span />
      </div>
    </section>
  )
}
