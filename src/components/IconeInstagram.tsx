/**
 * A marca do Instagram, desenhada aqui.
 *
 * O pedido era usar o ícone do lucide-react, mas a versão 1 do pacote tirou
 * os ícones de marca: `Instagram` não existe mais lá. Como é um glifo
 * simples, ele fica inline, no mesmo espírito do resto do site, que não usa
 * biblioteca de ícone. O Lucide segue no header, para o hambúrguer.
 */
export function IconeInstagram({ tamanho = 18 }: { tamanho?: number }) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}
