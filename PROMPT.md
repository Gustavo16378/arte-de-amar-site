# PROMPT: implementar o site da ONG Arte de Amar

Você vai implementar um site one page autoral a partir de um design pronto e aprovado. Não é para redesenhar nada. É para transformar os arquivos de referência em um site React de produção, com toda a motion que o design descreve mas não executa.

Leia este arquivo inteiro antes de começar. Depois leia `CLAUDE.md`. Depois abra os três `source.html` em `design-reference/` e leia o CSS e o JS de cada um. Eles contêm os valores exatos de tudo: cores, paddings, tamanhos, `border-radius` das máscaras, os paths SVG do fio e do coração, os textos, e notas de motion em comentários.

---

## 1. O que é o site

Site institucional da ONG Arte de Amar, organização comunitária de Palmas, Tocantins, fundada em 2015, que atua com crianças em vulnerabilidade através de campanhas (Volta às Aulas, Natal Solidário, Dia das Crianças, Ação de Páscoa, McDia Feliz com o Hospital de Amor, SOS Rio Grande do Sul).

Objetivo: emocionar e converter em doação via PIX ou voluntariado. Público majoritariamente em celular, muitos com aparelho simples. **Mobile é a versão principal.** O desktop é a versão expandida.

Conceito visual: o logo é um coração formado por pessoas se abraçando. O site traduz isso em **um fio contínuo**, uma única linha verde que nasce no preloader, atravessa a página inteira mudando de comportamento a cada seção, e se fecha em coração na seção de doação. O fio é a assinatura do site. Tudo gira em torno dele.

---

## 2. Arquivos de referência e como usar cada um

### `design-reference/mobile/source.html` (principal)
Página mobile completa em 390x844, dividida em `<section data-msec="...">`: `hero`, `numeros`, `quem`, `historia`, `diretoria`, `atuacao`, `projetos`, `ajudar`, `footer`. Também contém o preloader em três estados, o header nos dois estados (claro e escuro) e o menu aberto. Cada seção tem ao lado uma nota "Motion:" descrevendo estado inicial, estado final, easing e duração. Essas notas são a especificação das animações.

No JS do arquivo há um objeto com os paths do fio por seção (comentários "hero: reto com respiro", "números: serpentina entre os números" etc.) e `HEART_MAIN`, o path do coração que o fio fecha no fim.

### `design-reference/desktop/source.html`
Página desktop em 1440. Mesma ordem de seções, layout expandido. Contém as constantes `FIO` (paths por seção, com variantes `d` desktop e `m` mobile), `BLOBS` (as cinco máscaras orgânicas em `border-radius`), `NAV`, `MARCOS` (linha do tempo), `MEMBROS` (diretoria) e `PROJ` (projetos). Também tem a lógica de referência de: seção ativa no índice lateral, parallax do hero, parallax dos números e a timeline pinada. Use como base de comportamento, mas reescreva em GSAP.

### `design-reference/prancha-do-fio/source.html`
A prancha "O caminho do fio": mostra, seção a seção, por onde o fio passa em desktop e mobile, com dez pontos numerados e a descrição de cada trecho. É o mapa para implementar os ScrollTriggers. Contém também o guia de estilo (paleta, tipografia, escala, máscaras).

### `design-reference/original-claude-design/`
Os três exports originais. Abra no navegador para ver o design rodando e comparar com o que você está construindo. Não copie código deles diretamente, eles têm um runtime próprio.

---

## 3. Stack e estrutura

```
src/
  main.tsx
  App.tsx
  styles/
    tokens.css        (variáveis de cor, fontes, easings)
    fonts.css         (@font-face de Sentient e Switzer, self-hosted)
    global.css
  content/
    site.ts           (textos institucionais, números, PIX, redes)
    marcos.ts         (linha do tempo, copiar de MARCOS do desktop)
    membros.ts        (diretoria, copiar de MEMBROS, manter placeholder)
    projetos.ts       (copiar de PROJ)
  hooks/
    useScrollDirection.ts
    useReducedMotion.ts
    useIsMobile.ts
  lib/
    gsap.ts           (registerPlugin de ScrollTrigger, SplitText, DrawSVGPlugin, ScrollToPlugin)
    lenis.ts
    fio-paths.ts      (paths do fio por seção, desktop e mobile, copiados do FIO do desktop e do mobile)
    heart-path.ts     (HEART_MAIN + os 5 paths de coracao-stroke.svg)
  components/
    Preloader/
    Header/           (header fixo mobile + índice lateral desktop + menu portal)
    Fio/              (o SVG do fio, um por seção, com ScrollTrigger)
    Blob/             (imagem com máscara orgânica, prop de variante 0-4)
    Botao/
    sections/
      Hero/
      Numeros/
      QuemSomos/
      Historia/       (timeline: pinada horizontal no desktop, vertical no mobile)
      Diretoria/      (grid mural no desktop, carrossel horizontal nativo no mobile)
      Atuacao/
      Projetos/       (com filtro e barra de progresso feita com o fio)
      ComoAjudar/     (PIX, formulário voluntário, WhatsApp parceiro, coração fechando)
      Footer/
public/
  assets/fotos/       (já populado)
  assets/logo/        (já populado)
  assets/fontes/      (já populado)
  og-image.jpg        (gerar: 1200x630 com a foto do hero e o logo)
  favicon.svg         (coracao-fill em verde profundo sobre creme)
```

