import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gsap } from '../lib/gsap'
import { useScrollLock } from '../hooks/useScrollLock'
import { Coracao } from './Coracao'
import { NAV, SITE } from '../content/site'

type Props = {
  aberto: boolean
  aoFechar: () => void
  /** chamado só depois que o menu saiu de cena e a rolagem destravou */
  aoNavegar: (id: string) => void
}

const reduzido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Menu em tela cheia, montado com createPortal direto no body para escapar
 * de qualquer `transform` ou `overflow` de ancestral. Nunca hambúrguer de
 * três linhas: o botão da barra é o coração, e aqui dentro ele é um X que
 * volta a ser coração no fechamento.
 *
 * O painel sobe de baixo, os itens entram em stagger e cada traço do fio se
 * desenha da esquerda. Com `prefers-reduced-motion` tudo vira um fade curto.
 *
 * O componente continua montado durante a animação de saída, e só aí solta a
 * trava de rolagem. Por isso a navegação é avisada depois, e não no clique:
 * rolar com o body ainda em `position: fixed` perderia o destino.
 */
export function MenuMobile({ aberto, aoFechar, aoNavegar }: Props) {
  const [montado, setMontado] = useState(aberto)
  const painel = useRef<HTMLDivElement>(null)
  const botaoFechar = useRef<HTMLButtonElement>(null)
  const pendente = useRef<string | null>(null)

  useScrollLock(montado)

  // entrada e saída
  useEffect(() => {
    if (aberto) {
      setMontado(true)
      return
    }
    if (!montado || !painel.current) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => setMontado(false) })

      if (reduzido()) {
        tl.to('[data-menu-painel]', { opacity: 0, duration: 0.25 })
        return
      }

      // o X gira e vira coração antes de o painel descer
      tl.to('[data-menu-x]', { opacity: 0, rotate: 90, duration: 0.25, ease: 'power2.in' })
        .to('[data-menu-coracao]', { opacity: 1, rotate: 0, duration: 0.25 }, '<')
        .to('[data-menu-item]', { y: 20, opacity: 0, duration: 0.2, stagger: 0.03 }, '<')
        .to(
          '[data-menu-painel]',
          { yPercent: 100, duration: 0.45, ease: 'power3.in' },
          '-=0.1',
        )
    }, painel)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto])

  useEffect(() => {
    if (!montado || !painel.current) return

    const ctx = gsap.context(() => {
      if (reduzido()) {
        gsap.fromTo('[data-menu-painel]', { opacity: 0 }, { opacity: 1, duration: 0.3 })
        return
      }

      gsap
        .timeline()
        .fromTo(
          '[data-menu-painel]',
          { yPercent: 100 },
          { yPercent: 0, duration: 0.6, ease: 'expo.out' },
        )
        .fromTo(
          '[data-menu-item]',
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out', stagger: 0.07 },
          '-=0.3',
        )
        .fromTo(
          '[data-menu-traco]',
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, ease: 'power2.out', stagger: 0.07 },
          '<',
        )
        .fromTo('[data-menu-rodape]', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.2')
    }, painel)

    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [montado])

  // a rolagem só acontece depois que o menu desmontou e o body voltou ao normal
  useEffect(() => {
    if (montado) return
    const id = pendente.current
    if (!id) return
    pendente.current = null
    requestAnimationFrame(() => aoNavegar(id))
  }, [montado, aoNavegar])

  // Esc fecha, e o foco entra no botão de fechar
  useEffect(() => {
    if (!aberto) return
    botaoFechar.current?.focus()

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [aberto, aoFechar])

  if (!montado) return null

  const irAte = (id: string) => {
    pendente.current = id
    aoFechar()
  }

  return createPortal(
    <div
      ref={painel}
      className="menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
    >
      <div className="menu__painel" data-menu-painel="">
        <div className="menu__topo">
          <span className="menu__marca">
            <Coracao largura={24} className="menu__coracao-marca" />
            <span>{SITE.nome}</span>
          </span>
          <button
            ref={botaoFechar}
            type="button"
            className="menu__fechar"
            onClick={aoFechar}
            aria-label="Fechar o menu"
          >
            <span className="menu__x" data-menu-x="" aria-hidden="true">
              <span />
              <span />
            </span>
            {/* o coração espera por baixo do X, para o morph do fechamento */}
            <span className="menu__coracao-volta" data-menu-coracao="" aria-hidden="true">
              <Coracao variante="contorno" largura={18} />
            </span>
          </button>
        </div>

        <nav className="menu__itens" aria-label="Seções">
          {NAV.map((n, i) => (
            <button
              key={n.id}
              type="button"
              className="menu__item"
              data-menu-item=""
              onClick={() => irAte(n.id)}
            >
              {/* o traço cresce item a item, como na prancha */}
              <span
                className="menu__traco"
                data-menu-traco=""
                style={{ width: `${18 + i * 6}px` }}
                aria-hidden="true"
              />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="menu__rodape" data-menu-rodape="">
          <span>
            {SITE.local}, desde {SITE.desde}
          </span>
          <span className="menu__links">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
              {SITE.instagram}
            </a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <button type="button" onClick={() => irAte('como-ajudar')}>
              PIX
            </button>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
