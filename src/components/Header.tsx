import { Coracao } from './Coracao'
import { NAV, SITE } from '../content/site'

/**
 * Cabeçalho, layout estático.
 *
 * Mobile: barra fixa de 64px, creme translúcido com blur, marca à esquerda e
 * "Doar" + botão circular à direita. Nunca hambúrguer de três linhas.
 *
 * Desktop: marca no canto superior esquerdo, "Doar" no canto superior direito
 * e o índice lateral fixo à esquerda, com um trecho vertical do fio ao lado.
 *
 * O comportamento (esconder ao rolar, inverter sobre seção escura, abrir o
 * menu em portal, ScrollTo e Lenis) entra na Fase 2.
 */
export function Header() {
  return (
    <>
      {/* ------------------------------------------------- barra mobile */}
      <header className="barra" data-barra="">
        <a className="barra__marca" href="#inicio">
          <Coracao largura={24} className="barra__coracao" />
          <span>{SITE.nome}</span>
        </a>

        <div className="barra__acoes">
          <a className="barra__doar" href="#como-ajudar">
            Doar
          </a>
          <button className="barra__menu" type="button" aria-label="Abrir o menu">
            <Coracao variante="contorno" largura={18} />
          </button>
        </div>
      </header>

      {/* ------------------------------- marca e Doar do topo, no desktop */}
      <div className="topo-desktop" data-topo="">
        <a className="topo-desktop__marca" href="#inicio">
          {/* o gradiente do logo vem do CSS, que ganha do fill do atributo */}
          <Coracao largura={30} className="topo-desktop__logo" />
          <span>{SITE.nome}</span>
        </a>
        <a className="pill pill--escuro topo-desktop__doar" href="#como-ajudar">
          <Coracao variante="contorno" largura={16} preencheNoHover />
          Doar
        </a>
      </div>

      {/* ------------------------------------- índice lateral do desktop */}
      <nav className="indice" aria-label="Seções">
        <div className="indice__trilho">
          <div className="indice__preenchimento" data-indice-preenchimento="" />
        </div>
        <ul className="indice__lista">
          {NAV.map((n) => (
            <li key={n.id}>
              <a href={`#${n.id}`} data-indice-item={n.id}>
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ------------------------------- botão Doar flutuante do desktop */}
      <a className="pill pill--escuro doar-flutuante" href="#como-ajudar">
        <Coracao variante="contorno" largura={16} preencheNoHover />
        Doar
      </a>
    </>
  )
}
