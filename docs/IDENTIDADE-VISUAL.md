# Nova identidade visual integrada ao site

Branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.**

A referência principal foi a imagem de fundo azul-marinho. A imagem de fundo branco não foi usada,
porque tem artefatos.

## 1. A logo

**Reconstrução.** O símbolo foi medido sobre uma grade na referência e redesenhado com geometria
exata, sem vetorização automática:
- **A:** duas faixas paralelas com inclinação 0,461, topo reto com cantos arredondados e vértice interno em ponta;
- **barra central:** paralelogramo verde-água com a mesma inclinação das pernas, junto da perna direita e afastado da esquerda;
- **sinais de código `<` e `>`:** braços a 45° e topo reto. O braço de baixo é cortado em paralelo à perna do A, com afastamento constante.

**Texto.**
- "Alto Code" está em Space Grotesk 650, a fonte de títulos do site, com "Code" em verde-água.
- O slogan "DESENVOLVIMENTO DIGITAL" ("DIGITAL DEVELOPMENT" em inglês) está em DM Sans 600 espaçada.
- Nos arquivos, o texto foi convertido em contornos: não depende de fonte instalada.

**Cores do site, sem degradês nem efeitos:**

| Uso | Fundo escuro | Fundo claro |
| --- | --- | --- |
| A e "Alto" | branco | marinho `#0D1A30` |
| Detalhes e "Code" | `#22C3B0` (8,7:1 sobre `#060E1D`) | `#0E9888` (3,6:1 sobre branco, acima do mínimo de 3:1 para elementos gráficos) |

O verde-água da referência é mais saturado. Usei o `#22C3B0`, que já é a cor da marca no site.

**Kit** (`marca/`, fora do site publicado):
- `marca/svg/` (25 arquivos):
  - símbolo, logo horizontal, horizontal com slogan e vertical com slogan;
  - cada um em quatro versões: escuro, claro, mono-branco e mono-preto;
  - as versões com slogan também em inglês;
  - ícone quadrado.
- `marca/png/`:
  - os mesmos arquivos em PNG transparente (1600 px; símbolos em 1024 px);
  - ícone em 192 e 512 px;
  - favicon em 16, 32 e 48 px.
- Para refazer o kit:
  - `python3 scripts/marca.py` gera os SVGs, o favicon e os contornos usados pelo site;
  - `node scripts/marca-png.mjs` gera os PNGs.

## 2. No site

**Cabeçalho**
- Logo horizontal sem slogan:
  - 21 a 22 px de altura no celular;
  - 25 px a partir de 640 px.
- A barra continua com 64 px no celular e 72 px a partir de 640 px.
- A logo fica alinhada à borda do conteúdo.
- Menu, seletor PT/EN, controle de movimento e botão de orçamento continuam iguais.
- De 320 a 1440 px não há sobreposição nem rolagem lateral.
- Cores por fundo:
  - no topo transparente, sobre o Hero: A branco e detalhes `#22C3B0`;
  - no fundo claro, depois de rolar: A marinho e detalhes `#0E9888`.
- O link leva ao início do idioma atual (`/` ou `/en`), com o nome acessível "Alto Code, página inicial" / "Alto Code, home page".

**Moldura de seleção.** Ela não está dentro do símbolo, mas continua na linguagem da marca:
- aparece em volta da logo ao passar o mouse ou focar pelo teclado;
- emoldura o símbolo no cartão Sobre.

**Outros lugares com a logo**
- O rodapé escuro usa o mesmo componente.
- O símbolo aparece também na tela de erro do aplicativo e na barra lateral da demonstração Gestão360.

**Favicon** (`public/favicon.svg`)
- Símbolo engrossado sobre um quadrado azul-noite.
- Em 16 px, uma regra de mídia dentro do próprio SVG troca para o A com a barra: os sinais de código viravam borrões nesse tamanho.
- Em 32 e 48 px aparece o símbolo completo.
- O `apple-touch-icon.png` (180 px) sai do mesmo desenho.

**Imagens de compartilhamento**
- `og-image.png`, em português, foi refeita com a logo nova.
- `og-image-en.png` é nova, com textos em inglês, e passa a ser usada no início em inglês (`/en/`).
- As `og.jpg` dos cinco projetos, em PT e EN, foram refeitas porque mostravam o monograma antigo.

**Mídias de projeto refeitas**
- Só as da Gestão360, porque a barra lateral da demonstração mostra a logo: capturas de computador e celular e prévias em vídeo, em PT e EN.
- As capturas das outras quatro demonstrações não mostram a logo e não foram alteradas.

**O que não mudou**
- O Hero interativo e as quatro cores das abas;
- a bancada, o índice e os palcos da vitrine;
- os tours e as cinco demonstrações;
- as fontes, a versão bilíngue, o SEO, a responsividade e a acessibilidade.

