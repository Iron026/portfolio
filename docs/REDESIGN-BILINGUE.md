# Redesign e site bilíngue (novembro de 2026)

Versão de trabalho na branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.**
Base de comparação ("antes"): commit `ef95d62`, a última versão antes do redesign (revisão
editorial e fontes Space Grotesk + DM Sans).

## 1. Resumo

- **Direção visual escolhida: B, "Editorial Tech".** Seções claras e escuras alternadas, títulos
  grandes, mídia dos projetos em destaque. As duas direções foram montadas no site real e
  comparadas nas mesmas telas (seção 3).
- **Identidade preservada:** nome Alto Code, monograma AC, azul-marinho, verde-água, Space Grotesk
  (títulos), DM Sans (texto), Azeret Mono (detalhes técnicos) e a moldura de seleção.
- **Site em português e inglês**, incluindo as cinco demonstrações, documentos gerados (proposta do
  OrçaFácil, CSV do Gestão360, mensagens de orçamento), capturas e vídeos em inglês gravados das
  próprias demonstrações em inglês.
- **SEO por idioma:** HTML próprio para cada página pública nos dois idiomas, com `lang`, canonical,
  `hreflang` e `og:locale`; sitemap com as duas versões.
- **Testes:** 319 verificações de unidade, 201 do build e 1.599 no navegador (21 arquivos), todas
  aprovadas; axe-core sem violações em 56 combinações de página e largura.
- **Desempenho:** igual à versão anterior na medição local (seção 8), depois de corrigir uma
  regressão encontrada na própria medição.

## 2. Auditoria da versão anterior

O que foi observado na versão `ef95d62` e motivou as mudanças:

| Área | Situação encontrada |
| --- | --- |
| Idioma | Só português. Sem `hreflang`, sem versão em inglês das demonstrações, capturas e vídeos. |
| Início | Título e bancada bons; a bancada sem moldura própria, competindo com o fundo. |
| Projetos | Um projeto por linha, todos com o mesmo peso; a vitrine não diferenciava o projeto principal. |
| Serviços | Cartões iguais; a categoria (presença, gestão, processos) aparecia só no texto. |
| Processo | Lista de etapas sem indicação visual de sequência. |
| Sobre | Texto correto, mas sem um bloco que resumisse formação, experiência e contato. |
| Estudos de caso | Conteúdo completo, porém em blocos de texto parecidos entre si; capturas sem moldura de dispositivo. |
| Acessibilidade | Lighthouse 97 no início: contraste insuficiente em um texto e nomes acessíveis da bancada e das prévias que não começavam pelo texto visível (WCAG 2.5.3). |
| Desempenho | Lighthouse local 76 a 78 (celular). Bom ponto de partida; serviu de limite para não piorar. |

## 3. Comparação das direções A e B

As duas direções foram aplicadas ao site real (mesmo conteúdo, mesmos componentes) e capturadas em
computador e celular: início, projetos, serviços, Sobre e estudo de caso.

| | A — Premium Tech | B — Editorial Tech (escolhida) |
| --- | --- | --- |
| Base | Escuro em quase todas as seções | Alternância de seções claras e escuras |
| Leitura | Textos longos cansam em fundo escuro | Textos longos em fundo claro, contraste mais confortável |
| Projetos | Capturas claras "estouram" sobre o fundo escuro | Capturas ganham moldura de navegador e fundo na cor do projeto |
| Estudo de caso | Painéis escuros parecidos entre si | Abertura escura, corpo claro, painel "Teste você mesmo" em destaque |
| Risco | Ar de template "tech" genérico | Mais próximo de um estúdio, mantém o azul-marinho como âncora |

**Por que B:** os visitantes são donos de pequenos negócios que vão ler estudos de caso e
descrições de serviço; B mantém essa leitura confortável, dá mais destaque às capturas reais e
preserva o contraste noite/papel que já era da marca. O código da direção A foi removido depois da
escolha (commit `e876ccc`).

## 4. O que mudou no portfólio

- **Sistema visual 2:** tons `.tone-light` e `.tone-dark` com variáveis semânticas; o mesmo botão,
  cartão ou etiqueta funciona nos dois fundos (detalhes no README, seção 10).
- **Início:** bancada (Site, Planilha, Automação, Sistema) emoldurada com etiqueta da moldura de
  seleção; continua funcional e acessível por teclado. Faixa "Veja funcionando" com atalhos para as
  cinco demonstrações.
- **Projetos:** vitrine em mosaico (7/5 + 4/4/4 colunas), capturas reais em moldura de navegador,
  celular sobreposto no projeto principal, prévias em vídeo das próprias demonstrações.
- **Serviços:** seis cartões com a faixa da categoria (verde-água, azul, âmbar). IDs, links,
  parâmetros (`?servico=`) e preenchimento automático do formulário preservados.
