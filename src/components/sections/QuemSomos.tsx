import { useRef } from 'react'
import { useMotionProximo } from '../../hooks/useMotionProximo'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { gsap } from '../../lib/gsap'
import { abrirMascara, revelar, revelarLinhas } from '../../lib/motion'
import { QUEM_SOMOS } from '../../content/site'

/**
 * Quem somos, sobre creme. O fio passa atrás do título e entra atrás da foto,
 * que sangra para a esquerda junto com as linhas de missão, visão e valores.
 *
 * Motion: título e parágrafo em reveal por linha; a máscara da foto abre
 * crescendo e desentortando, e a legenda entra 0.3s depois; as linhas de
 * missão, visão e valores aparecem em stagger.
 */
export function QuemSomos() {
  const secao = useRef<HTMLElement>(null)

  useMotionProximo(secao, () => {
    const el = secao.current
    if (!el) return

    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const cortes: ReturnType<typeof revelarLinhas>[] = []

      let vivo = true
      document.fonts?.ready.then(() => {
        if (!vivo) return
        const titulo = el.querySelector('.quem__titulo')
        if (titulo) cortes.push(revelarLinhas(titulo, { intervalo: 0.08 }))
        for (const p of el.querySelectorAll('.quem__texto')) {
          cortes.push(revelarLinhas(p, { intervalo: 0.06, duracao: 0.8 }))
        }
      })

      revelar(el.querySelector('.rotulo'), { y: 16 })

      const foto = el.querySelector('.quem__foto')
      if (foto) abrirMascara(foto)

      for (const legenda of el.querySelectorAll('.quem__legenda')) {
        revelar(legenda, { y: 12, atraso: 0.3, gatilho: foto })
      }

      revelar(el.querySelectorAll('.quem__pilar'), {
        y: 18,
        intervalo: 0.1,
        gatilho: el.querySelector('.quem__pilares'),
      })

      return () => {
        vivo = false
        for (const c of cortes) c.revert()
      }
    })

    return () => mm.revert()
  })

  return (
    <section
      ref={secao}
      id="quem-somos"
      className="secao quem calha"
      data-secao="quem-somos"
    >
      <Fio secao="quem" />

      <div className="secao__conteudo quem__grade">
        <div>
          <span className="rotulo">{QUEM_SOMOS.rotulo}</span>

          <h2 className="titulo-secao quem__titulo">{comEnfase(QUEM_SOMOS.titulo)}</h2>

          <p className="corpo quem__texto so-mobile">{QUEM_SOMOS.paragrafoMobile}</p>

          <div className="quem__moldura">
            <Blob
              className="quem__foto"
              variante={0}
              foto={QUEM_SOMOS.foto}
              tamanhos="(min-width: 1024px) 280px, 350px"
            >
              <span className="quem__legenda so-mobile">
                {QUEM_SOMOS.legenda[0]}
                <br />
                {QUEM_SOMOS.legenda[1]}
              </span>
            </Blob>
            <span className="quem__legenda so-desktop">
              {QUEM_SOMOS.legenda[0]}
              <br />
              {QUEM_SOMOS.legenda[1]}
            </span>
          </div>
        </div>

        <div className="quem__coluna-texto">
          <p className="corpo quem__texto so-desktop">{QUEM_SOMOS.paragrafoDesktop}</p>

          <div className="quem__pilares">
            {QUEM_SOMOS.pilares.map((p) => (
              <div key={p.rotulo} className="quem__pilar">
                <span className="quem__pilar-rotulo">{p.rotulo}</span>
                <span className="quem__pilar-texto so-mobile">{p.curto}</span>
                <span className="quem__pilar-texto so-desktop">{p.longo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
