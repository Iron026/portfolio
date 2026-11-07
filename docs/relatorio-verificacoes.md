# Alto Code — relatório da revisão final (26/10/2026)

## Tipografia aplicada (Proposta A)
- Unbounded (títulos), Onest (textos e interface) e Azeret Mono (detalhes técnicos), em WOFF2 locais em `public/fonts/`.
- São arquivos variáveis com o subconjunto latino e as setas ← → ↗, cerca de 95 KB no total. Têm pré-carregamento no `index.html`, `font-display: swap`, cache de um ano (`public/_headers`) e fontes de reserva com métricas ajustadas.
- Pesos da Unbounded: H1 500, H2 450, H3 450, H4/cartões 400, logotipo 600. Menu do celular, números do processo e textos da bancada passaram de 600 para 500.
- A moldura de "sob medida" ganhou margens: a palavra seguinte fica a 7,8 px no celular e as alças não encostam mais na linha de cima, em nenhuma largura de 320 a 1440 px.
- A Syne e a Proposta B foram removidas. Paleta, monograma AC, ordem das seções e tipografia das demonstrações estão sem alterações (2.870 estilos das demos comparados, 0 diferenças).

## Verificação das fontes (página real, Chromium)
- Páginas verificadas: início, dois estudos de caso e a página 404, em 320, 390, 768, 1024 e 1440 px.
- 100% dos textos do portfólio usam Unbounded, Onest ou Azeret Mono, e as três aparecem como carregadas.
- Cada arquivo é baixado uma única vez, com resposta 200.
- Todos os 89 caracteres usados no texto existem nas três fontes, então nenhum caractere cai em fonte substituta.

## Testes executados (todos passaram)
| Suíte | Resultado |
| --- | --- |
| Portfólio (navegação, rotas, links) | 51/51 |
| Compatibilidade de URLs (hash e limpa) | 7/7 |
| Refinamentos (hero, cartões, celular) | 26/26 |
| Formulário de contato | 20/20 |
| Bancada interativa (novo: abas por mouse e teclado, fórmulas, 3 larguras) | 96/96 |
| Gestão360 | 41/41 |
| Prime Imóveis (+ teclado) | 59/59 + 25/25 |
| Nova Serviços (+ teclado) | 70/70 + 15/15 |
| Arena Store | 74/74 |
| OrçaFácil | 66/66 |
| Testes unitários (dados, imóveis, NS, loja, OrçaFácil), recompilados do código atual | 58 + 58 + 47 + 49 + 91 |
| Pacote para o Netlify servido localmente (rotas, SEO, sitemap, fontes) | 51/51 |

Rolagem lateral: 0 casos no portfólio e nas 5 demonstrações, em 320, 390, 768, 1024 e 1440 px. Antes, havia dois casos, corrigidos sem mudar o visual:
- Gestão360 a 320 px: a tabela acessível do gráfico (invisível) ignorava a largura de 1 px. O recorte passou para um `<div>`.
- Nova Serviços a 768 px: o menu completo não cabia no cabeçalho. Agora o botão de menu aparece até 1023 px, e o menu completo a partir de 1024 px. Abrir, navegar e fechar foram testados.

Acessibilidade:
- Um único H1 por página, sem saltos de títulos e sem IDs duplicados.
- Todos os controles têm nome, e todos os `aria-labelledby` são válidos.
- Única observação do script: o link "Pular para o conteúdo" mede 32×16 px enquanto está oculto, o que é esperado. Ele aparece completo ao receber foco.

## Limitações
- `npm install` / `npm run build` não rodaram: o registro do npm não responde neste ambiente.
- O pacote para o Netlify é uma versão de pré-visualização (esbuild + Tailwind). Ele inclui as páginas de SEO, `_redirects`, `_headers` e as fontes locais da marca. Nas demonstrações, Bricolage e IBM Plex vêm do Google Fonts.
- Para o build definitivo: `npm install && npm run build` e publicar a pasta `dist/`.
- A verificação de tipos foi feita com `tsc` usando tipos substitutos das bibliotecas, e não houve erros no código do projeto. A checagem completa acontece no `npm run build`.

---

# Preparação para publicação (26/10/2026)