- **Processo:** linha de progresso (horizontal no computador, vertical no celular).
- **Sobre:** cartão de Iron Cruz com formação, experiência e contato, quatro compromissos e
  ferramentas. Sem fotografia.
- **Estudos de caso:** abertura com ficha técnica, capa em moldura de navegador e celular, problema
  e objetivo, quem usa, funcionalidades, painel "Teste você mesmo" com roteiro de quatro passos,
  decisões de implementação, galeria em molduras, adaptações, próximos passos e navegação entre casos.
- **404, carregamento e erro** no idioma da página.

**Sobre (texto publicado):** "Sou Iron Cruz, formado em Análise e Desenvolvimento de Software, com
dois anos de atuação na área de desenvolvimento." Os dois anos não são apresentados como
exclusivos da Alto Code nem como trabalho autônomo. Os projetos continuam identificados como
demonstrações autorais, com empresas e dados fictícios.

## 5. Demonstrações

As cinco demonstrações estão em português e inglês, com o seletor na barra superior. Regras,
cálculos, filtros, dados e chaves salvas no navegador **não mudaram**; os arquivos de dados ganharam
um parâmetro de idioma (padrão: português), por isso todos os testes de unidade anteriores continuam
valendo sem alteração.

| Demonstração | Em inglês |
| --- | --- |
| Gestão360 | Painel, gráficos, filtros e busca; CSV com cabeçalhos em inglês, vírgula como separador e data ISO |
| Prime Imóveis | Lista, filtros, busca por características em inglês, detalhe, galeria e mensagem de consulta |
| Nova Serviços | Página, serviços, perguntas, formulário, validação e mensagem de orçamento |
| Arena Store | Vitrine, produto (tamanhos S/M/L/XL), carrinho, checkout simulado |
| OrçaFácil | Cálculo detalhado, proposta impressa, resumo copiado, catálogo; números com ponto decimal (2.5, 89.90) |

Valores continuam em reais nas duas versões; só a escrita do número muda.

Ajustes de uso feitos (com motivo funcional):
- OrçaFácil: o cálculo mostrava "Acabamento sem acabamento (+0%)"; agora mostra "Sem acabamento (+0%)".
- OrçaFácil: itens do catálogo de exemplo aparecem traduzidos; nomes digitados pela pessoa ficam
  como foram escritos, e editar um item sem mudar o nome não grava a tradução por cima.
- Gestão360 e OrçaFácil: dois links/botões com menos de 24 px de altura foram aumentados.

## 6. Site bilíngue

- **Rotas:** português na raiz; inglês em `/en/` (`/en/projects/<slug>`, `/en/demos/<nome>`,
  `/en/demos/arena-store/product/AR-03`, `/en/demos/arena-store/cart`).
- **Seletor PT/EN:** mesma página no outro idioma, mantendo filtros e âncora; o botão Voltar do
  navegador retorna ao idioma anterior. Sem redirecionamento pelo idioma do navegador.
- **Não traduzidos:** Alto Code, Iron Cruz, nomes dos projetos e das empresas fictícias, códigos e
  identificadores internos.
- **Organização:** dicionários tipados (`src/i18n/ui.ts`, `*.en.ts`, `*-i18n.ts` de cada
  demonstração); o inglês usa o tipo do português, então um texto faltando é erro de compilação.
- **Capturas e vídeos em inglês:** `scripts/capturas.mjs … en` e `scripts/previas.mjs … en` gravam
  as próprias demonstrações em inglês em `public/projetos/<slug>/en/`; a imagem de compartilhamento
  em inglês (`og.jpg`) é gerada a partir dessas capturas. Nenhuma tela em português é exibida como
  se fosse a versão em inglês.
- **Netlify:** 23 HTML gerados no build (início, 5 estudos de caso e 5 demonstrações, nos dois
  idiomas, mais a 404); `public/_redirects` envia `/en/*` ao HTML em inglês e o restante ao app.

## 7. Testes executados

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319, em 6 arquivos (inclui 14 casos novos em inglês do OrçaFácil) |
| Build oficial (`npm run build`) | Concluído sem erros |
| Build (`npm run verify:dist`) | 201 de 201 (inclui lang, canonical, hreflang e sitemap das 11 páginas em inglês) |
| Navegador (`npm run test:e2e`) | 1.599 de 1.599, em 21 arquivos |
| Novo: `idiomas.test.mjs` | 123: 15 rotas em inglês sem texto em português, capturas da pasta `/en/`, seletor, Voltar, 404, sem redirecionamento |
| Responsivo (320, 390, 768, 1024, 1440 px) | 130: portfólio e demonstrações, português e inglês, sem rolagem lateral |
| Acessibilidade (testes próprios) | 265: 24 páginas (PT e EN, incluindo as demonstrações), títulos, nomes, rótulos, alvos de 24 px |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | 0 violações em 28 páginas × 2 larguras (1280 e 390 px) |

