# Padronização tipográfica e cores exclusivas no Início

Branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.**
A comparação "antes" usa o build do commit `51cb71b` (ajuste final aprovado). O "depois" usa o código desta entrega.

## 1. Diagnóstico

**Fontes das demonstrações.**
- O portfólio já usava Space Grotesk, DM Sans e Azeret Mono. Elas eram aplicadas pela classe `.brand` e pelas classes `type-*`.
- As cinco demonstrações ficam fora de `.brand` e usam as classes do Tailwind `font-display`, `font-sans` e `font-mono`.
- No tema, essas classes apontavam para Bricolage Grotesque e IBM Plex Sans/Mono, importadas em `src/main.tsx` por três pacotes `@fontsource`.
- Resultado: a mesma marca tinha dois sistemas tipográficos. O build também levava 81 arquivos de fonte (640 KB) só para as demonstrações.

**Cores das abas do Início.**
- A cor da bancada vinha da categoria comercial do serviço de cada aba (presença, gestão, processos).
- Planilha e Sistema pertencem à mesma categoria (gestão), então as duas abas ficavam azuis.

## 2. O que mudou

### Fontes (ajuste central)
- Em `src/styles/index.css`, as variáveis das demonstrações agora apontam para as da marca:
  - `--font-display` → `--font-title` (Space Grotesk);
  - `--font-sans` → `--font-text` (DM Sans);
  - `--font-mono` → `--font-code` (Azeret Mono).

  Não foi preciso trocar classe por classe: as cinco demonstrações e o CSS próprio de cada uma (Gestão360, OrçaFácil) já usavam essas variáveis.
- Os três pacotes `@fontsource` saíram do `package.json` e do `main.tsx`. A busca no código e no build confirmou que nada mais os usava. O site inteiro passa a usar os três WOFF2 locais de `public/fonts/` (cerca de 22 KB cada).
- **Ajuste fino.** Space Grotesk e DM Sans são mais largas que Bricolage e IBM Plex, por isso:
  - o espaçamento dos títulos ficou mais fechado (−0,025em nos grandes, −0,012em em h3/h4);
  - a altura de linha dos títulos ficou em 1,1.

  As quebras novas ("Contato e orçamento" na Nova Serviços, alguns itens do OrçaFácil) são quebras naturais em duas linhas, sem texto cortado. Os testes conferem a ausência de rolagem lateral de 320 a 1440 px.
- **Identidade de cada empresa fictícia.** Cores, logotipos, ícones e componentes continuam os mesmos. Os títulos pequenos de cartão usam a fonte de texto (antes IBM Plex Sans, agora DM Sans semibold), para separar níveis. Exemplos: nome do produto na Arena Store, perguntas do FAQ e etapas na Nova Serviços, títulos dos imóveis no Prime Imóveis.

### Cores das abas do Início
- Mapa próprio em `TAB_COLORS` (`src/components/sections/categories.ts`), separado das categorias dos serviços. O índice de serviços continua com `CATEGORY_COLORS`.