- **Dependências:** `recharts` foi removida. Nenhum arquivo do projeto a importava; as
  demonstrações desenham os gráficos em SVG próprio. Todas as dependências que ficaram são usadas:
  React, React DOM, React Router, Lucide e as fontes `@fontsource` das demonstrações. Ferramentas de
  build: Vite, plugin React, Tailwind, TypeScript e os tipos do React. Nenhum import fica fora do `package.json`.
- **Node:** 22 no Netlify (`netlify.toml`) e no `.nvmrc`. `engines` passou para `>=20`, mínimo
  exigido pelo Tailwind 4.
- **Completude do ZIP:** um ZIP extraído em pasta limpa resolve todos os imports, incluindo as
  cinco demonstrações carregadas sob demanda. Além disso:
  - o `vite.config.ts` só importa pacotes declarados;
  - as páginas de SEO, o sitemap e o robots são gerados a partir da cópia extraída;
  - `tests/verificar-dist.mjs` confirma as 5 páginas de estudo de caso, os metadados, as 32 capturas WebP e as 5 imagens de compartilhamento, as fontes e as regras do Netlify.
- **Testes reproduzíveis** em `tests/` (ver `tests/README.md`). Resultado nesta versão:
  - unidade: 5 arquivos, 303 verificações;
  - navegador: 15 arquivos, 771 verificações;
  - links antigos com o build em modo `#`: 7.
- **Limitações deste ambiente:**
  - O registro do npm não está acessível aqui, então `npm install`, o `package-lock.json` e
    `npm run build` precisam ser executados no seu computador ou pelo Netlify (roteiro em `docs/PUBLICACAO.md`).
  - Os testes de navegador rodaram contra a versão de pré-visualização, que tem o mesmo código-fonte.
  - A verificação de tipos usou tipos substitutos do React. A checagem definitiva é o `tsc --noEmit`
    que abre o `npm run build`.
  - A subida automática do `vite preview` pelo `npm run test:e2e` também depende do npm e não pôde ser executada aqui.

---

# Refinamento: Sora e fundo animado (26/10/2026)

- **Títulos:** a Unbounded foi trocada pela Sora 600 (WOFF2 local de 27 KB, pesos 400–700). As fontes da marca somam cerca de 77 KB, contra 95 KB antes.
- **Tamanhos dos títulos:** H1 de 34 a 68 px, H2 de 28 a 46 px, H3 de 20 a 26 px e H4 de 18 px.
- **Quebras do título principal:** 3 linhas a 1440 px e 4 linhas a 390 px.
- **Textos e detalhes:** Onest e Azeret Mono não mudaram.
- **Comparação:** a Space Grotesk foi comparada só nas capturas e não entrou no código.
- **Fundo animado** (`src/components/ui/AmbientBackground.tsx`, estilos em `index.css`):
  - No Hero: a grade sobe 64 px a cada 48 s e há dois brilhos suaves da paleta. Em telas a partir de 1200 px aparecem pontos que pulsam nas interseções e uma moldura de seleção apagada, todos fora das áreas de texto, botões e bancada. Há também um parallax leve onde o navegador suporta.
  - Em Processo e Contato: grade parada e um único brilho lento.
  - A animação usa só `transform` e `opacity`. Com "reduzir movimento" ativado, o fundo fica parado e os pontos somem.
- **Medições** (Chromium sem GPU, ou seja, o pior caso):
  - 57–60 quadros/s a 1440 px e 60 a 390 px.
  - 0 recálculos de layout causados pela animação.
  - Cerca de 3 ms por segundo de trabalho de estilo no thread principal.
- **Testes:**
  - unidade: 303 verificações;
  - navegador: 15 arquivos, 778 verificações, incluindo fontes (Sora carregada e todos os caracteres com glifo), responsividade, acessibilidade, formulário, bancada e as 5 demonstrações;
  - os estilos calculados das demonstrações não mudaram.

---

# Evolução visual: cores e animações contextuais (26/10/2026)

**Cores.** Azul-marinho e verde-água continuam sendo a marca. Entraram três cores, cada uma com uma função fixa:
- gelo: vitrine de projetos e telas claras das ilustrações;
- lavanda acinzentada: seção Sobre e atmosfera do Contato;
- âmbar: dado em movimento e mudança de estado.

