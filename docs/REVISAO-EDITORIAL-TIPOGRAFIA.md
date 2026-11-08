# Alto Code: revisão editorial e renovação tipográfica (novembro de 2026)

Ponto de partida: o código publicado no deploy `6aefd32a` (08/11/2026), já com as correções de
navegação, acessibilidade, SEO, formulário e estudos de caso. A revisão de textos e a troca de
fontes estão em commits separados, para cada etapa poder ser revisada ou desfeita sozinha.

## 1. Auditoria editorial: problemas encontrados

| # | Onde | Problema | O que foi feito |
| --- | --- | --- | --- |
| 1 | Sobre | "Estou construindo meu histórico como freelancer" desvalorizava a formação e o tempo de atuação, que não apareciam. | Formação em Análise e Desenvolvimento de Software e dois anos na área, sem dizer que foram como freelancer e sem linha do tempo. |
| 2 | Serviços | O destaque de cada cartão descrevia uma dor hipotética do cliente ("O cliente procura pelo celular e não entende…"). | Cada cartão abre com o benefício. A descrição complementar explica como funciona, sem repetir. |
| 3 | Serviços (código) | Três campos de texto (`short`, `problem`, `description`), e `short` não era exibido em lugar nenhum. | `problem` virou `benefit`; `short` saiu. IDs, categorias, links e preenchimento do formulário não mudaram. |
| 4 | Topo | O subtítulo explicava o processo (escopo, prazo, valor, testes), mas não para que servem as soluções. | Novo subtítulo: o que as soluções fazem e o acompanhamento direto. O processo fica na seção Processo. |
| 5 | Processo | As etapas não diziam como o orçamento é definido nem que o suporte depende da proposta. | Cinco etapas, da primeira conversa à entrega e suporte, com as condições ligadas à proposta. |
| 6 | Sobre | Os compromissos repetiam a frase do cartão ("Quem conversa com você é quem desenvolve") e o parágrafo sobre as demonstrações ("Transparência"). | Seis compromissos sem repetição; entraram "Combinado por escrito" e "Linguagem clara". |
| 7 | Cartões de projeto | Resumos de 190 a 230 caracteres, longos para o celular. | Resumo curto só para o cartão (92 a 111 caracteres). O resumo completo continua no estudo de caso. |
| 8 | Estudos de caso | Os textos de "Problema" repetiam ideias do resumo e eram longos. | Problemas e resumos mais diretos; quem usa, roteiro de teste, adaptações e orçamento foram mantidos. |
| 9 | SEO | A descrição dos estudos de caso tinha mais de 200 caracteres (o Google mostra cerca de 160). | Usa o resumo curto: "… Projeto demonstrativo da Alto Code." |
| 10 | Projetos | O título "Trabalhos para explorar e testar" podia sugerir trabalhos feitos para clientes. | "Projetos para explorar e testar". |
| 11 | Perguntas frequentes | A pergunta sobre atualização prometia sem condição ("Vou conseguir atualizar o site depois? Sim."). | "Sim, nas partes combinadas na proposta." O suporte também fica condicionado à proposta. |

Ficaram como estavam, por já estarem claros: título do topo, contato e formulário (rótulos, erros,
avisos e alternativas), rodapé, `site.description`, funcionalidades e roteiros dos estudos de caso.

## 2. Principais textos: antes e depois

**Topo (subtítulo)**
- Antes: "Desenvolvedor independente: você fala direto com quem desenvolve, aprova escopo, prazo e valor antes de começar e recebe a solução testada no celular e no computador."
- Depois: "Desenvolvo soluções para apresentar seus serviços, organizar informações e simplificar tarefas. Você acompanha o projeto diretamente comigo, da proposta à entrega."
- Por quê: é a sua sugestão, com "seus" antes de "serviços". O título já diz o que é feito, e o subtítulo agora diz para que serve e como é o atendimento. As garantias de processo continuam na seção Processo e nos compromissos.