Tailwind é usado para layout e utilitários. Cores, fontes e easings vêm de `tokens.css` como CSS variables e são expostas no `tailwind.config`. Nada de valores mágicos espalhados.

Instale: `gsap` (com os plugins, hoje todos gratuitos), `lenis`, `sharp` (dev, para gerar WebP no build via script), `vite-plugin-image-optimizer` ou equivalente.

---

## 4. Tokens

```
--creme: #F6F2EA
--tinta: #1C1F1D
--verde-profundo: #0B2E22
--esmeralda: #1FA86B
--menta: #6FE3B0
--neutro: #D9D2C3
--terracota: #E08A5B
--ease-out: cubic-bezier(.2,.8,.2,1)
--font-display: 'Sentient'
--font-body: 'Switzer'
```

Sentient: pesos 300 e 400, normal e itálico. Switzer: 400 e 500. Os woff2 estão em `public/assets/fontes/`. `font-display: swap`. Preload do Sentient 300 e Switzer 400 no `<head>`.

Assinatura tipográfica: em todo título, uma ou duas palavras em `<em>` com Sentient itálico e cor menta (em fundo escuro) ou esmeralda (em fundo claro). Exemplos que já estão no design: "A arte de *amar* é feita de pessoas", "Faça parte dessa *corrente do bem*", "Gente que se junta e vira *coração*".

Máscaras orgânicas (`BLOBS`): cinco valores de `border-radius` com oito raios. Copie do desktop. O componente `Blob` recebe `variant` (0 a 4) e aplica. No hover (desktop) a máscara transiciona para `border-radius: 16px` em 0.6s com o ease padrão, e a imagem faz `scale(1.04)`.

---

## 5. O fio (parte mais importante)

Implementação:
- Cada seção tem seu próprio `<svg>` absoluto cobrindo a seção inteira (`viewBox="0 0 100 100"`, `preserveAspectRatio="none"`), com UM `<path>` do fio. Os paths estão em `fio-paths.ts`, copiados do `FIO.d` (desktop) e `FIO.m` (mobile) do arquivo desktop, e do objeto equivalente no mobile. Compare os dois e use o do mobile para mobile.
- `stroke-width`: 2px desktop, 1.5px mobile. Como o viewBox é esticado, use `vector-effect="non-scaling-stroke"` para o traço não deformar.
- Cor: gradiente vertical menta para esmeralda (`id="fio-grad"` no desktop). Em seções escuras, menta. Em seções claras, esmeralda.
- Desenho: `DrawSVGPlugin` de 0% a 100% com `scrollTrigger: { trigger: seção, start: 'top 80%', end: 'bottom 20%', scrub: 0.6 }`. Sem `stroke-dasharray` fixo, sem fragmentos.
- Continuidade visual: o fim do path de uma seção deve coincidir com o início do path da seguinte (mesmo x em % da largura). Os paths do design já foram feitos assim. Se em alguma seção não bater, ajuste o ponto inicial do path seguinte, nunca o final do anterior.
- z-index: o fio fica atrás dos títulos e das fotos (z-index 0), e as fotos com Blob ficam acima (z-index 1). Em Quem somos e Diretoria o fio deve visivelmente "entrar" atrás das fotos.