Os cartões de projeto passaram a usar as duas cores da identidade de cada demonstração. Ritmo das seções: noite, gelo, papel, noite, lavanda, branco, marinho.

**Animações por seção**

| Seção | O que se move |
| --- | --- |
| Início | grade técnica em duas profundidades (a de trás só se desloca com a rolagem), brilhos lentos e, a partir de 1200 px, pacotes de dados percorrendo linhas da grade até pontos de conexão, mais uma moldura de seleção apagada; parallax ao rolar |
| Projetos | prévias em vídeo gravadas das próprias demonstrações (filtros do Gestão360, busca da Prime Imóveis, carrinho da Arena Store, cálculo e proposta do OrçaFácil, formulário da Nova Serviços); um vídeo por vez, só quando visível; WebM com MP4 como alternativa e a captura como imagem estática |
| Serviços | seis ilustrações diferentes: página se organizando, pedidos entrando num sistema, gráfico atualizando, fórmula recalculando, registro percorrendo um fluxo e orçamento recalculado (contas reais) |
| Processo | etapas acendem ao rolar; um sinal âmbar percorre a linha e cada marcador pulsa quando ele passa |
| Sobre | mesa de trabalho com quatro módulos independentes (código sendo escrito, cartão avançando no quadro, ponto percorrendo o gráfico, automação ligando) e um sinal entre eles |
| Contato | diagrama da necessidade à mensagem, ao canal e ao orçamento, separado do formulário |

**Controle.**
- Botão "Pausar animações" no cabeçalho, com a escolha lembrada no navegador.
- Com "reduzir movimento" ativado no sistema, tudo começa parado, e as prévias não tocam nem são baixadas.
- O que está fora da tela ou com a aba em segundo plano fica congelado.

**Também nesta etapa.**
- Travessões removidos dos textos, títulos, rótulos e metadados.
- Capturas das demonstrações refeitas com as fontes reais delas (Bricolage e Plex).

**Testes.** 18 arquivos de navegador (896 verificações) e 5 de unidade (303), todos aprovados. Novos: `movimento`, `desempenho` e `textos`.

**Estilos das demonstrações.** Os 2.871 valores calculados continuam iguais aos de antes.

**Desempenho** (Chromium sem GPU, pior caso):
- **Quadros por segundo:** 60 em todas as seções a 1440 px, exceto o Início (56). No celular simulado (390 px, CPU 4× mais lenta), 60 em todas.
- **Carregamento inicial:** nenhum vídeo é baixado.
- **Estabilidade visual (CLS):** 0,003 no computador e 0 no celular.
- **Layout:** o Início não recalcula layout com as animações rodando.
- **Thread principal:** 3 ms/s no Início e 9 a 18 ms/s nos Serviços.
- **Digitação:** o maior evento levou 64 ms.

**Limitações.**
- O build oficial continua dependendo do `npm install`, que não roda neste ambiente.
- Os testes rodaram na versão de pré-visualização, com o mesmo código-fonte.
- O Chromium usado aqui não toca vídeo H.264. Por isso o site oferece WebM primeiro e MP4 como alternativa; a reprodução foi testada com o WebM.

---

# Validação para o build oficial (26/10/2026)

**Tipografia.** A Sora foi implementada a seu pedido. Na rodada anterior ela só tinha sido comparada com a Space Grotesk. Nesta etapa foram feitas capturas reais da página atual com Sora, Unbounded e Syne:
- cada uma com a escala própria;
- fontes carregadas e conferidas no navegador;
- sem alterar o código.

**`npm install`.** Não foi possível neste ambiente: o endereço do registro do npm não resolve (`ENOTFOUND`). Por isso não há `package-lock.json` nem `dist/` gerados aqui.

**TypeScript.** A verificação foi feita com tipos reais, e não com os substitutos usados antes:
- `@types/react` e `@types/react-dom` 19, do repositório DefinitelyTyped;
- código-fonte do React Router 6.28;
- tipos `vite/client` do Vite 6.3.5;
- assinaturas do lucide-react 0.460;
- o `tsconfig.json` do projeto, rodado no TypeScript 6.0.3 instalado aqui.

