import { useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
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
  transition: 'opacity .4s cubic-bezier(.2, .8, .2, 1)',
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
  maxWidth: 360,
  height: '100dvh',
  background: '#0B2E22',
  color: '#F6F2EA',
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
    ? 'transform .4s cubic-bezier(.2, .8, .2, 1), opacity 0s'
    : 'transform .4s cubic-bezier(.2, .8, .2, 1), opacity 0s .4s',
  paddingTop: 'calc(28px + env(safe-area-inset-top))',
  paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
  overflowY: 'auto',
})

const item = (ativo: boolean): CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 16,
  width: '100%',
  padding: '10px 28px',
  border: 0,
  background: 'none',
  color: ativo ? '#6FE3B0' : '#F6F2EA',
  font: '300 32px/1.15 Sentient, Georgia, serif',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'color .3s cubic-bezier(.2, .8, .2, 1)',
})

/** todos os traços do mesmo comprimento, como pede o kit */
const traco = (ativo: boolean): CSSProperties => ({
  flex: 'none',
  width: 24,
  height: 1.5,
  background: ativo ? '#6FE3B0' : 'rgba(111, 227, 176, .55)',
  transition: 'background .3s cubic-bezier(.2, .8, .2, 1)',
})

/**
 * Menu mobile: um painel que entra da direita, com um overlay atrás.
 *
 * Os dois ficam sempre no DOM, montados por createPortal direto no body.
 * Fechado, o painel não some da árvore: fica em opacity 0 e sem receber
 * ponteiro, e o `inert` o tira também do caminho do teclado e do leitor de
 * tela, que o opacity sozinho não faria.
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
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 44 }}>
          {NAV.map((n, i) => (
            <button
              key={n.id}
              ref={i === 0 ? primeiro : undefined}
              type="button"
              style={item(ativo === n.id)}
              aria-current={ativo === n.id ? 'true' : undefined}
              onClick={() => irAte(n.id)}
            >
              <span style={traco(ativo === n.id)} aria-hidden="true" />
              {n.label}
            </button>
          ))}
        </nav>

        <div
          style={{
            marginTop: 'auto',
            padding: '28px 28px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <a
            href="#como-ajudar"
            onClick={(e) => {
              e.preventDefault()
              irAte('como-ajudar')
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 52,
              borderRadius: 999,
              background: '#6FE3B0',
              color: '#0B2E22',
              font: '500 16px/1 Switzer, Helvetica, Arial, sans-serif',
              textDecoration: 'none',
            }}
          >
            Doar
          </a>

          <span
            style={{
              font: '400 13px/1.4 Switzer, Helvetica, Arial, sans-serif',
              color: '#D9D2C3',
            }}
          >
            {SITE.local}, desde {SITE.desde}
          </span>

          <span style={{ display: 'flex', flexWrap: 'wrap', gap: 18 }}>
            {[
              { rotulo: SITE.instagram, href: SITE.instagramUrl },
              { rotulo: 'WhatsApp', href: SITE.whatsapp },
            ].map((l) => (
              <a
                key={l.rotulo}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#6FE3B0',
                  font: '400 13px/1.4 Switzer, Helvetica, Arial, sans-serif',
                  textDecoration: 'none',
                }}
              >
                {l.rotulo}
              </a>
            ))}
            <button
              type="button"
              onClick={() => irAte('como-ajudar')}
              style={{
                padding: 0,
                border: 0,
                background: 'none',
                color: '#6FE3B0',
                font: '400 13px/1.4 Switzer, Helvetica, Arial, sans-serif',
                cursor: 'pointer',
              }}
            >
              PIX
            </button>
          </span>
        </div>
      </aside>
    </>,
    document.body,
  )
}
