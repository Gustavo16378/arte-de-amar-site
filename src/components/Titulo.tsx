import { Fragment, type ReactNode } from 'react'

/**
 * Converte a marcação |palavra| dos arquivos de conteúdo em <em>, que é a
 * assinatura tipográfica do projeto: Sentient itálico, menta no escuro e
 * esmeralda no claro (a cor vem do CSS, não daqui).
 */
export function comEnfase(texto: string): ReactNode[] {
  return texto.split('|').map((trecho, i) =>
    i % 2 === 1 ? (
      <em key={i}>{trecho}</em>
    ) : (
      <Fragment key={i}>{trecho}</Fragment>
    ),
  )
}