Resultado:
- a verificação encontrou **um erro real** em `src/components/ui/Section.tsx`, que faria o `npm run build` falhar, e ele foi corrigido;
- depois da correção, há **0 erros** em `src/`;
- os avisos restantes vêm do código-fonte do próprio React Router, checado com as regras rígidas do projeto, e não aparecem no build real (lá vale `skipLibCheck`).

**Vite.** Não foi executado (depende do `npm install`). O que foi conferido no lugar:
- o `vite.config.ts` só importa pacotes declarados;
- o plugin de SEO gera as cinco páginas de estudo de caso, o `sitemap.xml` e o `robots.txt`;
- o `verify:dist` passou em 95 de 97 itens numa pasta de pré-visualização no formato do Netlify;
- os 2 itens restantes só existem no build do Vite: JavaScript e CSS em `/assets`.

**Netlify.** O comando passou a ser `npm run build && npm run verify:dist`: se qualquer conferência falhar, o deploy para e o site no ar não muda.

**Testes.** Todos aprovados de novo depois da correção: 18 arquivos de navegador (896 verificações) e 5 de unidade (303).

# Tela branca ao voltar de uma demonstração (27/10/2026)

**Sintoma relatado.** Depois de "Testar demonstração" e Voltar, às vezes a página fica só com o fundo claro: sem cabeçalho, conteúdo ou rodapé.

**Reprodução.**
- A navegação normal (as 5 demos, partindo do início e dos estudos de caso, Voltar/Avançar 3 vezes, computador e celular) **não** reproduziu o problema:
  - nem com o roteador de pré-visualização;
  - nem com o React Router 6.28 real;
  - nenhum erro no console.
- Vídeos, observadores e animações também não geraram erro nessas idas e vindas.
- O problema foi reproduzido num build dividido em arquivos, como o do Vite, simulando um deploy novo com a aba aberta:
  - o arquivo da demonstração deixa de existir;
  - a regra `/* /index.html 200` devolve a página HTML no lugar do script;
  - o navegador acusa `Failed to fetch dynamically imported module`;
  - como não havia tratamento de erro, o React desmonta tudo: `#root` fica vazio e continua vazio depois de Voltar.

**Correção.**
- `src/utils/lazyPage.ts`: as demos tentam carregar de novo após uma falha passageira. Se o arquivo é de uma versão anterior, a página recarrega **uma única vez** no mesmo endereço (os arquivos antigos não existem mais, então só o `index.html` novo resolve).
- `src/components/layout/AppErrorBoundary.tsx`: qualquer erro de renderização mostra "Não foi possível abrir esta página", com "Tentar novamente" e "Voltar para o início". O erro é descartado ao navegar (Voltar/Avançar), então Voltar sempre mostra a página anterior.
- `public/_redirects`, `netlify.toml` e `public/404.html`: arquivo ausente em `/assets` responde 404, em vez de HTML guardado no cache como se fosse um script.

**Testes.**
- `tests/e2e/navegacao-historico.test.mjs`: 171 verificações aprovadas no build dividido com o roteador real.
- Sem a correção, o mesmo teste falha em 5 verificações, com `#root` vazio antes e depois de Voltar.
- Suíte completa: 19 arquivos de navegador (1.162 verificações) e unidade aprovados.

**Não validado aqui:** o site publicado (bloqueado por este ambiente) e o build oficial do Vite (sem acesso ao npm).

# Pacote de pré-visualização refeito (27/10/2026)

**Problema encontrado na revisão.** O `alto-code-previa-netlify.zip` anterior foi montado reaproveitando um ZIP antigo. Só o `index.html` principal foi trocado. Com isso:
- ficaram de fora as fontes Sora, Onest e Azeret Mono, o `/demo-fonts/demo-fonts.css` e os vídeos dos cinco projetos (14 arquivos citados e ausentes);
- as cinco páginas de estudo de caso eram de uma versão antiga, com a tipografia anterior e sem a correção de navegação.

**Correção.** O pacote agora é gerado do zero a cada vez:
- `public/` inteira;
- as fontes das demonstrações;
- o `index.html` do código atual, com o React Router real;
- páginas dos estudos de caso, `sitemap.xml` e `robots.txt` gerados pela mesma função do build oficial (`scripts/seo-pages.ts`).

**Nova conferência no `verify:dist`.** Todo arquivo local citado por HTML, CSS ou JavaScript precisa existir na pasta. Ela roda também no build do Netlify, então um deploy com arquivo faltando é interrompido.