**Sobre (texto principal)**
- Antes: "Sou desenvolvedor independente e respondo pessoalmente por cada projeto da Alto Code… Estou construindo meu histórico como freelancer. Por isso, os cinco projetos deste portfólio são demonstrativos autorais…"
- Depois:
  1. "Sou formado em Análise e Desenvolvimento de Software e atuo há dois anos na área de desenvolvimento. À frente da Alto Code, desenvolvo sites, sistemas web, planilhas e automações para as necessidades de pequenos negócios."
  2. "Meu trabalho une conhecimento técnico, planejamento e atenção aos detalhes para criar soluções funcionais, organizadas e fáceis de usar."
  3. "Os projetos deste portfólio são demonstrações autorais, com empresas e dados fictícios, criadas para mostrar na prática diferentes funcionalidades e possibilidades de aplicação."

**Compromissos (Sobre)**

| Antes | Depois |
| --- | --- |
| Atendimento direto | Atendimento direto: "Você fala com quem desenvolve, sem intermediários." |
| Entender antes de propor | Entender antes de propor: "A solução parte de como o seu negócio funciona hoje." |
| Proposta por escrito | **Combinado por escrito:** "Escopo, prazo e valor ficam claros antes do início, assim como o que não está incluído." |
| Revisado e testado | Revisado e testado (texto mantido, com a menção à inteligência artificial) |
| Fácil de manter | Fácil de manter: "Soluções organizadas, com orientações por escrito para usar e atualizar." |
| Transparência (repetia o parágrafo sobre as demonstrações) | **Linguagem clara:** "Explicações sem termos técnicos desnecessários, para você decidir com segurança." |

**Serviços (destaque do cartão)**

| Serviço | Antes (dor hipotética) | Depois (benefício) |
| --- | --- | --- |
| Sites e landing pages | O cliente procura pelo celular e não entende rápido o que você oferece nem como pedir um orçamento. | Sites que apresentam seu negócio com clareza, valorizam seus serviços e facilitam o contato com novos clientes. |
| Sistemas web | Cadastros, pedidos e controles espalhados em cadernos, mensagens e arquivos diferentes. | Organize cadastros, pedidos e controles em um sistema desenvolvido para a rotina do seu negócio. |
| Dashboards | Você registra vendas e gastos, mas não consegue ver com rapidez o resultado do período. | Acompanhe receitas, despesas e resultados em painéis com indicadores e gráficos fáceis de consultar. |
| Planilhas | Planilhas com contas manuais, que quebram com facilidade e que só uma pessoa sabe usar. | Simplifique seus controles com planilhas organizadas, cálculos automáticos e informações sempre à mão. |
| Automação | Horas por semana copiando dados de um lugar para outro e refazendo os mesmos documentos. | Reduza tarefas repetitivas e organize o fluxo de informações com soluções de automação. |
| Ferramentas | Orçamentos montados de cabeça, com preços diferentes para o mesmo serviço. | Calcule preços, padronize orçamentos e prepare propostas com mais agilidade e consistência. |

As descrições complementares agora dizem como funciona. Por exemplo, em Automação: "O trabalho
começa pelo mapeamento da rotina atual, para automatizar só o que faz sentido no seu caso."

**Processo**

| Antes | Depois |
| --- | --- |
| Entendimento da necessidade | Primeira conversa: formulário ou WhatsApp; perguntas antes de propor. |
| Planejamento da solução | Proposta e orçamento: escopo, etapas, prazo e valor por escrito, definidos pelo tamanho e pela complexidade; início só com aprovação. |
| Desenvolvimento | Desenvolvimento acompanhado: atualização a cada etapa, revisão antes da próxima. |
| Testes e ajustes | Testes e ajustes: celular e computador; ajustes previstos na proposta. |
| Entrega e orientações | Entrega e suporte: arquivos, acessos e orientações; suporte e atualizações conforme a proposta. |

**Cartões de projeto (resumo curto, novo campo `teaser`)**
- Prime Imóveis: "Catálogo de imóveis com busca, filtros combinados e página de cada imóvel com galeria e consulta pronta."
- Gestão360: "Painel financeiro com receitas, despesas e resultado, gráficos que seguem os filtros e exportação para o Excel."
- Nova Serviços: "Página de serviços que conduz o visitante até um pedido de orçamento completo, com formulário validado."
- Arena Store: "Loja virtual com busca, tamanhos e estoque, carrinho salvo no navegador e checkout simulado."
- OrçaFácil: "Calculadora de orçamentos com regras de preço fixas, desconto e proposta pronta para imprimir ou salvar em PDF."

