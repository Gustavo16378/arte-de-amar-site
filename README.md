# Arte de Amar · site da ONG

Site one page da OSC Arte de Amar, de Palmas, Tocantins. Projeto autoral, sem template.

A especificação completa está em [`PROMPT.md`](PROMPT.md); as regras do projeto, em
[`CLAUDE.md`](CLAUDE.md). O design de referência está em
[`design-reference/`](design-reference/) (abra `original-claude-design/*.html` no
navegador para ver rodando).

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # checa os tipos e gera dist/
npm run preview  # serve o dist/ para conferir o build
```

Confira sempre em **390x844** (mobile, que é a versão principal) e **1440x900**
(desktop). Até 1023px vale o layout mobile.

## Stack

React 18 + Vite + TypeScript + Tailwind. GSAP (ScrollTrigger, SplitText,
DrawSVGPlugin, ScrollToPlugin) e Lenis entram a partir da Fase 2. Deploy no
Cloudflare Pages: build `npm run build`, saída `dist/`.

## Estrutura

```
src/
  content/      textos, números, marcos, membros, projetos e o catálogo de fotos
  styles/       tokens, fontes, base, componentes, header, seções, visibilidade
  lib/          paths do fio, paths do coração, máscaras orgânicas
  components/   peças reutilizadas e uma pasta sections/ com as nove seções
scripts/
  gerar-og.mjs  gera public/og-image.jpg a partir da foto do hero
```

As folhas de estilo são importadas em ordem no `main.tsx`: primeiro a base do
Tailwind, depois as nossas camadas. `visibilidade.css` vem por último de
propósito, porque `.so-mobile` e `.so-desktop` precisam ganhar de qualquer
regra de seção que defina `display`.

## Fases

1. **Base** — concluída. Tokens, fontes self-hosted, conteúdo extraído dos
   sources e layout estático de todas as seções em mobile e desktop, sem motion.
2. Navegação: header mobile com esconder/mostrar e inversão de tema, menu em
   portal, índice lateral desktop, botão Doar flutuante, ScrollTo, Lenis.
3. Preloader completo, com cortina e nascimento do fio.
4. O fio: DrawSVG com scrub em todas as seções, continuidade entre elas, o
   coração fechando em Como ajudar, o fio como linha do tempo e como barra de
   progresso.
5. Motions de seção: SplitText, contadores, máscaras, parallax, timeline pinada,
   carrossel, filtro de projetos.
6. Acabamento: WebP, reduced-motion, OG, favicon, acessibilidade, Lighthouse.

## Decisões da Fase 1

Onde o design não fechava sozinho, a escolha foi esta:

- **Mobile e desktop convivem no DOM.** Onde muda só o layout, resolvemos em
  CSS. Onde o *texto* muda (missão/visão/valores, objetivo dos projetos,
  legendas, atuação, nossa história), as duas versões ficam no HTML e
  `.so-mobile` / `.so-desktop` escondem uma. Evita medir a viewport em JS e não
  pisca na primeira pintura. As fotos são as mesmas nas duas versões, então o
  navegador baixa cada arquivo uma vez só.
- **O fio já nasce desenhado.** Na Fase 1 os paths aparecem inteiros, para dar
  para conferir o traçado. A Fase 4 troca isso por DrawSVG com scrub.
- **Índice lateral e botão Doar flutuante começam invisíveis**, como no
  `source.html` do desktop: eles só aparecem depois dos primeiros 40px de
  rolagem, e esse gatilho é da Fase 2.
- **Fio do mobile a 20px da borda.** O `FIO.m` do source do desktop põe o fio a
  x=8% (31px em 390), mas o source do mobile, que é a versão principal, desenha
  a 20px. Usamos o `FIO_M` da prancha, que é x=5%. O `FIO.m` ficou registrado em
  `src/lib/fio-paths.ts` para consulta.
- **Duas fotos estão com o nome trocado** no acervo: `equipe-mural.jpg` contém
  os Big Macs do McDia Feliz e `mcdia-feliz.jpg` contém a equipe diante do
  mural. Não mexemos nos arquivos; a troca está resolvida em
  `src/content/fotos.ts`.
- **Chave PIX.** O `PROMPT.md` pede Switzer com algarismos tabulares, que é bem
  mais larga que a Sentient do source do desktop. No corpo original a chave
  quebrava em duas linhas dentro da coluna, então fechamos o corpo e o tracking
  no desktop até caber numa linha.
- **Sem travessão em texto nenhum**, conforme a regra 5. O `— {nome}` do
  depoimento no source do desktop virou só o nome.
- **Barra do header a 82% de opacidade**, como nos dois `source.html`. O texto
  do briefing fala em 92%; os sources são a fonte da verdade.
- **Botão do menu com 40px de desenho e 44px de toque**, via pseudo-elemento,
  para respeitar o mínimo de acessibilidade sem engordar o círculo.

## Pendências para a ONG

- `src/content/membros.ts` — nomes e retratos da diretoria. Hoje são seis
  placeholders "Nome Sobrenome" com moldura listrada.
- `src/content/site.ts` — os quatro números de impacto (11, 3.197+, 40+, 120+)
  são estimativas do design.
- `src/content/site.ts` — número real do WhatsApp, hoje `5563999999999`.
- `src/content/site.ts` — payload PIX estático (BR Code) do CNPJ, para gerar o
  QR de verdade no lugar do marcador atual.
- `src/content/projetos.ts` — números das metas em andamento.
- `index.html` — trocar `https://SEU-DOMINIO/` pelo domínio real depois do
  deploy (canonical, `og:url` e `og:image`).
- `src/content/fotos.ts` — `triagem-roupas.jpg` e `criancas-comunidade.jpg`
  chegaram em 240x320 e ficam moles quando usadas grandes. Pedir os originais.
- `src/content/site.ts` — crédito do rodapé, hoje "nome do estúdio".