**Ambiente simulado (servidor local que imita as regras do Netlify):**
- **referências:** 0 ausentes no pacote novo, contra 14 no antigo;
- **navegação real:** computador e celular, por início, estudos de caso, demonstrações, subpáginas das demos e 404; 0 requisições com falha e 0 erros de JavaScript;
- **fontes:** portfólio e estudos de caso carregam só Sora, Onest e Azeret Mono; as demonstrações carregam Bricolage e IBM Plex, que são as fontes delas desde o início;
- **vídeos:** as cinco prévias em vídeo carregam;
- **páginas dos estudos de caso:** idênticas ao `index.html`, exceto pelos metadados de cada projeto;
- **`verify:dist`:** 97 de 99 itens; os 2 restantes só existem no build do Vite (arquivos em `/assets`);
- **suíte completa:** 19 arquivos de navegador e testes de unidade aprovados.

**Não validado:**
- **build oficial do Vite:** o registro do npm responde 403 pela política deste ambiente;
- **site publicado no Netlify:** não é acessível daqui.

# Causa real da tela branca: efeito que devolvia a Promise do scrollTo (27/10/2026)

**Erro capturado no Chrome.** O erro apareceu ao voltar de Nova Serviços e de Gestão360: `TypeError: d is not a function`, na função `co` do React, com `Tk` (NovaServicosDemo) na pilha de componentes.

**Causa.** As duas demonstrações tinham o mesmo efeito:

```tsx
useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);
```

- A arrow function sem chaves devolve o resultado de `scrollTo`.
- Até o Chrome 149 esse resultado era `undefined`. A partir do Chrome 150 (julho de 2026, "Programmatic Scroll Promises"), `scrollTo`, `scrollBy` e `scrollIntoView` devolvem uma **Promise**.
- O React 19 guarda o retorno do efeito como função de limpeza. Ao desmontar o componente (inclusive com Voltar), roda `if (destroy !== undefined) destroy()`.
- No arquivo minificado, `co` é essa rotina (`l=n.destroy; … var d=l; d()`). Chamar a Promise gera `d is not a function`.
- As outras três demonstrações chamam `scrollTo` dentro de chaves e não devolvem nada. Por isso não falhavam.

**Como foi confirmado.**
- O Chromium dos testes (141) ainda devolve `undefined`, e por isso nenhum teste anterior pegou o erro. Não foi possível baixar um Chrome 150 neste ambiente.
- O teste emulou só a mudança do Chrome 150: os métodos de rolagem passam a devolver `Promise.resolve()`.
- Com o pacote de pré-visualização anterior, apareceu exatamente o mesmo erro e a mesma pilha (`co`, depois `Tk`), só em Nova Serviços e Gestão360, com o AppErrorBoundary acionado.
- No teste de navegação: 0 falhas sem a emulação e 30 falhas com ela, todas nessas duas demonstrações.

**Correção.**
- Os dois efeitos passaram a usar chaves.
- Outros três efeitos com retorno implícito também ganharam chaves: `Header.tsx`, `PrimeImoveisDetail.tsx` e `PrimeImoveisList.tsx`. Eles devolviam `undefined` hoje, mas seguiam o mesmo padrão arriscado.
- Nenhuma exceção é escondida e não há recarga.
- O comportamento não mudou: a página continua abrindo no topo.

**Proteção contra regressão.**
- `tests/unidade/efeitos-limpeza.test.ts` analisa todo o `src/` com o compilador do TypeScript (41 efeitos e 1 callback de ref). Ele falha se algum efeito ou ref devolver algo que não seja uma função.
- `tests/e2e/navegacao-historico.test.mjs` roda a navegação também com a rolagem do Chrome 150+ (computador e celular). Ele falha com qualquer erro no console, inclusive o registro do AppErrorBoundary.

**Sobre a hipótese anterior.** A falha de carregamento de arquivos após um deploy novo **não** foi a causa deste erro. O pacote de pré-visualização nem divide o código em arquivos. O tratamento criado para ela (`lazyPage` e `AppErrorBoundary`) continua no projeto como proteção do build oficial do Vite. Foi o AppErrorBoundary que transformou a tela branca na mensagem registrada no console.