## 3. Comparação tipográfica

Método: as quatro combinações foram aplicadas ao mesmo build do site, com os textos revisados.
Só as variáveis `--font-title` e `--font-text` mudaram; tamanhos, pesos (600 nos títulos) e
espaçamentos ficaram iguais. As capturas estão em computador (1440 px) e celular (390 px) e
cobrem topo, projetos, serviços, Sobre, formulário com botões e rodapé. Em 320, 390, 768, 1024 e
1440 px foram medidos: linhas do título principal, moldura dentro da tela, rolagem lateral, altura
dos cartões de serviço, linhas dos títulos e altura da página.

| Opção | Arquivos (WOFF2, pesos 400–700) | O que as capturas e as medições mostraram |
| --- | --- | --- |
| Antes: Sora + Onest | 27 + 27 KB | Referência. |
| **A: Space Grotesk + DM Sans** | 21 + 22 KB | Título principal com as mesmas quebras e a mesma altura em todas as larguras; moldura inteira; a página varia no máximo 152 px (em cerca de 19.800 px, a 320 px). Desenho técnico que combina com a Azeret Mono e com as molduras. |
| B: Manrope + DM Sans | 22 + 22 KB | No computador, o título quebra em outro ponto ("planilhas sob medida" na segunda linha) e "sistemas e" fica apertado com o espaçamento atual. Mais discreta, com menos personalidade. |
| C: Plus Jakarta Sans + DM Sans | 19 + 22 KB | Letras largas: com o espaçamento negativo atual, "sistemas e planilhas" quase se encosta. Seria preciso refazer o espaçamento de todos os títulos. |

Nenhuma das três criou rolagem lateral ou tirou a moldura da tela. A diferença entre elas está na
harmonia com o desenho e no ajuste fino de espaçamento que cada uma exigiria.

**Escolha: A, Space Grotesk + DM Sans** (também a sua preferência inicial):
1. Funciona com a escala tipográfica atual sem novo ajuste: o título principal mantém as mesmas quebras e a mesma altura da Sora em 320, 390, 768, 1024 e 1440 px, e os títulos de seção e de projeto ocupam o mesmo número de linhas.
2. O caráter técnico de Space Grotesk combina com a Azeret Mono das etiquetas e com as molduras de seleção da marca.
3. DM Sans é muito legível nos textos de 15 a 17 px do celular (cartões, formulário, perguntas).
4. Tem 11 KB a menos que a combinação anterior.

## 4. Implementação
- `public/fonts/space-grotesk-latin-wght-v1.woff2` (21 KB) e `dm-sans-latin-wght-v1.woff2` (22 KB), do Fontsource 5.3.0 (subconjunto latino com todos os acentos do português). Foram reduzidas ao eixo de peso 400–700; o DM Sans tem o tamanho óptico fixado em 14, adequado a textos de 15 a 17 px. Licença SIL OFL 1.1, que permite uso comercial, em `public/fonts/licencas/`.
- Os arquivos de Sora e Onest saíram do pacote. A Azeret Mono continua nas etiquetas, e as demonstrações mantêm as fontes próprias (Bricolage e IBM Plex).
- `font-display: swap`, pré-carregamento das três fontes no `index.html` e fontes de reserva com métricas calculadas a partir dos arquivos (largura média de um texto em português, no peso usado: 600 nos títulos e 400 nos textos), para o texto não "pular" enquanto a fonte carrega.
- Escala, pesos, alturas de linha e espaçamento entre letras foram mantidos. As medições mostraram que não precisavam de ajuste com a Space Grotesk.
- O logotipo: o monograma AC é desenhado em traços e não mudou. O nome "Alto Code" ao lado dele segue a fonte de títulos, como antes, e agora aparece em Space Grotesk.
