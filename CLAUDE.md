# Arte de Amar — regras do projeto

Site one page da ONG Arte de Amar (Palmas, Tocantins). Projeto autoral, sem template.
Leia `PROMPT.md` antes de escrever qualquer código. Ele é a especificação completa.

## Stack (não mudar)
- React 18 + Vite + TypeScript + Tailwind CSS
- GSAP (ScrollTrigger, SplitText, DrawSVGPlugin, ScrollToPlugin) para toda a motion
- Lenis para scroll suave
- Deploy: Cloudflare Pages (build `vite build`, output `dist/`)
- Sem backend nesta fase. Conteúdo em `src/content/*.ts`.

## Referências de design (fonte da verdade)
- `design-reference/desktop/source.html` — versão desktop (HTML + CSS + JS exportados do Claude Design)
- `design-reference/mobile/source.html` — versão mobile, que é a versão principal
- `design-reference/prancha-do-fio/source.html` — prancha com o caminho do fio, guia de estilo e notas de motion
- `design-reference/original-claude-design/*.html` — exports originais, abrir no navegador para ver rodando
- `design-reference/fonts/` — Sentient e Switzer

Quando o desktop e o mobile divergirem, o mobile manda. Quando algo não estiver claro, abra o `source.html` correspondente e copie o valor exato (cor, tamanho, padding, path SVG) em vez de inventar.

## Assets
- `public/assets/fotos/` — fotos reais da ONG, já com os nomes que o design referencia
- `public/assets/logo/coracao-stroke.svg` — o coração do logo em contorno (5 paths, `stroke="currentColor"`). É o que o fio desenha no final.
- `public/assets/logo/coracao-fill.svg` — o coração sólido (`fill="currentColor"`), para botões, favicon, menu
- `public/assets/logo/logo-osc-arte-de-amar.svg` — logo completo com texto
- `public/assets/fontes/*.woff2` — fontes auto-hospedadas

## Regras inegociáveis
1. Nada de template, nada de componente de biblioteca de UI, nada de ícone de biblioteca (sem Lucide, sem Font Awesome). Ícones, quando existirem, são SVG inline desenhados no projeto.
2. Fontes: Sentient (display) e Switzer (corpo). Nunca Inter, Roboto, Poppins ou fonte de sistema como principal.
3. Paleta fixa: creme `#F6F2EA`, tinta `#1C1F1D`, verde profundo `#0B2E22`, esmeralda `#1FA86B`, menta `#6FE3B0`, neutro quente `#D9D2C3`, terracota `#E08A5B` (raríssimo). Nunca branco puro, nunca preto puro.
4. O fio é UM path SVG contínuo por seção, sem `stroke-dasharray` visível, desenhado com DrawSVG ou `stroke-dashoffset` controlado por ScrollTrigger. Nunca fragmentos soltos.
5. Sem travessão (—) em nenhum texto do site. Usar vírgula, ponto ou dois pontos.
6. Transições CSS sempre com propriedades explícitas (`transition: transform .4s, opacity .4s`). Nunca `transition: all`. Nunca `overflow: hidden` no body ou html para travar scroll.
7. `prefers-reduced-motion`: tudo vira fade simples, o fio aparece já desenhado, o preloader vira um fade.
8. Imagens sempre com `loading="lazy"` (exceto hero), `width`/`height` declarados, e versões WebP geradas no build. Nunca vídeo hospedado.
9. OG tags, Twitter Card, `og:image` 1200x630 e canonical configurados desde o primeiro commit, com placeholder `https://SEU-DOMINIO/` para trocar depois do deploy.
10. Acessibilidade mínima: áreas de toque de 44px, contraste AA nos textos, foco visível, `aria-label` nos botões só de ícone.

## Padrão de navbar mobile (padrão do time, reutilizar)
- Hook `useScrollDirection` (esconde ao rolar para baixo, mostra ao rolar para cima, threshold de 8px)
- Menu mobile via `ReactDOM.createPortal` no `document.body`
- Scroll lock no iOS com `position: fixed` no body + restauração do `scrollY` ao fechar
- Transições explícitas, nunca `transition-all`, nunca `overflow: hidden` para travar

## Conteúdo
Todo texto vem de `src/content/`. Os textos do design são placeholders razoáveis, mas:
- `MEMBROS` está com "Nome Sobrenome". Manter placeholder até a ONG mandar nomes e fotos.
- Números de impacto (11, 3.197+, 40+, 120+) são estimativas do design. Marcar com `// TODO confirmar com a ONG`.
- Chave PIX real: CNPJ `40.019.106/0001-51`. Instagram: `@ongartedeamar`.

## Fluxo de trabalho
1. Ler `PROMPT.md` inteiro.
2. Fase 1: estrutura, tokens, fontes, layout estático desktop + mobile de todas as seções, sem motion.
3. Fase 2: header/nav/menu, preloader, Lenis.
4. Fase 3: fio com ScrollTrigger, seção por seção, seguindo a prancha.
5. Fase 4: motions de entrada (SplitText, contadores, máscaras), timeline pinada no desktop.
6. Fase 5: performance, WebP, reduced-motion, OG, build e checagem em 390px e 1440px.
Commitar ao fim de cada fase.
