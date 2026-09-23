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

React 18 + Vite + TypeScript + Tailwind, GSAP (ScrollTrigger, ScrollToPlugin,
SplitText, DrawSVGPlugin) e Lenis. Deploy no Cloudflare Pages: build
`npm run build`, saída `dist/`.

Os quatro plugins são registrados num ponto só, em `src/lib/gsap.ts`. SplitText
e DrawSVG ainda não são usados: custam 8,4 kB gzip que a Fase 6 pode recuperar
separando o motion abaixo da dobra, se o Lighthouse pedir.

## Estrutura

```
src/
  content/      textos, números, marcos, membros, projetos e o catálogo de fotos
  styles/       tokens, fontes, base, componentes, header, seções, visibilidade
  lib/          gsap e lenis, paths do fio e do coração, máscaras orgânicas
  components/   peças reutilizadas e uma pasta sections/ com as nove seções
  hooks/        direção da rolagem, tema do header, estado da navegação, scroll lock
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
2. **Navegação** — concluída. Header mobile com esconder/mostrar e inversão de
   tema, menu em portal com scroll lock, índice lateral desktop com progresso
   do fio, botão Doar flutuante, ScrollTo e Lenis.
3. **Preloader** — concluído. Coração desenhando com DrawSVG, "Arte de Amar"
   escrito à mão, porcentagem, preenchimento e pulso, cortina e nascimento do
   fio. Só na primeira visita da sessão.
4. **O fio** — concluída. DrawSVG com scrub em todas as seções, continuidade
   entre elas, o coração fechando em Como ajudar, o fio como linha do tempo
   pinada no desktop e como barra de progresso nas campanhas com meta.
5. Motions de seção: SplitText, contadores, máscaras abrindo, parallax,
   carrossel mobile, transição do filtro de projetos.
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
  rolagem. O gatilho entrou na Fase 2.
- **Fio do mobile a 20px da borda.** O `FIO.m` do source do desktop põe o fio a
  x=8% (31px em 390), mas o source do mobile, que é a versão principal, desenha
  a 20px. Usamos o `FIO_M` da prancha, que é x=5%. O `FIO.m` ficou registrado em
  `src/lib/fio-paths.ts` para consulta.
- **Duas fotos chegaram com o nome trocado** no acervo: `equipe-mural.jpg`
  continha os Big Macs do McDia Feliz e `mcdia-feliz.jpg` continha a equipe
  diante do mural. Os dois arquivos foram renomeados, então hoje cada nome bate
  com a foto. Todas as fotos passam por `src/content/fotos.ts`, que guarda
  `src`, `alt` e dimensão de cada uma num lugar só.
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

## Decisões da Fase 2

- **Quem rola é o Lenis, não o `scroll-behavior: smooth`.** A propriedade foi
  removida do `html`: ela briga com o Lenis e com o ScrollTrigger. Sob
  `prefers-reduced-motion` o Lenis nem é criado e o salto instantâneo passa a
  ser o comportamento correto.
- **`irPara()` usa o Lenis quando ele existe e o ScrollToPlugin quando não.**
  O `PROMPT.md` pede ScrollToPlugin nos links, mas com o Lenis ativo o plugin
  escreve direto no `scrollY` e o rAF do Lenis desfaz isso no quadro seguinte.
  O plugin segue registrado e é ele quem anima no caminho sem Lenis.
- **O menu continua montado durante a animação de saída.** A trava de rolagem
  só solta no desmonte, então a navegação é disparada depois, e não no clique:
  rolar com o body ainda em `position: fixed` perderia o destino.
- **Ao destravar, quem devolve a posição é o Lenis.** Com o body fixo o
  documento vai para o topo e o Lenis registra esse zero. Um `window.scrollTo`
  sozinho seria desfeito no quadro seguinte, então `restaurarScroll()` usa
  `lenis.scrollTo(y, { immediate, force })`.
- **A inversão de tema usa um conjunto de seções ativas**, não um booleano por
  seção. Na troca de uma seção escura para outra as duas podem cruzar a linha
  do header no mesmo quadro, e o header não pode piscar de claro no meio.
- **O progresso do fio no índice é escrito direto no elemento**, fora do
  estado do React: muda a cada quadro e não vale um render. Só as chaves
  discretas (seção ativa, topo visível, botão flutuante) passam por estado.
- **`data-dark` marca Números, Nossa atuação, Como ajudar e o rodapé.** O hero
  fica de fora de propósito: ele é escuro, mas o design mostra o header claro
  sobre ele, que é o primeiro enquadramento da página.
- **Durante uma rolagem por clique o header não reage à direção.** Seria
  estranho ele fugir justamente quando o usuário pediu para ir a algum lugar.
  A trava é liberada pelo `onComplete` do Lenis e tem um prazo de validade,
  porque uma rolagem interrompida com o dedo pode nunca chamar o callback.

## Decisões da Fase 3

- **O preloader roda em toda visita**, e não só na primeira da sessão: é
  decisão da ONG, que quer a abertura sempre. O `?nopre` na URL pula a
  abertura, para conferir o resto da página sem esperar quatro segundos a
  cada recarga; é a mesma saída que o source.html de referência tinha.
- **A decisão é tomada no primeiro render**, no inicializador do estado.
  Decidir num efeito deixaria o hero piscar antes da cortina.
- **O primeiro trecho do fio é desenhado sobre a cortina, não no hero.** O fio
  do hero começa no topo da seção, que é a última parte revelada por uma
  cortina que sobe: ninguém veria o nascimento. Preso ao coração, ele desce
  junto e dá a leitura de fio sendo puxado para dentro da página. O fio do
  hero é desenhado até 30% no mesmo intervalo e continua de onde este para.
- **A animação do fio do hero roda fora do `gsap.context` do preloader.** Ela
  pertence ao hero: dentro do contexto, o `revert` do desmonte apagaria o
  traço recém-nascido.
- **Remedimos o ScrollTrigger ao soltar a trava de rolagem.** Com o body em
  `position: fixed` o documento fica com altura de viewport, e todo
  ScrollTrigger medido nesse intervalo fica com o fim em zero: o progresso do
  índice travava em 100% e o `onUpdate` parava de acompanhar a página inteira
  depois do preloader.
- **A cauda que completa o fio do hero até 100% é temporária.** Ela existe para
  o fio não ficar cortado em 30% enquanto a Fase 4 não liga o scrub, e está
  marcada com TODO no `Preloader.tsx`.

## Decisões da Fase 4

- **Um `gsap.matchMedia` por fio.** Os dois paths, mobile e desktop, ficam no
  DOM e a media query esconde um. O matchMedia anima só o visível e refaz a
  conta sozinho quando a largura cruza o breakpoint, sem medir viewport em JS.
- **O hero começa em 30%, não em zero.** É onde o preloader parou, saindo do
  coração. O gatilho dele também é especial (`top top` em vez de
  `top 80%`): com a regra geral, o hero já estaria pela metade no primeiro
  quadro, porque o topo da seção nasce acima da linha de início.
- **A linha do tempo do desktop é gerada, não copiada.** O path depende da
  largura real do trilho, que depende de quantos marcos existem e do tamanho
  da janela. A lógica está em `lib/timeline-path.ts`, portada do `measure()`
  do source do desktop, e é refeita a cada refresh do ScrollTrigger.
- **A altura da seção da linha do tempo é automática.** O `PROMPT.md` sugere
  `450vh`, mas em 1440 isso dá 3150px de rolagem para um percurso de 3352px:
  o fim do trilho ficaria inalcançável. Quem define a altura é o espaçador do
  pin, calculado a partir do percurso real.
- **O índice lateral sai de cena durante a linha do tempo.** Os marcos passam
  por baixo dele e o texto colidia, uma colisão que o source estático nunca
  mostrou porque nunca chegou a rolar. Na seção em que o próprio fio é o
  indicador de progresso, o índice não faz falta.
- **Sem movimento, o desktop usa a história vertical.** A versão pinada
  depende de rolagem para avançar na horizontal: sem ela, metade da linha do
  tempo ficaria inalcançável. A coluna ganha uma largura máxima para não se
  perder numa tela larga.
- **A barra de progresso é um traço do fio de verdade**, desenhado com DrawSVG
  até a fração da meta, e não uma div com largura. Ganha a mesma ponta
  arredondada e o mesmo degradê, agora numa variante horizontal
  (`#fio-grad-h`), porque o degradê diagonal do fio quase não aparecia numa
  faixa de 2px de altura.
