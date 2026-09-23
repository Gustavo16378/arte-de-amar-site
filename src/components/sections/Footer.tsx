import { Coracao } from '../Coracao'
import { comEnfase } from '../Titulo'
import { FOOTER, SITE } from '../../content/site'

/**
 * Rodapé. A foto do mural sangra atrás de um véu verde profundo. O fio já
 * terminou no coração: aqui é só o respiro depois da chegada.
 */
export function Footer() {
  const ano = new Date().getFullYear()

  return (
    <footer className="rodape secao-escura" data-secao="como-ajudar" data-fundo="escuro">
      <img
        className="rodape__foto"
        src={FOOTER.foto.src}
        alt={FOOTER.foto.alt}
        width={FOOTER.foto.largura}
        height={FOOTER.foto.altura}
        loading="lazy"
        decoding="async"
      />
      <div className="rodape__veu" aria-hidden="true" />

      <div className="rodape__conteudo">
        <div className="rodape__topo">
          <div>
            <div className="rodape__marca">
              <Coracao largura={34} />
              <span>{SITE.nome}</span>
            </div>
            <p className="rodape__frase">{comEnfase(FOOTER.frase)}</p>
          </div>

          <div className="rodape__links">
            <a href={SITE.instagramUrl} target="_blank" rel="noopener noreferrer">
              {SITE.instagram}
            </a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <span>
              {SITE.cidade} · {SITE.estado}
            </span>
          </div>
        </div>

        <div className="rodape__credito">
          <span>
            © {ano} {SITE.nomeCompleto}
          </span>
          <span>CNPJ {SITE.cnpj}</span>
        </div>
      </div>
    </footer>
  )
}
