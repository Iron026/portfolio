# Evolução visual criativa, projetos em detalhes e correções no celular (novembro de 2026)

Branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.**
Base de comparação ("antes"): commit `97572ef`, a versão bilíngue Editorial Tech.

## 1. Diagnóstico da versão anterior

Medido no build oficial da versão `97572ef`, em telas reais (Playwright, 390 e 1440 px):

| Área | Problema |
| --- | --- |
| Prévia em vídeo (Prime Imóveis e os outros quatro) | A descrição ficava **dentro da moldura escura**, em cinza (`text-fg-muted` do tom claro) sobre azul-marinho: contraste ruim e texto colado na borda. Mesmo componente nos cinco projetos. |
| Legendas das capturas | "Captura · /demos/imoveis", "Captura real · /demos/imoveis/PI-101": linguagem de documentação, não de apresentação. A barra do navegador repetia a rota. |
| Nome das páginas | "Estudo de caso" em botões, títulos, contadores e metadados (PT e EN). |
| Início | Bancada pequena em relação ao título; o título não citava automações; nada na primeira tela respondia à interação além do próprio painel. |
| Vitrine | Cinco cartões do mesmo formato. No celular, cada um com dois botões grandes e um link: 4.825 px de cartões quase idênticos. |
| Serviços | Seis cartões iguais; a categoria aparecia só como texto pequeno. |
| Projeto em detalhes | Ficha técnica de 5 linhas antes da primeira imagem; problema, objetivo, funcionalidades, bastidores e galeria em blocos parecidos; "Testar demonstração" três vezes. Prime Imóveis no celular: **10.427 px**. |
| Celular | Página inicial com **17.920 px**; rodapé com 1.616 px (listas empilhadas); seletor de idioma das demonstrações sozinho numa terceira linha; seletor dentro de um parágrafo (HTML inválido). |
| Cartão "Próximo" | Texto espremido numa coluna de 8,5 rem (a ordem das colunas não acompanhava a inversão). |

## 2. Proposta criativa

**A moldura de seleção ganha comportamento.** Até aqui, a moldura (linha fina e quatro alças) era um
enfeite estático da marca. Nesta versão ela vira a linguagem de interação do site inteiro: é o
"objeto selecionado" de uma ferramenta de criação, e sempre aponta para aquilo que o visitante
escolheu.

- No Início, seleciona a **palavra** da solução escolhida na bancada.
- Na vitrine, seleciona o **projeto** que está na tela.
- Na página de cada projeto, seleciona a **área da tela** onde está a funcionalidade escolhida.
- Nos serviços, aparece ao apontar ou focar uma linha.

Por quê: é um elemento que só a Alto Code tem (nasce do monograma), comunica "construção de produto
digital" sem ilustrações genéricas e resolve problemas reais de navegação (onde estou, o que estou
vendo, onde fica isso na tela). Não há efeito decorativo novo: cada movimento responde a uma
escolha do visitante e funciona igual sem animação.

## 3. As três inovações

### A) Início: bancada de criação
- **Como funciona:** ao escolher Site, Planilha, Automação ou Sistema, a moldura percorre o título até
  "Sites", "planilhas", "automações" ou "sistemas"; um painel de inspeção ao lado mostra o serviço
  correspondente (nome, categoria, benefício), os projetos demonstrativos relacionados, quando
  existem, e o pedido de orçamento já com o serviço escolhido. A cor da categoria (verde-água,
  azul ou âmbar) tinge a moldura, as abas e a luz de fundo. As abas têm um indicador que desliza.
- **Ganho:** a mensagem comercial continua no título (agora cita automações, como pedido) e a
  interação passa a explicar o que cada solução é e onde vê-la funcionando.
- **Honestidade:** planilhas e automações não têm projeto demonstrativo; o painel não inventa um,
  oferece o orçamento.
- **Tipo:** funcional + estética.

### B) Vitrine: índice selecionador e palcos
- **Como funciona:** no computador, um índice fixo à esquerda lista os cinco projetos; a moldura
  acompanha o projeto que está na tela e cada item leva ao palco correspondente. Cada palco tem a
  captura grande do computador, o celular sobreposto (alternando o lado), o fundo na cor do projeto,
  a prévia gravada e as ações (testar, conhecer o projeto, orçamento). No celular, o índice vira
  atalhos numerados no topo da seção.
- **Ganho:** os cinco projetos ficam sempre visíveis (sem carrossel), as capturas reais ganham
  tamanho e desktop e celular aparecem juntos.
- **Tipo:** funcional + estética.

### C) Projeto em detalhes: tour de funcionalidades
- **Como funciona:** a página ganha um tour em abas. Ao escolher uma funcionalidade, a captura real
  correspondente aparece e a moldura enquadra a área exata da tela (o resto escurece levemente); a
  última parada mostra o celular. Setas, Home e End no teclado. As áreas e os textos estão em
  `src/data/tour.ts` e foram conferidos contra o que cada demonstração faz.