- **O fio de Como ajudar é recalculado a partir da caixa do coração na tela.**
  Ele tem que terminar exatamente na fenda, e a fenda muda de lugar com a
  largura da janela. O valor em `fio-paths.ts` é só o ponto de partida.

## Correções depois da Fase 4

Três defeitos que só apareceram com a página rolando de verdade, todos com a
mesma raiz.

- **O fio desenhava rápido demais e de forma irregular.** Na linha do tempo ele
  ia cinco vezes mais rápido que o trilho; nas seções, andava, parava e
  pulava. Causa: o fio vivia num `viewBox` esticado por
  `preserveAspectRatio="none"`, onde a escala horizontal e a vertical são
  diferentes. O DrawSVG mede o path em unidades de tela e aplica uma escala
  média das duas; o `vector-effect="non-scaling-stroke"` calcula o tracejado
  em pixels de tela; e o navegador aplica o resto em unidades do viewBox. As
  três medidas discordavam, e discordavam de forma desigual ao longo do path.

  A saída é a mesma dos source.html: **o espaço do SVG passou a ser pixels
  reais**. O viewBox recebe a caixa da seção e as coordenadas do path são
  convertidas de porcentagem para pixel a cada medição. Com escala 1:1 as
  medidas coincidem, o traço não deforma sem precisar de
  `non-scaling-stroke`, e o desenho fica exato.