| Aba | Cor plena | Sobre a noite (#060E1D) | Texto escuro sobre a cor | Texto sobre escuro | Texto sobre a bancada branca |
| --- | --- | --- | --- | --- | --- |
| Site | `#22C3B0` | 8,7:1 | 8,4:1 | `#3FD5C1` 10,6:1 | `#0A7568` 5,6:1 |
| Sistema | `#5B84FF` | 5,7:1 | 5,5:1 | `#8AA8FF` 8,4:1 | `#2B4FB8` 7,2:1 |
| Planilha | `#A78BFA` | 7,1:1 | 6,8:1 | `#C4B5FD` 10,5:1 | `#6D4AD6` 5,8:1 |
| Automação | `#F2A93B` | 9,7:1 | 9,3:1 | `#F2B45A` 10,5:1 | `#8C5A07` 5,9:1 |

- Todas passam o nível AA (4,5:1 para texto). O menor intervalo de matiz entre duas abas é de 30° (Sistema e Planilha).
- **Onde a cor aparece:**
  - a cor plena, na moldura e na palavra do título, na etiqueta da bancada, no indicador da aba ativa, no ponto do painel de inspeção e na luz de fundo;
  - a variante clara, nos detalhes da bancada branca: célula do total, margem, números das etapas, status "Em produção";
  - a variante escura, no texto do painel de inspeção.

  O restante continua nas cores da marca.

### Mídias dos projetos
- As capturas (WebP 800/1600 e celular), as prévias em vídeo (WebM e MP4) e as imagens de compartilhamento foram refeitas a partir das demonstrações reais, em PT e EN.
- As imagens de compartilhamento em inglês agora têm textos em inglês.
- Áreas do tour, conferidas parada por parada nos dois idiomas:
  - Em inglês, o título do OrçaFácil cabe em uma linha e o formulário sobe cerca de 6%. Os botões de finalidade do Prime Imóveis são mais estreitos. Por isso, essas duas demonstrações ganharam áreas próprias em inglês (`GEOMETRY_EN` em `src/data/tour.ts`).
  - A área do título da Nova Serviços foi alargada.
  - A área das linhas do orçamento no OrçaFácil foi corrigida.
  - Nenhum dado ou função mudou para encaixar as imagens.

## 3. Desempenho (Lighthouse)

Metodologia:
- Lighthouse 12.6.1, celular simulado;
- servidor local sem compressão;
- três execuções por página;
- antes e depois medidos na mesma sessão.

É uma medição de laboratório, não do site publicado.

| Página | Versão | Nota | LCP | CLS | JavaScript | Fontes | Transferido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Antes | 74 · 74 · 74 | 4,6–4,8 s | 0 | 424 KiB | 67 KiB | 688 KiB |
| Início | **Depois** | 76 · 74 · 74 | 4,5–4,6 s | 0 | 424 KiB | 67 KiB | 674 KiB |
| Prime Imóveis (projeto) | Antes | 73 · 75 · 73 | 4,5–4,8 s | 0 | 424 KiB | 67 KiB | 649 KiB |
| Prime Imóveis (projeto) | **Depois** | 74 · 75 · 74 | 4,5–4,7 s | 0 | 424 KiB | 67 KiB | 635 KiB |
| Demonstração Prime Imóveis | Antes | 69 · 69 · 69 | 5,8 s | 0 | 474 KiB | 178 KiB | 786 KiB |
| Demonstração Prime Imóveis | **Depois** | 73 · 73 · 73 | 4,9 s | 0 | 475 KiB | 67 KiB | 661 KiB |
| Demonstração OrçaFácil | Antes | 67 · 67 · 67 | 6,2–6,3 s | 0 | 473 KiB | 231 KiB | 838 KiB |
| Demonstração OrçaFácil | **Depois** | 72 · 71 · 73 | 4,8–5,0 s | 0 | 473 KiB | 67 KiB | 660 KiB |

Principais efeitos:
- **Demonstrações.** Usam os mesmos três WOFF2 da marca, que já têm pré-carregamento. As fontes baixadas caíram de 178–231 KiB para 67 KiB. O LCP melhorou 0,9 s no Prime Imóveis e 1,2–1,4 s no OrçaFácil, e a nota subiu 4 a 5 pontos.
- **Portfólio.** O CSS principal passou de 128 para 113 KB, porque saíram as regras `@font-face` antigas. O Início e a página do Prime transferem 14 KiB a menos. A nota e o LCP ficaram na mesma faixa.
- **Build.** Saíram 81 arquivos de fonte (640 KB) da pasta `assets/`. O build total caiu de 10,3 MB para 9,3 MB.
- **CLS.** 0 em todas as medições.

## 4. Testes (executados no código entregue)

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319, incluindo `efeitos-limpeza` (proteção do "TypeError: d is not a function") |
| Build oficial (`npm run build`) | concluído sem erros |
| Build (`npm run verify:dist`) | 203 de 203. Novos: nenhuma fonte antiga no CSS, demonstrações nas famílias da marca, nenhum arquivo de fonte do Fontsource em `assets/` |
| Navegador (`npm run test:e2e`) | **2.868 de 2.868**, em 25 arquivos |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | 0 violações em 28 páginas × 2 larguras |

Arquivos novos:

**`demos-fontes.test.mjs` (362 verificações).** As cinco demonstrações em PT e EN, incluindo produto, carrinho e checkout, de 320 a 1440 px:
- todo texto visível em Space Grotesk, DM Sans ou Azeret Mono;
- nenhum pedido de Bricolage ou IBM Plex;
- só os três WOFF2 da marca são baixados;
- cobertura de todos os caracteres usados, inclusive os acentos;
- títulos de exibição em Space Grotesk e números técnicos em Azeret Mono;
- sem rolagem lateral e sem erros de página;
- na proposta impressa do OrçaFácil, PT e EN, as mesmas fontes; o PDF gerado incorpora as três fontes e nenhuma antiga.

**`hero-cores.test.mjs` (404 verificações).** As quatro abas em PT e EN, no computador e no celular, com e sem movimento reduzido:
- cor de cada elemento (palavra, moldura, etiqueta, indicador, painel, luz e detalhe da bancada branca);
- quatro cores diferentes, com Planilha diferente de Sistema;
- contraste AA nas duas superfícies;
- com "Pausar animações", a moldura não anima e a cor muda na hora.

**`tour-areas.test.mjs` (30 verificações).** Abre cada demonstração no mesmo estado da captura e confere, em PT e EN:
- que a moldura do tour contém o elemento real;
- que a moldura não fica folgada;
- que a moldura não cobre o elemento vizinho.

Testes existentes, que continuam passando:
- vídeo só depois do clique nas páginas de projeto (`inovacoes`);
- seletor PT/EN e rotas (`idiomas`, `navegacao-historico`);
- tours (`inovacoes`);
- responsividade (`responsivo`);
- cálculos e exportações das demonstrações.

## 5. Pendências

- [ ] Aprovar e publicar (nada foi publicado). Depois, rodar a verificação no ar (`docs/VERIFICACAO-POS-PUBLICACAO.md`), incluindo `/en/`.
- [ ] Conferir num celular real as quatro cores da bancada e a leitura das demonstrações com as fontes novas.
