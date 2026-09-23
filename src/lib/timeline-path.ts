/**
 * O caminho do fio na linha do tempo pinada do desktop.
 *
 * Aqui o fio não é um path fixo em porcentagem como nas outras seções: ele
 * precisa ter a largura real do trilho, que depende de quantos marcos existem
 * e do tamanho da janela. Por isso é gerado, e não copiado.
 *
 * A lógica vem do `measure()` de design-reference/desktop/source.html: entra
 * a 20% da largura da janela, dobra para a horizontal no meio da altura,
 * ondula de 380 em 380 alternando acima e abaixo da linha, e no fim dobra
 * para baixo a 20% da borda direita.
 *
 * O y=50 do viewBox é a linha do meio; 41 e 59 são as barrigas da onda.
 */
export function caminhoDaLinhaDoTempo(larguraTrilho: number, larguraJanela: number) {
  const x0 = larguraJanela * 0.2
  const x1 = larguraTrilho - larguraJanela * 0.2

  // desce da vertical e dobra para a horizontal
  let d = `M${x0} 0 C${x0} 25 ${x0 + 40} 40 ${x0 + 120} 50`

  let x = x0 + 120
  let acima = true
  while (x + 380 < x1 - 160) {
    const proximo = x + 380
    const barriga = acima ? 41 : 59
    d += ` C${x + 130} ${barriga} ${proximo - 130} ${barriga} ${proximo} 50`
    x = proximo
    acima = !acima
  }

  // dobra de novo e desce, entregando o fio à Diretoria
  d += ` C${x1 - 40} 50 ${x1} 72 ${x1} 100`
  return d
}

/**
 * Quanto o trilho anda na horizontal, e quanto de rolagem isso custa.
 * O fator 1.15 é o do source: dá um respiro a mais no fim do trajeto.
 */
export function medidasDaLinhaDoTempo(larguraTrilho: number, larguraJanela: number) {
  const percurso = Math.max(0, larguraTrilho - larguraJanela)
  return { percurso, rolagem: percurso * 1.15 }
}