- **Página reorganizada como apresentação de produto:** abertura enxuta (o que é, para quem, testar,
  pedir algo parecido, "Ver funcionalidades"), capa, para que serve (problema, objetivo e quem usa),
  tour, como experimentar, adaptar ao seu negócio, detalhes técnicos recolhidos e outros projetos.
- **Ganho:** funcionalidades apresentadas junto das capturas, menos repetição e páginas mais curtas.
- **Tipo:** funcional + estética.

## 4. Correções pedidas

| Pedido | O que foi feito | Tipo |
| --- | --- | --- |
| Contraste da descrição da prévia | Descrição e botão de reprodução saem da moldura escura e ficam abaixo dela, sobre o fundo claro; contraste medido no teste (mínimo 4,5:1). Corrigido na estrutura compartilhada pelos cinco projetos. | funcional |
| Legendas técnicas | "Captura · /rota" removido; a legenda descreve a imagem. A barra decorativa do navegador mostra o nome do projeto (e a tela, no tour), não a rota. As rotas continuam nos links. | editorial |
| "Estudo de caso" | "Conheça o projeto" (botão), "Projeto em detalhes 01/05" (contador e título da página), "Ver funcionalidades" (atalho), "Conheça outros projetos". EN: "Explore project", "Project details", "View features", "Discover other projects". Títulos do HTML gerado no build também. URLs e chaves internas mantidas. | editorial |
| label-content-name-mismatch | Revisto: bancada, prévias e seletor de idioma têm o nome acessível começando pelo texto visível; axe e Lighthouse sem ocorrências. | funcional |

## 5. Demais áreas

- **Serviços:** índice editorial agrupado pelas três categorias, uma linha por serviço com nome,
  benefício, orçamento, detalhes sob demanda, projetos relacionados e ilustração animada. Dentro
  dos limites de altura dos testes (computador < 1.800 px, celular < 3.600 px). *Estética.*
- **Sobre:** a primeira frase (formação e experiência) vira declaração tipográfica; o cartão de Iron
  Cruz acompanha a leitura no computador. Texto mantido. *Estética.*
- **Rodapé:** listas em duas colunas no celular (1.616 → 1.113 px). *Estética.*
- **Ritmo vertical no celular:** seções com 64 px de respiro em vez de 80; tecnologias saem dos palcos
  da vitrine no celular (seguem nos detalhes técnicos). *Estética.*
- **Demonstrações:** barra superior padronizada nas quatro que têm barra própria (trilha e PT/EN na
  primeira linha no celular, aviso e link na segunda); seletor fora do parágrafo. Regras, cálculos e
  dados não mudaram. *Funcional (HTML válido) + estética.*
- **Processo, Perguntas e Contato:** avaliados e mantidos; já estavam claros e uma mudança só
  visual não traria ganho.

## 6. Classificação das mudanças

| Mudança | Estética | Funcional | Editorial |
| --- | :---: | :---: | :---: |
| A) Bancada de criação (moldura no título, painel de inspeção, cor da categoria) | ✓ | ✓ | |
| B) Vitrine com índice e palcos | ✓ | ✓ | |
| C) Tour de funcionalidades e página reorganizada | ✓ | ✓ | ✓ |
| Contraste da descrição da prévia | | ✓ | |
| Legendas sem rotas técnicas | | | ✓ |
| "Projetos em detalhes" no lugar de "Estudo de caso" | | | ✓ |
| Título do Início cita automações | | | ✓ |
| Serviços em índice por categoria | ✓ | | |
| Sobre (declaração e cartão que acompanha) | ✓ | | |
| Rodapé e ritmo vertical no celular | ✓ | | |
| Barra das demonstrações padronizada e HTML válido | ✓ | ✓ | |
| Cartão "Próximo" com a coluna certa | | ✓ | |

## 7. Alturas medidas (mesmo build, mesma janela)

| Página | Antes (`97572ef`) | Depois |
| --- | --- | --- |
| Início, 390 px | 17.920 px | 17.120 px |
| Início, 1440 px | 9.723 px | 12.685 px |
| Vitrine, 390 px | 4.825 px | 4.660 px |
| Vitrine, 1440 px | 2.325 px | 5.171 px |
| Rodapé, 390 px | 1.616 px | 1.113 px |
| Prime Imóveis, 390 px | 10.427 px | 7.270 px |
| OrçaFácil, 390 px | 10.380 px | 7.245 px |

No computador, a vitrine ficou mais alta **por escolha**: cada projeto ganhou um palco com a captura
grande (era um dos pedidos), e o índice fixo permite ir direto a qualquer projeto. No celular, onde
a rolagem pesa mais, todas as páginas medidas ficaram mais curtas.

