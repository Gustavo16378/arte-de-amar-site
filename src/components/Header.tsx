import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Coracao } from './Coracao'
import { MenuMobile } from './MenuMobile'
import { NAV, SITE } from '../content/site'
import { useScrollDirection } from '../hooks/useScrollDirection'
import { useTemaEscuro } from '../hooks/useTemaEscuro'
import { useNavegacao } from '../hooks/useNavegacao'
import { irPara } from '../lib/lenis'
import { ScrollTrigger } from '../lib/gsap'

const ALTURA_HEADER = 64

/**
 * Cabeçalho e navegação.
 *
 * Mobile: barra fixa de 64px que some ao rolar para baixo e volta ao rolar
 * para cima. No topo da página ela é transparente e sem borda; assim que a
 * página rola, ganha fundo, blur e a borda inferior. Sobre as seções
 * `data-dark` o mesmo, invertido. O hambúrguer abre o painel lateral.
 *
 * Desktop: marca e "Doar" no topo, que somem depois dos primeiros 40px; no
 * lugar deles entra o índice lateral, com um trecho vertical do fio que se
 * preenche conforme o progresso da página. O "Doar" volta como botão
 * flutuante depois do hero e some ao chegar em Como ajudar.
 */
export function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const preenchimento = useRef<HTMLDivElement>(null)

  const direcao = useScrollDirection()
  const escuro = useTemaEscuro(ALTURA_HEADER)
  const { ativo, rolou, mostraDoar } = useNavegacao(preenchimento)

  // a barra só se esconde quando o menu está fechado
  const barraEscondida = direcao === 'baixo' && !menuAberto

  const navegar = useCallback((id: string) => {
    irPara(`#${id}`, ALTURA_HEADER)
  }, [])

  // o ScrollTrigger precisa remedir depois que as fontes assentam o layout
  useEffect(() => {
    let vivo = true
    document.fonts?.ready.then(() => {
      if (vivo) ScrollTrigger.refresh()
    })
    return () => {
      vivo = false
    }
  }, [])

  return (
    <>
      {/* ------------------------------------------------- barra mobile */}
      <header
        className="barra"
        data-tema={escuro ? 'escuro' : 'claro'}
        data-rolou={rolou ? '' : undefined}
        data-escondida={barraEscondida ? '' : undefined}
        data-menu={menuAberto ? '' : undefined}
      >
        <a
          className="barra__marca"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            navegar('inicio')
          }}
        >
          <Coracao largura={24} className="barra__coracao" />
          <span>{SITE.nome}</span>
        </a>

        <div className="barra__acoes">
          <a
            className="barra__doar"
            href="#como-ajudar"
            onClick={(e) => {
              e.preventDefault()
              navegar('como-ajudar')
            }}
          >
            Doar
          </a>
          <button
            className="barra__menu"
            type="button"
            onClick={() => setMenuAberto((v) => !v)}
            aria-label={menuAberto ? 'Fechar o menu' : 'Abrir o menu'}
            aria-expanded={menuAberto}
          >
            {menuAberto ? <X size={22} strokeWidth={1.75} /> : <Menu size={22} strokeWidth={1.75} />}
          </button>
        </div>
      </header>

      <MenuMobile
        aberto={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        aoNavegar={navegar}
        ativo={ativo}
      />

      {/* ------------------------------- marca e Doar do topo, no desktop */}
      <div className="topo-desktop" data-oculto={rolou ? '' : undefined}>
        <a
          className="topo-desktop__marca"
          href="#inicio"
          onClick={(e) => {
            e.preventDefault()
            navegar('inicio')
          }}
        >
          {/* o gradiente do logo vem do CSS, que ganha do fill do atributo */}
          <Coracao largura={30} className="topo-desktop__logo" />
          <span>{SITE.nome}</span>
        </a>
        <a
          className="pill pill--escuro topo-desktop__doar"
          href="#como-ajudar"
          onClick={(e) => {
            e.preventDefault()
            navegar('como-ajudar')
          }}
        >
          <Coracao variante="contorno" largura={16} preencheNoHover />
          Doar
        </a>
      </div>

      {/* ------------------------------------- índice lateral do desktop */}
      <nav className="indice" aria-label="Seções" data-visivel={rolou ? '' : undefined}>
        <div className="indice__trilho">
          <div ref={preenchimento} className="indice__preenchimento" />
        </div>
        <ul className="indice__lista">
          {NAV.map((n) => (
            <li key={n.id}>
              <a
                href={`#${n.id}`}
                aria-current={ativo === n.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  navegar(n.id)
                }}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ------------------------------- botão Doar flutuante do desktop */}
      <a
        className="pill pill--escuro doar-flutuante"
        href="#como-ajudar"
        data-visivel={mostraDoar ? '' : undefined}
        onClick={(e) => {
          e.preventDefault()
          navegar('como-ajudar')
        }}
      >
        <Coracao variante="contorno" largura={16} preencheNoHover />
        Doar
      </a>
    </>
  )
}
