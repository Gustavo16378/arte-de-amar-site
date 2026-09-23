import { useEffect, useRef, useState } from 'react'
import { Botao } from '../Botao'
import { CoracaoDoFio } from '../CoracaoDoFio'
import { Fio } from '../Fio'
import { comEnfase } from '../Titulo'
import { AJUDAR, SITE } from '../../content/site'

/**
 * Como ajudar. O fio chega ao centro, curva e termina na fenda superior do
 * coração, que se fecha atrás do título (Fase 4).
 *
 * Três blocos: PIX, formulário de voluntário e contato de parceiro. No mobile
 * eles se empilham separados por linhas finas; no desktop viram três colunas.
 */
export function ComoAjudar() {
  const [copiada, setCopiada] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const timer = useRef<number>()

  useEffect(() => () => window.clearTimeout(timer.current), [])

  async function copiarPix() {
    try {
      await navigator.clipboard.writeText(SITE.cnpj)
    } catch {
      /* sem permissão de área de transferência: a chave segue visível na tela */
    }
    setCopiada(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setCopiada(false), 2400)
  }

  return (
    <section
      id="como-ajudar"
      className="secao secao-escura ajudar calha"
      data-secao="como-ajudar"
      data-dark=""
    >
      {/* quem desenha este fio é o CoracaoDoFio, em sequência com o coração */}
      <Fio secao="ajudar" cor="menta" externo />
      <CoracaoDoFio />

      <div className="secao__conteudo">
        <span className="rotulo">{AJUDAR.rotulo}</span>
        <h2 className="ajudar__titulo">{comEnfase(AJUDAR.titulo)}</h2>
      </div>

      <div className="ajudar__blocos">
        {/* ---------------------------------------------------------- PIX */}
        <div className="ajudar__bloco ajudar__bloco--doar">
          <span className="rotulo-simples ajudar__doar-rotulo">{AJUDAR.doar.rotulo}</span>
          <p className="ajudar__doar-texto">{AJUDAR.doar.texto}</p>

          <span className="rotulo-simples ajudar__pix-rotulo">{AJUDAR.doar.pixRotulo}</span>
          <span className="ajudar__pix-chave">{SITE.cnpj}</span>

          <Botao
            aparencia="menta"
            largo
            comCoracao
            className="ajudar__pix-botao"
            onClick={copiarPix}
          >
            {copiada ? AJUDAR.doar.botaoCopiado : AJUDAR.doar.botao}
          </Botao>
          <span className="sr-only" role="status">
            {copiada ? 'Chave PIX copiada' : ''}
          </span>

          <div className="ajudar__qr">
            <div className="ajudar__qr-quadro">
              {/* TODO gerar o QR de verdade quando tivermos o payload PIX do CNPJ */}
              <div className="ajudar__qr-falso" aria-hidden="true">
                <span>
                  QR Code
                  <br />
                  PIX
                </span>
              </div>
            </div>
            <span className="ajudar__qr-legenda so-mobile">{AJUDAR.doar.qrLegenda}</span>
            <span className="ajudar__qr-legenda so-desktop">
              {AJUDAR.doar.qrLegendaDesktop}
            </span>
          </div>
        </div>

        {/* --------------------------------------------------- VOLUNTÁRIO */}
        <form
          className="ajudar__bloco ajudar__bloco--voluntario"
          onSubmit={(e) => {
            e.preventDefault()
            // TODO sem backend nesta fase: a Fase 6 liga num mailto ou no WhatsApp
            setEnviado(true)
          }}
        >
          <span className="rotulo-simples">{AJUDAR.voluntario.rotulo}</span>
          <p className="ajudar__doar-texto">{AJUDAR.voluntario.texto}</p>

          {enviado ? (
            <p className="ajudar__sucesso">{AJUDAR.voluntario.sucesso}</p>
          ) : (
            <>
              <div className="ajudar__campos">
                {AJUDAR.voluntario.campos.map((c) => (
                  <label key={c.nome} className="ajudar__campo">
                    {c.tipo === 'textarea' ? (
                      <textarea name={c.nome} rows={2} placeholder=" " />
                    ) : (
                      <input name={c.nome} type={c.tipo} placeholder=" " required />
                    )}
                    <span className="ajudar__campo-label">{c.label}</span>
                  </label>
                ))}
              </div>

              <Botao aparencia="contorno" largo type="submit" className="ajudar__enviar">
                {AJUDAR.voluntario.botao}
              </Botao>
            </>
          )}
        </form>

        {/* ------------------------------------------------------ PARCEIRO */}
        <div className="ajudar__bloco ajudar__bloco--parceiro">
          <span className="rotulo-simples">{AJUDAR.parceiro.rotulo}</span>
          <p className="ajudar__parceiro-texto so-mobile">{AJUDAR.parceiro.textoMobile}</p>
          <p className="ajudar__parceiro-texto so-desktop">{AJUDAR.parceiro.textoDesktop}</p>

          <Botao
            href={SITE.whatsapp}
            aparencia="creme"
            largo
            comCoracao
            className="ajudar__parceiro-botao"
          >
            {AJUDAR.parceiro.botao}
          </Botao>
        </div>
      </div>
    </section>
  )
}
