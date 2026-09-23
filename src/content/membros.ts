/**
 * Diretoria. Copiado de MEMBROS (desktop/source.html).
 *
 * TODO a ONG ainda não mandou os nomes nem os retratos.
 * Manter o placeholder "Nome Sobrenome" e a moldura listrada até lá:
 * trocar `nome` e preencher `foto` com o caminho do retrato em /assets/fotos/.
 *
 * `coluna` e `recuo` são os valores do mural de 12 colunas do desktop.
 * `blob` é o índice da máscara orgânica em BLOBS (0 a 4).
 */

export type Membro = {
  nome: string
  cargo: string
  /** grid-column no mural desktop */
  coluna: string
  /** margin-top no mural desktop, para desalinhar */
  recuo: string
  blob: number
  foto: { src: string; alt: string; largura: number; altura: number } | null
}

export const MEMBROS: Membro[] = [
  { nome: 'Nome Sobrenome', cargo: 'Presidente', coluna: '1 / 4', recuo: '0', blob: 0, foto: null },
  { nome: 'Nome Sobrenome', cargo: 'Vice-presidente', coluna: '5 / 8', recuo: '80px', blob: 1, foto: null },
  { nome: 'Nome Sobrenome', cargo: 'Tesoureira', coluna: '9 / 12', recuo: '24px', blob: 2, foto: null },
  { nome: 'Nome Sobrenome', cargo: 'Secretária', coluna: '2 / 5', recuo: '-40px', blob: 3, foto: null },
  { nome: 'Nome Sobrenome', cargo: 'Diretora de projetos', coluna: '6 / 9', recuo: '10px', blob: 4, foto: null },
  { nome: 'Nome Sobrenome', cargo: 'Conselho fiscal', coluna: '10 / 13', recuo: '64px', blob: 0, foto: null },
]