Caminho (da prancha, dez pontos):
1. Nasce no preloader: o coração pulsa em menta e, enquanto a cortina sobe, o fio desce dele para dentro do hero.
2. Hero: desce pela esquerda, passa por trás do título, corre sob os botões e sai pela base.
3. Números: entra na faixa verde profundo, serpenteia entre os números, contorna "crianças atendidas".
4. Quem somos: passa atrás do título da coluna esquerda e entra atrás da foto com legenda.
5. Nossa história: no desktop, a seção é pinada e o fio é a linha do tempo horizontal, avançando com o scroll e acendendo cada marco. No mobile, desce reto pela esquerda e os marcos acendem conforme ele passa.
6. Diretoria: serpenteia entre os retratos (desktop). No mobile, linha horizontal atrás do carrossel.
7. Nossa atuação: única vez que corre reto na horizontal, como divisor.
8. Projetos: zigue-zague acompanhando o alinhamento alternado dos cards. Nas campanhas com meta, uma cópia do fio é a barra de progresso.
9. Como ajudar: entra ao centro, curva e termina exatamente na fenda superior do coração.
10. Fecha o coração: usa os 5 paths de `coracao-stroke.svg` (ou `HEART_MAIN` do mobile). Ordem de desenho: lóbulo esquerdo, lóbulo direito, base em V, figura de cima, figura de baixo. Termina de fechar quando o título "Faça parte dessa corrente do bem" aparece por completo.

---

## 6. Preloader

Só na primeira visita da sessão (`sessionStorage`). Com `prefers-reduced-motion`, vira fade de 0.4s.

Desktop e mobile seguem o mesmo roteiro (o mobile source tem os três estados):
- Fundo verde profundo. Topo: "PALMAS, TOCANTINS" em Switzer 500, 11px, tracking 0.2em, creme 60%. Rodapé direito: porcentagem.
- Coração em contorno (`coracao-stroke.svg`), 60% da largura no mobile, 40% da altura no desktop, centralizado, menta. Desenha com DrawSVG de 0 a 100 em 1.4s, `power2.inOut`, na ordem: lóbulos, base, figuras.
- Abaixo, "Arte de Amar" em Sentient 300, 44px mobile / 88px desktop, creme. Efeito de escrita à mão: texto com `-webkit-text-stroke` em creme e `clip-path: inset(0 100% 0 0)` indo a `inset(0 0 0 0)` em 1.2s, começando em 0.4s; preenchimento entra em 1.3s.
- Porcentagem sobe de 0 a 100 sincronizada.
- Final: coração preenche em menta (`fill` animado) e pulsa uma vez (`scale 1 → 1.15 → 1`, 0.6s). Depois a tela sobe em cortina (`yPercent: -100`, 1s, `power4.inOut`) e, durante a subida, o fio do hero nasce do ponto onde o coração estava e se desenha até 30%. Só então o hero anima.

---

## 7. Header e navegação

### Mobile (390 a 1023px)
- Barra fixa, 64px, fundo creme com `backdrop-filter: blur(12px)` e 92% de opacidade, borda inferior 1px neutro. Esquerda: `coracao-fill` 24px em esmeralda + "Arte de Amar" em Sentient 400, 18px. Direita: botão "Doar" pill (verde profundo, texto creme, 36px de altura) + botão circular 40px com `coracao-stroke` que abre o menu.
- Comportamento: some deslizando para cima ao rolar para baixo, volta ao rolar para cima (hook `useScrollDirection`, threshold 8px). Quando a seção sob o header tem `data-dark`, o header inverte: fundo verde profundo 92%, texto creme, coração menta. Detectar com IntersectionObserver ou ScrollTrigger `onToggle`.
- Menu: portal no body, full-screen verde profundo, itens em Sentient 400, 40px, creme, precedidos por um traço do fio (24px) em menta. Entram em stagger 0.06s de baixo para cima. Rodapé do menu: "Palmas, Tocantins, desde 2015" + links de redes. Botão fechar: X que faz morph para o coração (dois paths, `morphSVG` se disponível, ou crossfade). Scroll lock com `position: fixed` no body e restauração do `scrollY`. Ao tocar em um item, fecha o menu e faz `ScrollToPlugin` até a seção com offset do header.

### Desktop (1024px+)
- Estado inicial: marca no canto superior esquerdo e botão "Doar" no canto superior direito, ambos somem com fade ao começar a rolar.
- Índice lateral fixo à esquerda, centralizado verticalmente, largura reservada de 200px em todas as seções (`padL` no desktop source). Itens em Switzer 500, 11px, caixa alta, tracking 0.18em. Ao lado, um trecho vertical do fio que se preenche conforme o progresso da página. Item ativo em esmeralda (ou menta em seção escura), demais em neutro. Hover: `translateX(4px)`. Clique: ScrollTo suave.
- Botão "Doar" fixo no canto inferior direito, aparece depois do hero, some ao entrar em Como ajudar.

Nunca hamburger de três linhas. Nunca barra com links à direita no desktop.

---

## 8. Seções (mobile primeiro, depois desktop)

Para cada seção, o layout exato está no `source.html`. Aqui vai o que anima.

