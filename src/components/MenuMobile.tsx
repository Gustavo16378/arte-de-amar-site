import { useEffect, useRef, type CSSProperties } from 'react'
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

/*
 * Estilos inline de propósito: o overlay e o painel vivem num portal no body,
 * fora da árvore do <nav>, e carregar estilo junto deles evita que qualquer
 * regra de seção, com o seu overflow ou o seu transform, interfira.
 */
const overlay = (aberto: boolean, mobile: boolean): CSSProperties => ({
  display: mobile ? 'block' : 'none',
  position: 'fixed',
  inset: 0,
  zIndex: 9998,
  background: 'rgba(11, 46, 34, .6)',
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
  width: '85vw',
  maxWidth: 340,
  height: '100dvh',
  background: VERDE,
  color: CREME,
  /* separa o painel do véu, que é da mesma família de verde */
  boxShadow: '0 0 60px rgba(0, 0, 0, .35)',
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
  paddingLeft: 28,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const marca: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  font: '400 18px/1 Sentient, Georgia, serif',
  color: CREME,
}

const fechar: CSSProperties = {
  width: 44,
  height: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 0,
  borderRadius: 8,
  background: 'transparent',
  color: CREME,
  cursor: 'pointer',
}

/* a lista toma o espaço entre o topo e o rodapé e centraliza os itens nele */
const lista: CSSProperties = {
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 28px',
  overflowY: 'auto',
}

/*
 * Entrada em stagger, só na abertura. Ao fechar, as duas propriedades trocam
 * em 0s com atraso de .4s: os itens seguem visíveis enquanto o painel desliza
 * para fora e só então voltam ao estado inicial, prontos para a próxima vez.
 */
const item = (ativo: boolean, i: number, aberto: boolean): CSSProperties => {
  const atraso = 0.15 + i * 0.05
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    width: '100%',
    padding: '14px 0',
    border: 0,
    background: 'none',
    color: ativo ? MENTA : CREME,
    font: '300 30px/1.15 Sentient, Georgia, serif',
    letterSpacing: '-0.01em',
    textAlign: 'left',
    cursor: 'pointer',
    opacity: aberto ? 1 : 0,
    transform: aberto ? 'translateX(0)' : 'translateX(16px)',
    transition: aberto
      ? `opacity .45s ${EASE} ${atraso}s, transform .45s ${EASE} ${atraso}s, color .3s ${EASE}`
      : `opacity 0s .4s, transform 0s .4s, color .3s ${EASE}`,
  }
}

/** o ativo se diferencia só por isto e pela cor do texto: o traço cresce */
const traco = (ativo: boolean): CSSProperties => ({
  flex: 'none',
  width: ativo ? 40 : 24,
  height: 1,
  background: MENTA,
  transition: `width .3s ${EASE}`,
})

const rodape: CSSProperties = {
  flex: 'none',
  borderTop: '1px solid rgba(217, 210, 195, .2)',
  padding: '24px 28px',
  paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
}

const doar: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  height: 48,
  width: '100%',
  borderRadius: 999,
  background: MENTA,
  color: VERDE,
  font: '500 15px/1 Switzer, Helvetica, Arial, sans-serif',
  textDecoration: 'none',
}

const local: CSSProperties = {
  display: 'block',
  marginTop: 16,
  font: '400 12px/1.4 Switzer, Helvetica, Arial, sans-serif',
  color: 'rgba(246, 242, 234, .6)',
}

const links: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 20,
  marginTop: 10,
}

const link: CSSProperties = {
  padding: 0,
  border: 0,
  background: 'none',
  font: '400 12px/1.4 Switzer, Helvetica, Arial, sans-serif',
  color: MENTA,
  textDecoration: 'none',
  cursor: 'pointer',
}

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
  const primeiro = useRef<HTMLButtonElement>(null)
  const pendente = useRef<string | null>(null)
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
    if (!aberto) return
    primeiro.current?.focus()

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
              <Coracao largura={20} />
            </span>
            {SITE.nome}
          </span>

          <button type="button" style={fechar} onClick={aoFechar} aria-label="Fechar o menu">
            <X size={22} strokeWidth={1.75} />
          </button>
        </div>

        <nav style={lista}>
          {NAV.map((n, i) => (
            <button
              key={n.id}
              ref={i === 0 ? primeiro : undefined}
              type="button"
              style={item(ativo === n.id, i, aberto)}
              aria-current={ativo === n.id ? 'true' : undefined}
              onClick={() => irAte(n.id)}
            >
              <span style={traco(ativo === n.id)} aria-hidden="true" />
              {n.label}
            </button>
          ))}
        </nav>

        <div style={rodape}>
          <a
            href="#como-ajudar"
            style={doar}
            onClick={(e) => {
              e.preventDefault()
              irAte('como-ajudar')
            }}
          >
            <Coracao largura={16} />
            Doar
          </a>

          <span style={local}>
            {SITE.local}, desde {SITE.desde}
          </span>

          <span style={links}>
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer" style={link}>
              {SITE.instagram}
            </a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" style={link}>
              WhatsApp
            </a>
            <button type="button" style={link} onClick={() => irAte('como-ajudar')}>
              PIX
            </button>
          </span>
        </div>
      </aside>
    </>,
    document.body,
  )
}