## 8. Testes executados

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319 |
| Build oficial (`npm run build`) | concluído sem erros |
| Build (`npm run verify:dist`) | 201 de 201 (também no ZIP) |
| Navegador (`npm run test:e2e`) | **2.016 de 2.016, em 22 arquivos** |
| Novo: `inovacoes.test.mjs` | 417: moldura do título em cada aba e painel com o serviço certo (PT/EN, 1440 e 390 px, teclado, sem transição com movimento reduzido); índice da vitrine acompanhando a rolagem e levando ao palco; cada parada do tour com a captura esperada (pasta `/en/` em inglês) e a moldura dentro da imagem; nenhuma legenda com rota; nenhum "estudo de caso"; descrição da prévia fora da moldura com contraste mínimo de 4,5:1 |
| Responsivo | 130: 320, 390, 768, 1024 e 1440 px, PT e EN, sem rolagem lateral |
| Acessibilidade (testes próprios) | 265: 24 páginas PT e EN, incluindo as demonstrações |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | **0 violações** em 28 páginas × 2 larguras; itens para conferência manual: contraste sobre degradês e capturas, links dentro de parágrafos |
| Lighthouse, acessibilidade / boas práticas / SEO | 100 / 100 / 100 antes e depois (Início PT e EN, Prime Imóveis, Arena Store EN) |

Testes antigos atualizados porque o texto ou a estrutura mudou (o comportamento testado é o mesmo):
botão "Conheça o projeto" no lugar de "Estudo de caso", títulos "projeto em detalhes" no HTML gerado,
critério de "sem transição" aceitando 1 ms (o CSS global de movimento reduzido usa 0,001 s).
Os limites de altura dos serviços (computador < 1.800 px, celular < 3.600 px) foram mantidos: o layout
foi ajustado até caber neles.

## 9. Desempenho (mesmo método antes e depois)

Lighthouse 12.6.1, celular simulado, servidor local sem compressão, três execuções por página
("depois" medido no commit `ea36463`; o ajuste seguinte só muda espaçamentos).
Medição de laboratório, não do site publicado.

| Página | Versão | Nota | FCP | LCP | TBT | CLS | Transferido |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Antes | 76 · 76 · 76 | 3,6–3,7 s | 4,4 s | 50–80 ms | 0 | 670 KiB |
| Início | Depois | 74 · 73 · 74 | 3,8 s | 4,6–4,8 s | 70–100 ms | 0 | 686 KiB |
| Início (EN) | Depois | 75 · 74 · 74 | 3,6–3,8 s | 4,6–4,8 s | 70–120 ms | 0 | 683 KiB |
| Prime Imóveis | Antes | 75 · 75 · 76 | 3,7–3,8 s | 4,3–4,5 s | 70–90 ms | 0 | 630 KiB |
| Prime Imóveis | Depois | 73 · 73 · 73 | 3,9 s | 4,7–4,8 s | 70–80 ms | 0 | 853 KiB |

**Há uma piora pequena e real**, de 2 a 3 pontos e cerca de 0,3 s no LCP simulado. A primeira
medição desta versão era pior (Início 72, LCP 4,9–5,1 s); foram corrigidos:
- prioridade alta indevida no primeiro palco;
- capturas de celular baixadas antes da hora (agora montadas perto da tela);
- tour e seus dados no JavaScript principal (agora carregados à parte).

Uma tentativa foi descartada: carregar a página inteira do projeto à parte causou deslocamento de
layout (CLS 0,2).

O que sobra vem do Início mais rico (painel de inspeção, medição da moldura) e de 8 KB a mais de CSS.

Na página do projeto, os 220 KiB a mais são a prévia em vídeo, que agora entra na primeira tela e
começa a tocar sozinha (comportamento previsto, com prioridade baixa; não toca com economia de dados
nem com as animações pausadas).

## 10. Pendências e limitações

- [ ] **Aprovar e publicar.** Nada foi publicado. Use o ZIP do build oficial no Netlify Drop e, depois,
      a verificação no ar (`docs/VERIFICACAO-POS-PUBLICACAO.md`).
- [ ] **Revisar os textos novos em inglês** (painel de inspeção, tour, categorias dos serviços).
- [ ] Conferir em um celular real o contraste sobre degradês e capturas (itens que o axe deixa para
      revisão manual).
- [ ] Decidir se a prévia em vídeo deve tocar sozinha na página do projeto (hoje toca; custa ~195 KiB).
- [ ] Ao refazer capturas (`scripts/capturas.mjs`), conferir as áreas do tour em `src/data/tour.ts`
      (o teste acusa moldura fora da imagem, mas não percebe uma área deslocada dentro dela).
- As imagens de compartilhamento em português (`og.jpg`) são as anteriores.
- Processo, Perguntas e Contato foram avaliados e mantidos.
- O Gestão360 mantém a barra lateral própria (layout diferente das outras quatro demonstrações).
- Caixa em Dia e FluxoPronto continuam apenas como propostas.

## 11. Commits desta etapa

| Commit | Conteúdo |
| --- | --- |
| `d8b853b` | Inovação A (Início) e linguagem "Projetos em detalhes" |
| `0df1ea3` | Inovação B (vitrine) |
| `87ad9f2` | Inovação C (tour) e correções de contraste e legendas |
| `dbca83f` | Serviços em índice por categoria |
| `431e564` | Sobre, rodapé, ritmo no celular, barras das demonstrações |
| `03e3f7e` | Teste das inovações (`inovacoes.test.mjs`) |
| `949249a` | README |
| `ea36463`, `0ca7ab3` | Desempenho e espaçamento da vitrine |