### Hero
Foto `hero-menino-mochila.jpg` full-bleed, 100vh (`100svh` no mobile). Mobile: gradiente escuro só no terço inferior, título Sentient 300 48px sobreposto embaixo. Desktop: foto com Blob à direita, margem creme à esquerda com o título em 96px.
Motion: foto `scale 1.08 → 1` em 1.6s. Título por SplitText linhas, cada linha sobe de trás de uma máscara (`yPercent: 110 → 0`, stagger 0.12, `power3.out`). Subtítulo fade + `y: 16 → 0`. Botões por último. Parallax leve no scroll: foto `yPercent: 10`, título `yPercent: -20`. Indicador "role" com traço que estica e encolhe em loop.

### Números
Faixa verde profundo. Quatro números em Sentient 300: mobile 112px em coluna desalinhada (esquerda, direita, esquerda, centro); desktop grade 2x2 com todos do mesmo tamanho (mín. 160px), sem sobreposição, margem esquerda de 200px. Legenda em Switzer 500 11px caixa alta com traço verde antes.
Motion: contador de 0 ao valor com `snap` e `power2.out`, 1.6s, ao entrar 70% na viewport. Fio desenha com scrub. Parallax mínimo em velocidades diferentes por número.

### Quem somos
Creme. Label, título com `<em>`, parágrafo. Foto Blob com legenda manuscrita em Sentient itálico ("Ação de Páscoa, 2025"). Missão, visão e valores como três linhas curtas separadas por traços do fio.
Motion: título e parágrafo em reveal por linha. Foto entra com a máscara abrindo (`scale 0.6 → 1` com `clip-path` ou `border-radius` animado). Legenda entra 0.3s depois.

### Nossa história
Dados em `marcos.ts` (sete marcos: 2015, 2016, 2017, 2022, 2024, 2025, Hoje).
**Desktop:** seção com `height: 450vh`, conteúdo pinado (`pin: true`, `scrub: 1`). O fio é a linha do tempo horizontal e avança com o scroll. Marcos alternam acima e abaixo do fio, cada um com ano em Sentient 72px esmeralda, título, frase e uma foto Blob. Cada marco acende (opacidade 0.3 → 1, foto abre) quando o fio o alcança. No fim, o fio curva e desce, o pin solta.
**Mobile:** vertical, sem pin. Fio reto descendo pela esquerda a 20px. Marcos alternam: ano à esquerda com foto sangrando à direita, depois foto full-width com ano sobreposto. Entre marcos, faixa de respiro com só o fio. Cada ponto do fio acende ao passar (círculo 8px menta com `scale 0 → 1`).

### Diretoria
Dados em `membros.ts` (placeholder "Nome Sobrenome" até a ONG mandar).
**Desktop:** grid mural livre de 12 colunas, retratos Blob de tamanhos diferentes e desalinhados (os valores de `grid-column` e `margin-top` estão em `MEMBROS`). Fio serpenteia entre eles.
**Mobile:** carrossel horizontal com scroll nativo (`overflow-x: auto`, `scroll-snap-type: x mandatory`), cards de 260px, último card parcialmente visível na borda. Fio horizontal atrás.
Motion: cards em stagger 0.1 com máscara abrindo e `rotate: 2deg → 0`. Hover desktop: zoom sutil e sublinhado do nome que se desenha.

### Nossa atuação
Verde profundo. Três frases grandes em Sentient com uma palavra em `<em>` menta cada. Fio reto horizontal como divisor.
Motion: frases em reveal por linha, stagger 0.15. O `<em>` entra 0.2s depois da linha com leve `x: -8 → 0`.

### Projetos
Dados em `projetos.ts` (seis projetos, dois em andamento com `meta`).
Filtro em texto (Todos / Em andamento / Concluídos), item ativo com traço do fio embaixo que desliza entre os itens (`Flip` ou transição de `left`/`width`).
Cards: foto Blob full-width no mobile, alternando deslocamento esquerda/direita. Desktop: zigue-zague, foto de um lado e texto do outro, alternando. Tag de status: "Em andamento" esmeralda, "Concluído" neutro. Barra de progresso: uma cópia curta do fio que desenha de 0 até `meta[0]/meta[1]`, com texto "112 de 150 crianças". Depoimento em Sentient itálico com nome e ano.
Motion: cada card entra do lado para onde a foto sangra (`x: ±40 → 0`, fade). Troca de filtro: cards saem com fade 0.2s, reentram em stagger.

