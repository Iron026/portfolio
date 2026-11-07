# Alto Code — Portfólio

Portfólio profissional de desenvolvimento e soluções digitais, feito com
**React + TypeScript + Vite + Tailwind CSS**, com ícones **Lucide** e rotas com
**React Router**. Todo o conteúdo está em português e pode ser publicado
gratuitamente (Netlify ou Cloudflare Pages).

> Situação: site principal publicado e cinco demonstrações disponíveis:
> **Gestão360** (`/demos/gestao360`), **Prime Imóveis** (`/demos/imoveis`),
> **Nova Serviços** (`/demos/nova-servicos`), **Arena Store** (`/demos/arena-store`)
> e **OrçaFácil** (`/demos/orcafacil`).
> Para um projeto novo ainda sem demonstração, use `demo.status: 'em-breve'`: o botão mostra
> "Demonstração em produção" e nenhum link fica quebrado.

---

## 1. Rodar no seu computador

Pré-requisito: [Node.js](https://nodejs.org) 20 ou mais recente (recomendado: 22 LTS, a mesma versão usada no Netlify — veja `.nvmrc`).

```bash
npm install      # instala as dependências (só na primeira vez)
npm run dev      # abre em http://localhost:5173 com atualização automática
npm run build    # verifica os tipos e gera a versão final na pasta dist/
npm run preview  # testa localmente a versão final gerada
```

Testes (detalhes em `tests/README.md`):

```bash
npm run test:unit     # regras e cálculos das demonstrações (não precisa de navegador)
npm run verify:dist   # confere a pasta dist/ antes de publicar (rotas, SEO, sitemap, fontes, imagens)
npm run test:setup    # uma vez: instala o Playwright e o Chromium (não altera o package.json)
npm run test:e2e      # testes no navegador: portfólio, formulário, bancada e as 5 demonstrações
npm test              # tudo acima, em sequência (inclui o build)
```

---

## 2. Onde alterar cada coisa

| O que você quer mudar | Arquivo |
| --- | --- |
| Nome do portfólio, título do topo, texto e compromissos do "Sobre", ferramentas | `src/config/site.ts` → `hero`, `about`, `tools` |
| Seu nome, função e foto na seção "Sobre" (opcionais) | `src/config/site.ts` → `ownerName`, `ownerRole`, `ownerPhoto` |
| WhatsApp, e-mail e link do perfil profissional | `src/config/site.ts` → `contact` |
| Endereço do site publicado (para SEO) | `src/config/site.ts` → `url` |
| Serviços (6 frentes em 3 categorias, cartões compactos) | `src/data/services.ts` |
| Projetos e estudos de caso | `src/data/projects.ts` |
| Capturas dos projetos | `public/projetos/<slug>/` (ver seção 3) |
| Logotipo em arquivo (perfis, capas, apresentações) | `public/marca/` |
| Etapas de trabalho e perguntas frequentes | `src/data/content.ts` |
| Cores, escala tipográfica e moldura da marca | `src/styles/index.css` |
| Ícone da aba do navegador | `public/favicon.svg` |
| Imagem de compartilhamento (WhatsApp, LinkedIn) | `public/og-image.png` e `public/projetos/<slug>/og.jpg` (1200 × 630) |

O monograma "AC" do logotipo é desenhado em traços (`src/components/ui/Logo.tsx`), sem depender de fonte instalada.

### Contatos

Enquanto `whatsapp`, `email` e `profiles` estiverem vazios, o site **não exibe
contatos** — mostra um aviso e permite copiar a mensagem do formulário.
Assim nenhum dado fictício é publicado. Exemplo de preenchimento:

```ts
contact: {
  whatsapp: '5511999998888',        // DDI + DDD + número, só dígitos
  email: 'contato@seudominio.com.br',
  profiles: [
    { label: '99Freelas', url: 'https://www.99freelas.com.br/user/seu-usuario' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/seu-perfil' },
  ],
  ...
}
```

Com WhatsApp e/ou e-mail preenchidos, o formulário passa a mostrar os botões
**Enviar pelo WhatsApp** e **Enviar por e-mail**. O site é estático: o formulário
não grava nem envia dados a um servidor — ele abre o WhatsApp ou o aplicativo de
e-mail com a mensagem pronta, e o texto do site informa isso ao visitante.

---

## 3. Como cadastrar um novo projeto

1. Abra `src/data/projects.ts`.
2. Copie um dos objetos da lista e cole no final (ou na posição desejada).
3. Altere os campos:
   - `slug`: identificador sem espaços nem acentos (vira o endereço `/projetos/<slug>`).
   - `kind`: `'demo'` para projeto demonstrativo; `'cliente'` **somente** para trabalho real feito para um cliente.
   - `name`, `category`, `summary`, `problem`, `goal` (objetivo), `features`, `technologies`.
   - `decisions`: decisões de implementação que aparecem no estudo de caso (`{ title, text }`). Escreva só o que o código realmente faz.
   - `screens`: capturas reais da interface. A primeira é a imagem principal. Cada item tem `src` (caminho sem o final, ex.: `'/projetos/meu-site/tela-1'`), `device` (`'desktop'` ou `'mobile'`), `alt`, `caption` e `route`. Os arquivos precisam existir nas larguras 1600 e 800 (telas grandes) ou 780 e 390 (celular), em WebP: `tela-1-1600.webp`, `tela-1-800.webp`, `celular-780.webp`… Sem capturas, o site usa a prévia desenhada em código (`preview`).
   - `service`: serviço pré-selecionado no formulário quando o visitante clica no botão de orçamento do projeto (`'sites'`, `'planilhas'`, `'automacoes'` ou `'sistemas'`).
   - `quoteCta`: texto desse botão (ex.: `'Quero um painel de gestão assim'`).
   - `preview`: tipo de prévia desenhada em código; também define o ícone do projeto no índice rápido (`src/components/ui/icons.ts`).
   - `demo`: `{ status: 'disponivel', url: 'https://link-da-demo' }` ou `{ status: 'em-breve', url: '' }`.
   - `accent`: as duas cores da identidade do projeto (`{ base, detail }`), usadas como detalhe no cartão.
   - `video` (opcional): prévia gravada da própria demonstração, `{ src: '/projetos/<slug>/previa', shows: 'o que o vídeo mostra' }`. Precisa dos arquivos `previa.webm` e `previa.mp4` (gerados por `scripts/previas.mjs`). Sem vídeo, o cartão mostra só a captura.
4. Salve. O projeto aparece na grade da página inicial, no rodapé, ganha o estudo de caso em `/projetos/<slug>` e entra no `sitemap.xml` no próximo build.

**Refazer as capturas e as prévias em vídeo** (por exemplo, depois de mudar uma demonstração):

```bash
npm run test:setup                        # uma vez: Playwright e Chromium, fora do package.json
npm run build && npm run preview          # deixe rodando
node scripts/capturas.mjs http://localhost:4173   # capturas WebP, em outro terminal
node scripts/previas.mjs http://localhost:4173    # prévias em vídeo (precisa do ffmpeg)
```

`scripts/capturas.mjs` abre cada demonstração com data fixa, repete os mesmos passos e grava os WebP nas larguras certas.
`scripts/previas.mjs` executa interações reais em cada demonstração (filtros, busca, carrinho, cálculo, formulário),
grava a tela e gera `previa.webm` (VP9) e `previa.mp4` (H.264), sem som, 960 × 600, com poucas centenas de KB.
As imagens de compartilhamento `og.jpg` não são refeitas por ele.

**Orçamento a partir de um projeto:** o botão "Quero … assim" abre `/?projeto=<slug>#contato`.
O formulário escolhe o serviço do projeto (um `?servico=` explícito tem prioridade), mostra o
selo "Projeto de referência", que o visitante pode remover, e a mensagem gerada ganha a linha
"Projeto de referência: <nome> (demonstração do portfólio)".

---

## 4. Demonstração Gestão360

Rota: `/demos/gestao360` (registrada em `src/App.tsx`, fora do `MainLayout`,
porque a demonstração tem layout próprio com caminho de volta para Alto Code / Projetos).

| Arquivo | Conteúdo |
| --- | --- |
| `src/pages/Gestao360Demo.tsx` | Página: filtros, indicadores, gráficos, tabela e exportação |
| `src/pages/gestao360-data.ts` | Dados fictícios e cálculos (funções puras, sem React) |
| `src/pages/gestao360-charts.tsx` | Gráfico de evolução e gráfico de rosca em SVG |
| `src/pages/gestao360.css` | Estilos isolados com prefixo `g360-` |

- Os dados são gerados no navegador a partir da data de hoje (uma receita e uma
  despesa a cada 3 dias), então os períodos de 30 dias, 90 dias e 12 meses sempre têm dados.
- Indicadores, gráficos, tabela e CSV usam o mesmo conjunto filtrado.
- O CSV sai em UTF-8 com BOM, separador `;`, vírgula decimal e data dd/mm/aaaa,
  o padrão do Excel em português.
- A prévia do card na página inicial é calculada com os mesmos dados (12 meses).
- Os gráficos são SVG próprio. O pacote `recharts` continua no `package.json`,
  mas não é usado; pode ser removido com `npm uninstall recharts`.

## 5. Demonstração Prime Imóveis

Rotas: `/demos/imoveis` (catálogo) e `/demos/imoveis/:id` (detalhe, ex.: `/demos/imoveis/PI-101`),
registradas em `src/App.tsx` fora do `MainLayout`.

| Arquivo | Conteúdo |
| --- | --- |
| `src/pages/imoveis/imoveis-data.ts` | 12 imóveis fictícios, faixas de preço, busca, filtros, filtros na URL e mensagem de consulta |
| `src/pages/imoveis/PrimeImoveisLayout.tsx` | Faixa "Alto Code / Projetos", cabeçalho e rodapé da imobiliária |
| `src/pages/imoveis/PrimeImoveisList.tsx` | Busca, filtros, contador, filtros ativos e cards |
| `src/pages/imoveis/PrimeImoveisDetail.tsx` | Galeria, atributos, valores, consulta copiável e imóveis semelhantes |
| `src/pages/imoveis/imoveis-art.tsx` | Ilustrações em SVG usadas como imagens (nenhuma foto real) |
| `src/pages/imoveis/imoveis-nav.ts` | Lembra a última busca e o último imóvel aberto |
| `src/pages/imoveis/imoveis.css` | Cores da marca fictícia, isoladas em `.pi-root` |

- **Filtros na URL**: `?finalidade=venda&tipo=casa&bairro=Centro&preco=v2&quartos=3&q=piscina`.
  Atualizar a página, usar o "voltar" do navegador ou compartilhar o link mantém a busca.
- **Faixas de preço por finalidade**: venda e aluguel têm faixas próprias; sem escolher
  Comprar ou Alugar, o filtro de preço fica desativado.
- **Busca**: nome, código, tipo, bairro e características, sem diferenciar acentos;
  várias palavras precisam aparecer todas ("casa piscina").
- **Consultar imóvel** gera um texto para copiar. Nada é enviado e não há corretor real.
- Para cadastrar um imóvel, copie um item de `properties` em `imoveis-data.ts`, dê um
  `id` novo no formato `PI-1xx` e escolha as cenas da galeria (`gallery`).

## 6. Demonstração Nova Serviços

Rota: `/demos/nova-servicos` (registrada em `src/App.tsx`, fora do `MainLayout`).

| Arquivo | Conteúdo |
| --- | --- |
| `src/pages/nova-servicos/ns-data.ts` | Serviços, vantagens, etapas, perguntas, validação e mensagem do pedido |
| `src/pages/nova-servicos/NovaServicosDemo.tsx` | Landing page, cabeçalho com menu móvel, âncoras e perguntas frequentes |
| `src/pages/nova-servicos/QuoteForm.tsx` | Formulário de orçamento, erros acessíveis e mensagem pronta |
| `src/pages/nova-servicos/ns.css` | Cores da marca fictícia, isoladas em `.ns-root` |

- O formulário valida nome, contato (WhatsApp com DDD ou e-mail), serviço, bairro,
  descrição e autorização. O foco vai para o primeiro campo com erro.
- Não há servidor: depois de validar, a página mostra a mensagem pronta para copiar
  e diz claramente que nada foi enviado.
- `QUOTE_EMAIL` em `ns-data.ts` está vazio de propósito (a empresa é fictícia). Se for
  preenchido com um e-mail real e autorizado, aparece o botão "Abrir no e-mail".
- As âncoras rolam por script, sem mudar o endereço, e funcionam nos dois modos de rota.

## 7. Demonstração Arena Store

Rotas (registradas em `src/App.tsx`, fora do `MainLayout`):
`/demos/arena-store` (vitrine), `/demos/arena-store/produto/:id`, `/demos/arena-store/carrinho`
e `/demos/arena-store/checkout`.

| Arquivo | Conteúdo |
| --- | --- |
| `src/pages/arena-store/store-data.ts` | 8 produtos, estoque por tamanho, busca, filtros, regras do carrinho, totais e leitura segura do carrinho salvo |
| `src/pages/arena-store/store-cart.tsx` | Estado do carrinho compartilhado e gravação no `localStorage` |
| `src/pages/arena-store/StoreLayout.tsx` | Faixa "Alto Code / Projetos", cabeçalho com contador do carrinho e rodapé |
| `src/pages/arena-store/StoreCatalog.tsx` | Vitrine com busca, categorias e ordenação |
| `src/pages/arena-store/StoreProduct.tsx` | Produto com tamanho, quantidade e "Adicionar ao carrinho" |
| `src/pages/arena-store/StoreCart.tsx` | Carrinho com ajuste, remoção, subtotal, frete fictício e total |
| `src/pages/arena-store/StoreCheckout.tsx` | Checkout simulado e confirmação |
| `src/pages/arena-store/store-art.tsx` | Ilustrações dos produtos em SVG |
| `src/pages/arena-store/store-ui.tsx` | Selo de estoque e seletor de quantidade |
| `src/pages/arena-store/store.css` | Cores da loja fictícia, isoladas em `.as-root` |

- **Preços em centavos** (inteiros), para os totais não terem erro de arredondamento.
- **O carrinho salvo guarda só produto, tamanho e quantidade.** O preço vem sempre do
  catálogo. Ao abrir a loja, itens inexistentes, tamanhos esgotados, quantidades inválidas
  ou acima do estoque são descartados ou ajustados, com aviso. Um JSON corrompido reinicia o carrinho.
- **Estoque ilustrativo**: a quantidade nunca passa do disponível em cada tamanho.
- **Frete fictício**: grátis a partir de R$ 299,00; abaixo disso, R$ 24,90.
- **Checkout simulado**: não pede dados pessoais nem de pagamento, não faz requisições e,
  ao concluir, mostra "Compra simulada — nenhum pagamento foi realizado" e esvazia o carrinho.

## 8. Demonstração OrçaFácil

Rotas: `/demos/orcafacil` (calculadora, registrada em `src/App.tsx`) e `/projetos/orcafacil`
(página de detalhes, gerada a partir de `src/data/projects.ts`).

| Arquivo | Conteúdo |
| --- | --- |
| `src/pages/orcafacil/orca-data.ts` | Catálogo de exemplo, as três variáveis (material, acabamento, prazo), cálculos, validações e resumo |
| `src/pages/orcafacil/OrcaFacilDemo.tsx` | Calculadora, totais, desconto e ações da proposta |
| `src/pages/orcafacil/CatalogManager.tsx` | Cadastro do catálogo (até 10 itens) |
| `src/pages/orcafacil/Proposal.tsx` | Proposta comercial (tela e impressão) |
| `src/pages/orcafacil/orca.css` | Cores e regras de impressão (`@media print`) |

- **Cálculo em centavos**, com arredondamento de meio centavo para cima em cada etapa:
  preço base × material → + acabamento → × quantidade → + prazo → total da linha.
  Depois vêm subtotal, desconto (0 a 100%, com aviso acima de 30%) e total.
- **Para mudar o nicho**, edite `SAMPLE_CATALOG` e `VARIABLES` em `orca-data.ts`
  (nomes, descrições e percentuais).
- **Impressão/PDF**: o botão chama `window.print()`. Só a proposta é impressa, e para
  ter um PDF basta escolher "Salvar como PDF" no destino da impressão. Não há gerador de PDF próprio.
  As regras de impressão valem só enquanto a página do OrçaFácil está aberta.
- **Armazenamento**: só o catálogo fica no `localStorage` deste navegador (não sincroniza
  entre dispositivos). O orçamento em andamento não é guardado.

## 9. Estrutura de pastas

```
alto-code/
├── index.html                 # metadados de SEO e compartilhamento (preenchidos a partir de site.ts)
├── netlify.toml               # configuração de build (Node 22) e rotas para Netlify
├── .nvmrc                     # versão do Node usada no Netlify e recomendada no computador
├── docs/                      # guia de publicação e relatório das verificações
├── tests/                     # testes de unidade, de navegador e verificação do dist/
├── vite.config.ts             # build + geração das páginas de SEO, sitemap e robots
├── scripts/
│   ├── seo-pages.ts           # metadados por estudo de caso, sitemap.xml e robots.txt
│   └── capturas.mjs           # refaz as capturas reais das demonstrações
├── public/
│   ├── _redirects             # rotas internas para Netlify e Cloudflare Pages
│   ├── _headers               # cache longo de /assets e /fonts (Netlify)
│   ├── fonts/                 # fontes da marca em WOFF2 + licenças
│   ├── favicon.svg, apple-touch-icon.png, og-image.png
│   ├── marca/                 # monograma em SVG e avatar PNG para perfis
│   └── projetos/<slug>/       # capturas (WebP) e imagem de compartilhamento (og.jpg)
└── src/
    ├── main.tsx               # ponto de entrada, fontes e roteador
    ├── App.tsx                # rotas (demonstrações carregadas sob demanda)
    ├── config/site.ts         # ← configuração central
    ├── data/                  # serviços, projetos/estudos de caso, processo e FAQ
    ├── components/
    │   ├── layout/            # cabeçalho, rodapé e layout das páginas
    │   ├── sections/          # seções da página inicial
    │   ├── previews/          # prévias desenhadas em código (usadas se faltar captura)
    │   └── ui/                # botões, logotipo, selos, títulos, capturas
    ├── pages/                 # início, estudo de caso, 404 e demonstração Gestão360
    │   ├── imoveis/           # demonstração Prime Imóveis
    │   ├── nova-servicos/     # demonstração Nova Serviços
    │   ├── arena-store/       # demonstração Arena Store
    │   └── orcafacil/         # demonstração OrçaFácil
    ├── hooks/                 # metadados por página (título, descrição, canonical, Open Graph)
    ├── utils/                 # links de contato e utilitários
    └── styles/                # index.css (tokens, escala tipográfica, componentes) e fonts.css
```

---

## 10. Identidade visual

**Conceito — a moldura de seleção.** O sinal da marca é um objeto selecionado em uma
ferramenta de design: uma linha fina e quatro alças quadradas. A ideia é "enquadrar o
problema e ajustar sob medida". O uso é controlado:

1. no logotipo (monograma "AC" dentro da moldura);
2. na palavra-chave do título principal ("sob medida");
3. nas capturas dos projetos, aparecendo ao apontar ou focar (como uma seleção);
4. na imagem principal de cada estudo de caso.

Classes: `.frame-sel` (moldura sempre visível), `.frame-sel-hover` (aparece no hover/foco
dentro de um `.group`) e `.frame-word` (ajuste para palavras dentro de títulos).

**Cores** (`@theme` em `src/styles/index.css`):

| Nome | Valor | Uso |
| --- | --- | --- |
| Noite | `#060E1D` | hero, processo, contato, rodapé, abertura dos estudos de caso |
| Marinho | `#0D1A30` | títulos, textos fortes, botão principal |
| Papel | `#F4F6FA` | fundo das seções claras |
| Linha | `#E0E5EE` | linhas finas e bordas |
| Ardósia | `#48566F` | texto de apoio (7,4:1 sobre branco) |
| Névoa | `#A9B6CC` | texto de apoio sobre a Noite (9,4:1) |
| Verde-água | `#22C3B0` | destaque sobre fundo escuro, alças da moldura |
| Verde-água escuro | `#0A7568` | destaque e links sobre fundo claro (5,6:1) |

Superfícies chapadas, sem gradientes nem efeito de vidro; uma sombra de apoio
(`shadow-soft`) e uma de hover (`shadow-lift`). Cantos: 4 px (etiquetas), 8 px (botões,
campos, imagens) e 12 px (cartões).

**Tipografia do portfólio** — fontes locais em `public/fonts/` (WOFF2 variáveis, subconjunto
latino com todos os acentos do português, `font-display: swap`, pré-carregadas no `index.html`,
cache de um ano via `public/_headers`). `@font-face` e fontes de reserva com métricas ajustadas
ficam em `src/styles/fonts.css`; a escala, em `src/styles/index.css`. Licenças OFL em
`public/fonts/licencas/`. Total: cerca de 77 KB (Sora 27 KB, Onest 27 KB, Azeret Mono 22 KB).

| Classe | Família | Tamanho (fluido) | Uso |
| --- | --- | --- | --- |
| `type-h1` | Sora 600 | 34 → 68 px, entrelinha 1,08, −0,035em | título principal |
| `type-h2` | Sora 600 | 28 → 46 px, 1,12, −0,03em | títulos de seção |
| `type-h3` | Sora 600 | 20 → 26 px, 1,22, −0,02em | títulos de projeto |
| `type-h4` | Sora 600 | 18 px, 1,32, −0,01em | cartões de serviço, perguntas |
| `type-lead` | Onest 400 | 17 → 19,5 px, 1,58 | textos de abertura |
| `type-body` | Onest 400 | 17 px, 1,62 | texto corrido |
| `type-small` | Onest 400 | 15 px, 1,55 | apoio, legendas, rodapé |
| `type-label` | Azeret Mono 500 | 12 px, maiúsculas, +0,07em | índices de seção, categorias |
| `type-tag` | Azeret Mono 400 | 12,5 px | tecnologias, rotas, identificadores |

A Sora é geométrica e limpa: o tracking fica mais negativo nos títulos grandes e quase
neutro nos pequenos. O logotipo usa Sora 600. Menus, botões e formulários usam Onest 500/600.

**Para trocar um arquivo de fonte:** gere o novo WOFF2, renomeie para `-v2` e atualize o nome
em `src/styles/fonts.css` e nos `<link rel="preload">` do `index.html` (o sufixo evita que
visitantes fiquem com a versão antiga em cache).

**Demonstrações:** continuam com Bricolage Grotesque e IBM Plex (pacotes `@fontsource`,
importados em `src/main.tsx`). O navegador só baixa essas fontes quando uma demonstração
é aberta. As classes `type-*` são exclusivas do portfólio.

**Cores complementares.** Azul-marinho e verde-água continuam sendo a marca. As cores novas têm
funções fixas e aparecem pouco:

| Cor | Valor | Função |
| --- | --- | --- |
| Gelo | `#EDF3FA` (linhas `#D9E5F3`) | superfícies técnicas: fundo da vitrine de projetos e telas claras das ilustrações |
| Lavanda acinzentada | `#EFEEF6` (texto `#5A5687`, 5,9:1) | o lado humano e editorial: seção Sobre e o brilho do Contato |
| Âmbar | `#F2A93B` (texto `#8C5A07`, 5,9:1) | sinal de dado em movimento e mudança de estado: pacotes, valores que acabaram de mudar, etapa em andamento |
| Cores dos projetos | definidas em `accent` | faixa, fundo da mídia e amostras de cor de cada cartão de projeto |

Ritmo das seções: Início (noite) → Projetos (gelo) → Serviços (papel) → Processo (noite) →
Sobre (lavanda) → Dúvidas (branco) → Contato (marinho com trama de pontos) → Rodapé (noite).

**Movimento em três níveis**

- *Ambiente* (contínuo, lento, atrás do conteúdo): no Início, grade em duas profundidades, brilhos
  e, em telas a partir de 1200 px, pacotes de dados que percorrem linhas da grade até um ponto de
  conexão (`AmbientBackground.tsx`). Processo: grade parada e um brilho. Contato: trama de pontos e
  brilho lavanda.
- *Demonstrativo* (mostra como as soluções funcionam): prévias gravadas das demonstrações nos
  cartões de projeto (`PreviewVideo.tsx`), seis ilustrações animadas nos serviços
  (`ServiceIllustrations.tsx`), sinal percorrendo as etapas do Processo, módulos independentes no
  Sobre (`AboutModules.tsx`) e o caminho da necessidade até o orçamento no Contato (`ContactFlow.tsx`).
- *Microinterações*: resposta a clique, foco e passagem do mouse (botões, cartões, moldura de seleção).

Textos, títulos e botões de orçamento nunca se movem.

**Controle e desempenho**

- Botão "Pausar animações" no cabeçalho, com a escolha lembrada no navegador (`useMotion.tsx`).
- Com "reduzir movimento" ativado no sistema, tudo começa parado. A pessoa ainda pode retomar pelo botão.
- Áreas fora da tela e abas em segundo plano congelam (`MotionArea.tsx`, atributo `data-motion-off`).
- As prévias em vídeo são baixadas só quando o cartão chega perto da tela, e toca uma por vez: a mais
  visível. Elas param com a pausa geral e quando o navegador pede economia de dados, e cada cartão
  tem o próprio botão de pausar e reproduzir.
- As animações usam só `transform` e `opacity`; os temporizadores das ilustrações rodam só quando estão visíveis.

**Composição.** Cada seção abre com uma linha de índice (`01 · PROJETOS`) sobre um fio,
título grande à esquerda e texto de apoio à direita. Seções claras e escuras se alternam
para dar ritmo, e cada uma tem um layout próprio: grade variada com capturas (projetos), cartões
compactos (serviços), linha do tempo (processo) e cartão do responsável (sobre).

**Ordem da página inicial:** Início → 01 Projetos → 02 Serviços → 03 Processo → 04 Sobre →
05 Dúvidas → 06 Contato. O menu segue a mesma ordem.

**Arquivos da marca** (`public/marca/`): monograma para fundo claro e para fundo escuro
(SVG) e avatar quadrado (SVG e PNG 800 px) para perfis como 99Freelas e LinkedIn.

---

---

## 11. Publicação

O passo a passo completo — gerar o `package-lock.json`, criar o repositório no GitHub,
ligar o site que já existe no Netlify ao repositório sem risco e conferir os logs — está em
**`docs/PUBLICACAO.md`**.

> **Importante:** publique sempre o resultado de `npm run build` (pasta `dist/`), de preferência
> pelo build automático do Netlify a partir do GitHub. Versões de "pré-visualização" geradas fora
> do Vite não são o build oficial.

As rotas internas (ex.: `/projetos/gestao360`) funcionam ao atualizar a página graças a
`public/_redirects` e `netlify.toml`. Para hospedagens sem suporte a essa regra
(como GitHub Pages), gere o build com `VITE_HASH_ROUTER=true npm run build`.

---

## 12. Acessibilidade, SEO e desempenho

**Acessibilidade (objetivo: WCAG 2.2 AA)**
- Link "Pular para o conteúdo", foco visível em todos os elementos e navegação por teclado (incluindo as abas da bancada, com setas).
- Menu móvel com `aria-expanded`, fechamento com Esc e ao navegar; item de menu da seção visível marcado com `aria-current`.
- Hierarquia de títulos sem saltos (um `h1` por página), trilha de navegação nos estudos de caso.
- Formulário com rótulos, erros associados aos campos, foco no primeiro erro e status anunciado a leitores de tela.
- Contraste AA ou superior em todos os textos; alvos de toque com pelo menos 24 px (botões com 44–48 px).
- Respeita a preferência do sistema por menos animação.

**SEO**
- Título, descrição, endereço canônico e Open Graph por página (`src/hooks/useDocumentTitle.ts`).
- No build, cada estudo de caso ganha um HTML próprio em `dist/projetos/<slug>/index.html`,
  com título, descrição, canonical e imagem de compartilhamento certos. Motivo: os robôs do
  WhatsApp, LinkedIn e Facebook não executam JavaScript; sem isso, todo link compartilhado
  mostraria a prévia da página inicial. O Google já lê o conteúdo renderizado.
- `sitemap.xml` (início, estudos de caso e demonstrações) e `robots.txt` com o endereço do
  sitemap são gerados no build a partir de `site.url` e da lista de projetos.
- A página 404 recebe `noindex`.
- **Pré-renderização completa** (HTML com todo o conteúdo) foi avaliada e não é necessária
  agora: o Google indexa o conteúdo renderizado e o ganho principal (prévias corretas nas redes)
  já vem das páginas de metadados. Se no futuro o site tiver blog ou muitas páginas de conteúdo,
  vale considerar uma ferramenta de pré-renderização.

**Desempenho**
- As demonstrações são carregadas sob demanda (`React.lazy`): quem abre o portfólio não baixa o código delas.
- Capturas em WebP responsivo (`srcset` 800/1600), com `width`/`height` definidos (sem saltos de layout)
  e `loading="lazy"` fora da primeira tela; a imagem principal do estudo de caso tem prioridade alta.
- Fontes locais em WOFF2 com `font-display: swap`; nenhuma requisição a serviços externos.