- **O GSAP não interpola `stroke-dashoffset`.** Ligado a um scrub ou a um
  tween, o valor saltava do início para o fim e o traço aparecia de uma vez.
  Agora o GSAP anima um número solto e nós escrevemos o `stroke-dashoffset`
  a partir dele, por `tweenDoTraco()` e `aplicarTraco()` em
  `lib/desenho.ts`. Vale para o fio, para a linha do tempo, para o coração,
  para a barra de progresso e para o preloader.

- **O coração fechava antes de o fio chegar nele.** Eles tinham gatilhos
  separados e, como Como ajudar é uma seção alta, o fio levava a seção inteira
  para chegar enquanto o coração fechava logo na entrada. Agora os dois são
  desenhados pelo mesmo ScrollTrigger, em sequência: o fio ocupa os primeiros
  35% do percurso e o coração o resto.

E mais três acertos de leitura:

- **Os marcos acendiam tarde demais.** A ponta do fio era estimada por
  `progresso × largura do trilho`, o que erra porque o path começa e termina
  recuado 20% da janela. Agora a posição vem do próprio path, e o marco acende
  60px antes de a linha chegar nele: a foto já está subindo quando o fio passa.
- **A onda da linha do tempo tinha período fixo de 380px**, sem relação com o
  espaçamento dos marcos, então o fio cruzava o meio em pontos arbitrários e
  os pontinhos ficavam soltos fora da linha. Agora ela cruza o meio exatamente
  em cada marco.
- **O degradê do fio precisa de coordenadas reais.** Em `objectBoundingBox`
  uma linha perfeitamente vertical tem caixa de largura zero, e o navegador
  não desenha nada: era o que sumia com o fio da Nossa história. Cada seção
  tem agora o seu degradê, ao longo da própria altura.
- **O coração de Como ajudar ficava encostado na direita no desktop**
  (`right: 6%` do source), colidindo com o fim do título e caindo em cima da
  terceira coluna. Passou a ser centralizado, como no mobile, atrás do título.

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
