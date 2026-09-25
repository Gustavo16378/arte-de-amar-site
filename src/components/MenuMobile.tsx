import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Coracao } from './Coracao'
import { useIsMobile } from '../hooks/useIsMobile'
import { useScrollLock } from '../hooks/useScrollLock'
import { NAV, SITE } from '../content/site'

type Props = {
  aberto: boolean
  aoFechar: () => void
  /** recebe o id da seção; quem chama fecha o menu e rola até lá */
  aoNavegar: (id: string) => void
  /** id da seção sob a linha de leitura, para marcar o item ativo */
  ativo: string
}

const EASE = 'cubic-bezier(.2, .8, .2, 1)'
const CREME = '#F6F2EA'
const MENTA = '#6FE3B0'
const VERDE = '#0B2E22'
const SWITZER = 'Switzer, Helvetica, Arial, sans-serif'

/*
 * Estilos inline de propósito: o overlay e o painel vivem num portal no body,
 * fora da árvore do <nav>, e carregar estilo junto deles evita que qualquer
 * regra de seção, com o seu overflow ou o seu transform, interfira.
 *
 * O `outline: none` aqui é deliberado e precisa ser inline: existe um
 * `:focus-visible` global com outline e offset de 3px, e num item de largura
 * total ele desenhava uma caixa em volta do link. Dentro do painel o foco se
 * mostra por cor de texto.
 */
const overlay = (aberto: boolean, mobile: boolean): CSSProperties => ({
  display: mobile ? 'block' : 'none',
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
  background: 'rgba(11, 46, 34, .55)',
  backdropFilter: 'blur(4px)',
  WebkitBackdropFilter: 'blur(4px)',
  opacity: aberto ? 1 : 0,
  pointerEvents: aberto ? 'auto' : 'none',
  transition: `opacity .4s ${EASE}`,
  border: 0,
  padding: 0,
  cursor: 'pointer',
})

const painel = (aberto: boolean, mobile: boolean): CSSProperties => ({
  position: 'fixed',
  top: 0,
  right: 0,
  zIndex: 9999,
  width: '80vw',
  maxWidth: 320,
  height: '100dvh',
  background: VERDE,
  color: CREME,
  display: mobile ? 'flex' : 'none',
  flexDirection: 'column',
  transform: aberto ? 'translateX(0)' : 'translateX(100%)',
  opacity: aberto ? 1 : 0,
  pointerEvents: aberto ? 'auto' : 'none',
  /*
   * O opacity não acompanha o deslize: enquanto o painel era translúcido, a
   * página passava por trás e desenhava traços acima e abaixo dos itens. Ele
   * entra opaco no primeiro quadro e só apaga depois que o painel já saiu.
   */
  transition: aberto
    ? `transform .4s ${EASE}, opacity 0s`
    : `transform .4s ${EASE}, opacity 0s .4s`,
})

/* o topo repete a altura da barra da página e desce abaixo do notch */
const topo: CSSProperties = {
  flex: 'none',
  height: 'calc(64px + env(safe-area-inset-top))',
  paddingTop: 'env(safe-area-inset-top)',
  paddingRight: 16,
  paddingLeft: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const marca: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  font: '400 17px/1 Sentient, Georgia, serif',
  color: CREME,
}

/*
 * O X é o primeiro foco ao abrir e fica sempre creme: pintá-lo de menta no
 * foco faria com que ele nunca aparecesse na cor pedida. Quem mostra foco
 * por cor são os links, logo abaixo.
 */
const fechar: CSSProperties = {
  width: 44,
  height: 44,
  marginRight: -11,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  background: 'transparent',
  color: CREME,
  outline: 'none',
  cursor: 'pointer',
}

/*
 * A lista encosta no topo, sem centralizar. O recuo de 35px soma com os 13px
 * de respiro do primeiro item e deixa o texto exatamente 48px abaixo da barra
 * do painel. Os 13px em cima e embaixo de cada item dão os 26px de espaço
 * entre eles e, de quebra, um alvo de toque de 47px.
 */
const lista: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  padding: '35px 32px 32px',
  overflowY: 'auto',
}

/*
 * Entrada em stagger, só na abertura. Ao fechar, as duas propriedades trocam
 * em 0s com atraso de .4s: os itens seguem visíveis enquanto o painel desliza
 * para fora e só então voltam ao estado inicial, prontos para a próxima vez.
 */
function entrada(i: number, aberto: boolean): CSSProperties {
  const atraso = 0.12 + i * 0.04
  return {
    opacity: aberto ? 1 : 0,
    transform: aberto ? 'translateX(0)' : 'translateX(12px)',
    transition: aberto
      ? `opacity .4s ${EASE} ${atraso}s, transform .4s ${EASE} ${atraso}s`
      : 'opacity 0s .4s, transform 0s .4s',
  }
}

/*
 * O 85% mora na cor, não no opacity: o opacity é do stagger de entrada, e as
 * duas coisas na mesma propriedade brigariam na lista de transições, o que
 * faria os itens desaparecerem antes do painel na saída.
 */
const item = (ativo: boolean, realce: boolean, i: number, aberto: boolean): CSSProperties => {
  const mov = entrada(i, aberto)
  return {
    display: 'block',
    width: '100%',
    padding: '13px 0',
    border: 0,
    background: 'none',
    color: ativo ? MENTA : realce ? CREME : 'rgba(246, 242, 234, .85)',
    font: `400 16px/1.3 ${SWITZER}`,
    letterSpacing: '0.01em',
    textAlign: 'left',
    outline: 'none',
    cursor: 'pointer',
    ...mov,
    transition: `${mov.transition}, color .25s ${EASE}`,
  }
}