## 3. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `scripts/marca.py` (novo) | geometria do símbolo, versões da logo, favicon e `logo-paths.ts` |
| `scripts/marca-png.mjs` (novo) | PNGs transparentes do kit e `apple-touch-icon.png` |
| `scripts/og-marca.mjs` (novo) | imagens de compartilhamento da marca em PT e EN |
| `scripts/capturas.mjs` | logo nova nas `og.jpg`; opções `--og` e `--so=` para refazer só parte das mídias |
| `marca/svg`, `marca/png` (novos) | kit da marca |
| `src/components/ui/logo-paths.ts` (novo, gerado) | contornos do símbolo e da logo horizontal |
| `src/components/ui/Logo.tsx` | `Logo`, `LogoLockup` e `LogoMark` com a identidade nova |
| `src/styles/index.css` | `--logo-accent` nos tons claro e escuro |
| `src/components/sections/About.tsx` | símbolo na moldura de seleção |
| `src/components/layout/AppErrorBoundary.tsx` | símbolo na tela de erro |
| `src/pages/Gestao360Demo.tsx`, `gestao360.css` | símbolo na barra lateral |
| `src/hooks/useDocumentTitle.ts`, `vite.config.ts` | imagem de compartilhamento em inglês no início em inglês |
| `public/favicon.svg`, `apple-touch-icon.png`, `og-image.png`, `og-image-en.png` | novos |
| `public/marca/` (removida) | monograma e avatar antigos. O kit novo fica em `marca/`, fora do site publicado |
| `public/projetos/*/og.jpg` e `*/en/og.jpg`, mídias da Gestão360 | refeitos com a logo nova |
| `tests/e2e/marca.test.mjs` (novo), `tests/verificar-dist.mjs` | testes da identidade |
| `README.md` | seção "Identidade visual" |

## 4. Testes (executados no código entregue)

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319, incluindo a proteção do "TypeError: d is not a function" |
| Build oficial (`npm run build`) | concluído sem erros |
| Build (`npm run verify:dist`) | 208 de 208. Novos: favicon com as duas versões, `og-image-en.png` no início em inglês, kit fora do site publicado |
| Navegador (`npm run test:e2e`) | **3.048 de 3.048**, em 26 arquivos |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | 0 violações em 28 páginas × 2 larguras |

**`marca.test.mjs` (180 verificações).** Em PT e EN, em 320, 390, 768, 1024 e 1440 px:
- **logo:** link para o início do idioma, nome acessível, ausência do monograma antigo;
- **cores:** corretas no topo transparente e no fundo claro, com contraste de 3:1 ou mais para o verde-água;
- **barra:** mesma altura, logo alinhada, sem sobreposição nem rolagem lateral;
- **controles:** menu, controle de movimento e seletor PT/EN preservados;
- **moldura de seleção:** escondida em repouso, visível com o mouse e com o foco do teclado;
- **navegação e outros usos:** o clique na logo volta ao início a partir de uma página de projeto; logo do rodapé e símbolo do cartão Sobre;
- **favicon:** declarado; o desenho de 16 px é diferente do de 48 px;
- **compartilhamento:** imagem por idioma, e o kit não é publicado no site.

## 5. Desempenho (Lighthouse 12.6.1, celular simulado, 3 execuções, mesma sessão)

| Página | Versão | Nota | LCP | CLS | JavaScript | Transferido |
| --- | --- | --- | --- | --- | --- | --- |
| Início PT | Antes | 73 · 74 · 74 | 4,6–4,7 s | 0 | 424,4 KiB | 674 KiB |
| Início PT | **Depois** | 74 · 75 · 75 | 4,6–4,7 s | 0 | 429,0 KiB | 680 KiB |
| Início EN | Antes | 75 · 75 · 75 | 4,5–4,6 s | 0 | 424,4 KiB | 671 KiB |
| Início EN | **Depois** | 75 · 75 · 74 | 4,6 s | 0 | 429,0 KiB | 677 KiB |
| Prime Imóveis | Antes | 76 · 75 · 75 | 4,4–4,6 s | 0 | 424,4 KiB | 635 KiB |
| Prime Imóveis | **Depois** | 75 · 75 · 75 | 4,6 s | 0 | 429,0 KiB | 640 KiB |

- O JavaScript cresceu 4,6 KiB: são os contornos da logo, que ficam no próprio código e não pedem arquivo extra.
- Nota, LCP e CLS ficaram na mesma faixa.
- Medição de laboratório (servidor local sem compressão), não do site publicado.

## 6. Pendências

- [ ] Aprovar e publicar (nada foi publicado). Depois, conferir o favicon e as prévias de link no ar (WhatsApp e LinkedIn guardam a imagem antiga em cache por alguns dias).
- [ ] Opcional: se preferir o verde-água mais vivo da referência (por volta de `#11E8D2`), basta trocar `TIDE` em `scripts/marca.py`. Ele não funcionaria sobre fundo claro, e por isso mantive o `#22C3B0` do site.
