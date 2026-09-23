import type { CSSProperties } from 'react'
import { Blob } from '../Blob'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { MEMBROS } from '../../content/membros'
import { DIRETORIA } from '../../content/site'

/**
 * Diretoria.
 * Mobile: carrossel horizontal com scroll nativo e snap, o segundo card já
 * cortado na borda. Desktop: mural livre de 12 colunas, cada retrato num
 * tamanho e numa altura, com o fio serpenteando entre eles.
 *
 * Os retratos ainda não chegaram: enquanto isso a moldura fica listrada.
 */
export function Diretoria() {
  return (
    <section id="diretoria" className="secao diretoria" data-secao="diretoria">
      <Fio secao="diretoria" />

      <div className="secao__conteudo">
        <div className="diretoria__cabecalho">
          <span className="rotulo">{DIRETORIA.rotulo}</span>
          <h2 className="titulo-secao diretoria__titulo">{comEnfase(DIRETORIA.titulo)}</h2>
        </div>

        <ul className="diretoria__carrossel sem-barra">
          {MEMBROS.map((m, i) => (
            <li
              key={`${m.cargo}-${i}`}
              className="diretoria__card"
              style={
                {
                  '--coluna': m.coluna,
                  '--recuo': m.recuo,
                } as CSSProperties
              }
            >
              {m.foto ? (
                <Blob className="diretoria__retrato" variante={m.blob} foto={m.foto} />
              ) : (
                <Blob className="diretoria__retrato retrato-vazio" variante={m.blob}>
                  <span>
                    retrato
                    <br />
                    {m.cargo}
                  </span>
                </Blob>
              )}
              <strong className="diretoria__nome">{m.nome}</strong>
              <span className="diretoria__cargo">{m.cargo}</span>
            </li>
          ))}
        </ul>

        <span className="diretoria__dica" aria-hidden="true">
          {DIRETORIA.dica}
        </span>
      </div>
    </section>
  )
}