/* o último item já traz 13px de respiro; faltam 27 para os 40 pedidos */
const hairline: CSSProperties = {
  width: 32,
  height: 1,
  marginTop: 27,
  background: 'rgba(217, 210, 195, .25)',
}

/* menta sólida, sem pill e sem ícone: o opacity fica só para a entrada */
const acao: CSSProperties = {
  marginTop: 32,
  padding: 0,
  border: 0,
  background: 'none',
  color: MENTA,
  font: `500 13px/1.2 ${SWITZER}`,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  textAlign: 'left',
  outline: 'none',
  cursor: 'pointer',
}

const rodape: CSSProperties = {
  flex: 'none',
  padding: '28px 32px',
  paddingBottom: 'calc(28px + env(safe-area-inset-bottom))',
}

const local: CSSProperties = {
  display: 'block',
  font: `400 12px/1.4 ${SWITZER}`,
  color: 'rgba(246, 242, 234, .5)',
}

const links: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 20,
  marginTop: 10,
}

const link = (realce: boolean): CSSProperties => ({
  font: `400 12px/1.4 ${SWITZER}`,
  color: realce ? MENTA : 'rgba(246, 242, 234, .7)',
  textDecoration: 'none',
  outline: 'none',
  transition: `color .25s ${EASE}`,
})

/**
 * Menu mobile: um painel que entra da direita, com um overlay atrás.
 *
 * Os dois ficam sempre no DOM, montados por createPortal direto no body.
 * Fechado, o painel não some da árvore: fica em opacity 0 e sem receber
 * ponteiro, e o `inert` o tira também do caminho do teclado e do leitor de
 * tela, que o opacity sozinho não faria.
 *
 * O painel tem a sua própria marca e o seu X: a barra da página se esconde
 * enquanto ele está aberto, para não aparecer por trás.
 */
export function MenuMobile({ aberto, aoFechar, aoNavegar, ativo }: Props) {
  const caixa = useRef<HTMLElement>(null)
  const botaoFechar = useRef<HTMLButtonElement>(null)
  const pendente = useRef<string | null>(null)
  /* hover e foco compartilham o mesmo realce: dentro do painel o foco é cor */
  const [realce, setRealce] = useState<string | null>(null)
  // o painel é só do mobile; no desktop a navegação é o índice lateral
  const mobile = useIsMobile()

  useScrollLock(aberto)

  // fora da vista também significa fora do teclado e do leitor de tela
  useEffect(() => {
    const el = caixa.current
    if (!el) return
    if (aberto) el.removeAttribute('inert')
    else el.setAttribute('inert', '')
  }, [aberto])

  useEffect(() => {
    if (!aberto) {
      setRealce(null)
      return
    }
    /*
     * O foco vai para o X, não para o primeiro link: ali ele é esperado, e o
     * link de largura total ganhava uma caixa do `:focus-visible` global.
     */
    botaoFechar.current?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar])

  /*
   * A rolagem espera o painel sair e a trava soltar: rolar com o body ainda
   * em position fixed perderia o destino.
   */
  useEffect(() => {
    if (aberto) return
    const id = pendente.current
    if (!id) return
    pendente.current = null
    const t = window.setTimeout(() => aoNavegar(id), 420)
    return () => window.clearTimeout(t)
  }, [aberto, aoNavegar])

  const irAte = (id: string) => {
    pendente.current = id
    aoFechar()
  }

  /** hover, toque e foco acendem o mesmo realce */
  const realcar = (id: string) => ({
    onMouseEnter: () => setRealce(id),
    onMouseLeave: () => setRealce((r) => (r === id ? null : r)),
    onFocus: () => setRealce(id),
    onBlur: () => setRealce((r) => (r === id ? null : r)),
    onTouchStart: () => setRealce(id),
  })

  return createPortal(
    <>
      <button
        type="button"
        style={overlay(aberto, mobile)}
        onClick={aoFechar}
        tabIndex={-1}
        aria-hidden="true"
      />

      <aside
        ref={caixa}
        style={painel(aberto, mobile)}
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
      >
        <div style={topo}>
          <span style={marca}>
            <span style={{ display: 'inline-flex', color: MENTA }}>
              <Coracao largura={18} />
            </span>
            {SITE.nome}
          </span>

          <button
            ref={botaoFechar}
            type="button"
            style={fechar}
            onClick={aoFechar}
            aria-label="Fechar o menu"
          >
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        <nav style={lista}>
          {NAV.map((n, i) => (
            <button
              key={n.id}
              type="button"
              style={item(ativo === n.id, realce === n.id, i, aberto)}
              aria-current={ativo === n.id ? 'true' : undefined}
              onClick={() => irAte(n.id)}
              {...realcar(n.id)}
            >
              {n.label}
            </button>
          ))}

          <span style={{ ...hairline, ...entrada(NAV.length, aberto) }} aria-hidden="true" />

          <button
            type="button"
            style={{ ...acao, ...entrada(NAV.length + 1, aberto) }}
            onClick={() => irAte('como-ajudar')}
          >
            Doar via PIX
          </button>
        </nav>

        <div style={rodape}>
          <span style={local}>
            {SITE.local} · desde {SITE.desde}
          </span>

          <span style={links}>
            <a
              href={SITE.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={link(realce === 'ig')}
              {...realcar('ig')}
            >
              {SITE.instagram}
            </a>
            <a
              href={SITE.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={link(realce === 'wa')}
              {...realcar('wa')}
            >
              WhatsApp
            </a>
          </span>
        </div>
      </aside>
    </>,
    document.body,
  )
}
