import { useMemo, useState } from 'react'
import { BarraDoFio } from '../BarraDoFio'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { PROJETOS } from '../../content/projetos'
import { PROJETOS_SECAO } from '../../content/site'

/**
 * Projetos e campanhas.
 * Mobile: cards empilhados, as fotos alternando o lado para onde sangram.
 * Desktop: zigue-zague, foto de um lado e texto do outro.
 * As campanhas com meta ganham a barra de progresso feita com o fio.
 *
 * O filtro já funciona; a transição animada entre estados entra na Fase 5.
 */
export function Projetos() {
  const [filtro, setFiltro] = useState<string>(PROJETOS_SECAO.filtros[0])

  const lista = useMemo(() => {
    if (filtro === 'Em andamento') return PROJETOS.filter((p) => p.status === 'Em andamento')
    if (filtro === 'Concluídos') return PROJETOS.filter((p) => p.status === 'Concluído')
    return PROJETOS
  }, [filtro])

  return (
    <section id="projetos" className="secao projetos calha" data-secao="projetos">
      <Fio secao="projetos" />

      <div className="secao__conteudo">
        <div className="projetos__cabecalho">
          <div>
            <span className="rotulo">{PROJETOS_SECAO.rotulo}</span>
            <h2 className="titulo-secao projetos__titulo">
              {comEnfase(PROJETOS_SECAO.titulo)}
            </h2>
          </div>

          <div className="projetos__filtros" role="group" aria-label="Filtrar projetos">
            {PROJETOS_SECAO.filtros.map((f) => (
              <button
                key={f}
                type="button"
                className="projetos__filtro"
                aria-pressed={f === filtro}
                onClick={() => setFiltro(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="projetos__lista">
          {lista.map((p, i) => {
            const lado = i % 2 === 0 ? 'left' : 'right'

            return (
              <article
                key={p.nome}
                className="projetos__card"
                data-lado={lado}
                data-status={p.status}
              >
                <Blob
                  className="projetos__foto"
                  variante={(i + 2) % 5}
                  foto={p.foto}
                />

                <div className="projetos__corpo">
                  <span className="projetos__status">{p.status}</span>
                  <strong className="projetos__nome">{p.nome}</strong>

                  <p className="projetos__objetivo so-mobile">{p.objetivoCurto}</p>
                  <p className="projetos__objetivo so-desktop">{p.objetivo}</p>

                  <span className="projetos__publico">{p.publico}</span>

                  {p.meta && (
                    <BarraDoFio
                      feito={p.meta[0]}
                      total={p.meta[1]}
                      unidade={p.meta[2]}
                      rotulo={p.nome}
                    />
                  )}

                  <blockquote className="projetos__depoimento">
                    <p>{p.depoimento}</p>
                    <footer>{p.autor}</footer>
                  </blockquote>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