Testes que precisaram ser atualizados por causa do novo layout (o comportamento testado continua o
mesmo): botão "Ver detalhes" virou "Estudo de caso"; numeração das seções ganhou o total
("01 / 06"); quatro compromissos na seção Sobre; total da planilha localizado pelo nome acessível;
prévia em vídeo verificada na linha de três cartões do mosaico.

Problemas encontrados pelos testes e corrigidos nesta etapa:
- Rolagem lateral de até 118 px nos estudos de caso em 320 e 390 px (colunas e etiquetas longas).
- Contraste 2,4:1 nos números das decisões do OrçaFácil sobre o painel escuro.
- Seletor PT/EN com nome acessível diferente do texto visível ("EN").
- Rótulos do diagrama da seção de contato em português na versão em inglês.

## 8. Desempenho (mesmo método antes e depois)

Lighthouse 12.6.1, perfil de celular simulado, servidor local sem compressão, três execuções por
página. É uma medição de laboratório local, **não** do site publicado.

| Página | Versão | Desempenho | FCP | LCP | TBT | CLS | Transferido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Antes | 77, 76, 78 | 3,5–3,7 s | 4,3–4,5 s | 50–70 ms | 0 | 658 KiB |
| Início | Depois | 76, 76, 76 | 3,6–3,7 s | 4,4 s | 50–80 ms | 0 | 670 KiB |
| Início em inglês | Depois | 75, 76, 76 | 3,8 s | 4,4–4,5 s | 60–70 ms | 0 | 667 KiB |
| Estudo de caso Gestão360 | Antes | 77, 76, 76 | 3,6 s | 4,4–4,5 s | 30–60 ms | 0 | 773 KiB |
| Estudo de caso Gestão360 | Depois | 76, 76, 77 | 3,6–3,8 s | 4,3–4,5 s | 50–60 ms | 0 | 625 KiB |

A primeira medição do redesign deu 73 e FCP de 4,1 s. A causa: a capa dos projetos passou a
importar a prévia desenhada em código, que levava os dados das quatro demonstrações para o
JavaScript principal (+56 KB), mesmo sem uso. A prévia agora é carregada à parte, e o JavaScript
principal voltou a 390 KB (antes: 387 KB).

Lighthouse, demais categorias (uma execução): início **antes** 97 / 100 / 100 (acessibilidade,
boas práticas, SEO); **depois** 100 / 100 / 100 em português e em inglês; estudo de caso 100 / 100 / 100.

## 9. Limitações e pendências

- [ ] **Revisar os textos em inglês**, principalmente Sobre, serviços e estudos de caso. Foram
      escritos com cuidado, mas não passaram por revisão de um falante nativo.
- [ ] **Publicação:** nada foi publicado. Para publicar, use o pacote do build oficial (`dist/`) e
      depois rode a verificação no ar (`docs/VERIFICACAO-POS-PUBLICACAO.md`), incluindo `/en/`.
- [ ] As imagens de compartilhamento **em português** (`og.jpg`) são as anteriores; só as em inglês
      foram geradas agora.
- [ ] O axe deixou itens para conferência manual (contraste sobre degradês e sobre capturas;
      links dentro de parágrafos). Recomenda-se conferir em um celular real.
- [ ] Nomes de bairros reais (ex.: Pituba) aparecem em dados de exemplo das demonstrações; a cidade
      (Nova Aurora) é fictícia.
- [ ] As medições de desempenho são locais; os números do site publicado só podem ser comparados
      depois da publicação.
- [ ] Ajustes de usabilidade nas demonstrações foram pontuais (seção 5); não houve redesenho das
      demonstrações, para não alterar regras e cálculos já testados.
- Caixa em Dia e FluxoPronto continuam apenas como propostas (`docs/PROPOSTA-NOVOS-PROJETOS.md`).

## 10. Commits

| Commit | Etapa |
| --- | --- |
| `adbfe32` | Base do redesign e do site bilíngue + comparação das direções A e B |
| `e876ccc` | Direção B escolhida; código da direção A removido |
| `ee6583f`, `ac9ba6d`, `fd72240`, `6a4b3b9`, `655ebc8` | Demonstrações em português e inglês (uma por commit) |
| `9f9e81c`, `b6f9aa9` | Rolagem lateral nos estudos de caso; testes ajustados ao novo layout |
| `b5acbb5` | HTML estático por idioma, hreflang e sitemap |
| `019c004` | Capturas, vídeos e imagens de compartilhamento em inglês |
| `bb95b42`, `75ce793` | Teste do site bilíngue; acessibilidade (contraste, alvos, seletor) |
| `5b725e2` | Desempenho: prévia desenhada fora do JavaScript principal |