### Como ajudar
Verde profundo, mín. 100vh. O fio chega e fecha o coração (60% da largura mobile, ~40% da altura desktop) atrás do título em Sentient 44px / 88px.
Bloco PIX em destaque: label "CHAVE PIX · CNPJ", chave `40.019.106/0001-51` em Switzer 500 com `font-variant-numeric: tabular-nums`, botão "Copiar chave PIX" full-width no mobile (menta, texto verde profundo). Ao copiar (`navigator.clipboard`), texto vira "Copiada" por 2s e o coração do botão pulsa. QR Code em creme sobre o fundo escuro (gerar com `qrcode` lib a partir do payload PIX estático do CNPJ; se não tiver o payload, deixar placeholder e `// TODO`).
Ser voluntário: campos nome, WhatsApp, "como você gostaria de ajudar?", só linha inferior, label sobe ao focar. Botão "Quero ser voluntário" outline menta. Envio: por enquanto `mailto:` ou link de WhatsApp com o texto preenchido, sem backend.
Ser parceiro: texto curto + botão "Falar no WhatsApp" (creme, texto verde profundo) com `https://wa.me/55...` (placeholder, `// TODO número da ONG`).
Motion: coração desenha com scrub e termina junto com o reveal do título. Blocos entram em stagger 0.12.

### Footer
Foto `equipe-mural.jpg` (ou a que estiver no source) full-bleed com overlay verde profundo 80%. Logo em creme, "Desde 2015 espalhando *muito amor*.", links de redes em texto (@ongartedeamar, WhatsApp, Palmas · Tocantins), linha fina, crédito minúsculo "© 2026 OSC Arte de Amar · CNPJ 40.019.106/0001-51".
Motion: foto com parallax `yPercent: -10`, textos em fade.

---

## 9. Performance e acabamento

- Gerar WebP de todas as fotos no build (script com `sharp`), servir com `<picture>` e fallback JPG. Hero com `fetchpriority="high"` e `preload`.
- Todas as imagens com `width` e `height` para evitar layout shift.
- Lenis com `lerp: 0.1`, integrado ao `ScrollTrigger.update` via `gsap.ticker`. Desabilitar Lenis em `prefers-reduced-motion`.
- `ScrollTrigger.refresh()` após carregar fontes (`document.fonts.ready`) e após imagens do hero.
- `useReducedMotion`: quando ativo, pular preloader, setar todos os fios em `drawSVG: '100%'`, e substituir todas as timelines por `gsap.set` finais.
- `100svh` no hero mobile. `viewport-fit=cover` e `env(safe-area-inset-*)` no header e no botão flutuante.
- `<head>`: title "Arte de Amar · ONG em Palmas, Tocantins", description, OG e Twitter Card completos, `og:image` em `/og-image.jpg` (1200x630, gerar no build ou manualmente com a foto do hero + logo), canonical com placeholder `https://SEU-DOMINIO/`.
- Favicon SVG: `coracao-fill` em verde profundo.
- Lighthouse mobile alvo: Performance 90+, Accessibility 95+.
- Testar em 390x844 (mobile) e 1440x900 (desktop). Também 768 (tablet) só para garantir que nada quebra; usar o layout mobile até 1023px.

---

## 10. Entregáveis por fase

Trabalhe em fases e commite ao fim de cada uma. Antes de cada fase, diga em uma linha o que vai fazer. Ao fim, rode `npm run build` e abra em 390 e 1440 para conferir.

1. **Base:** Vite + React + TS + Tailwind, tokens, fontes self-hosted, `content/*.ts` preenchidos a partir dos sources, layout estático de todas as seções em mobile e desktop, sem motion. Deve ficar visualmente igual aos `source.html`.
2. **Navegação:** header mobile com esconder/mostrar e inversão de tema, menu portal, índice lateral desktop, botão Doar flutuante, ScrollTo, Lenis.
3. **Preloader** completo com cortina e nascimento do fio.
4. **Fio:** todos os `<svg>` por seção, DrawSVG com scrub, continuidade entre seções, coração fechando em Como ajudar, fio como linha do tempo e como barra de progresso.
5. **Motions de seção:** SplitText, contadores, máscaras abrindo, parallax, timeline pinada no desktop, carrossel mobile, filtro de projetos.
6. **Acabamento:** WebP, reduced-motion, OG, favicon, acessibilidade, Lighthouse, README com instruções de deploy no Cloudflare Pages e lista de `// TODO` para a ONG preencher (nomes da diretoria, números reais, WhatsApp, payload PIX).

Se algo no design for tecnicamente inviável ou ruim em celular fraco, não simplifique em silêncio: implemente a versão mais próxima possível e registre a decisão no README.
