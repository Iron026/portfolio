# Acabamento mobile, animação do FAQ e refino do Hero

Branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.** Não houve redesign. Ficaram iguais:
- logo, favicon e as quatro cores do Hero;
- bancada, vitrine e tours;
- demonstrações e formulário comercial;
- PT/EN, SEO, vídeos e fontes.

## 1. Botões dos projetos no celular

**Causa**
- Os botões tinham altura fixa (`h-11`, 44 px).
- Na vitrine, eles ficavam lado a lado a partir de 400 px (`min-[400px]:grid-cols-2`).
- Entre 400 e cerca de 520 px, cada botão ficava com uns 194 px. "Testar demonstração" e "Conheça o projeto" quebravam em duas linhas dentro dos mesmos 44 px.
- Medido a 430 px: 0 px de respiro vertical e conteúdo transbordando.

**Correção**
- `Button.tsx`: os tamanhos usam altura mínima (`min-h-*`) em vez de fixa, com respiro vertical (`py-2.5`), texto centralizado e quebra equilibrada. Os ícones não encolhem.
- Em uma linha, as alturas continuam as mesmas: 40, 44, 48 e 52 px. Se o texto precisar de duas linhas, o botão cresce sem encostar nas bordas.
- `Projects.tsx`: os dois botões ficam empilhados, em largura total, até 520 px. A partir daí ficam lado a lado, sempre em uma linha. A partir de 768 px voltam à coluna lateral, como antes.
- `ProjectActions.tsx`: o aviso de "demonstração em produção" ganhou a mesma altura flexível.
- Bordas, arredondamentos, cores, hover e foco não mudaram.

## 2. Linha do Processo

**Causa**
- A linha vertical era posicionada com `top-5 bottom-5`, ou seja, até 20 px antes do fim da lista. Como a etapa 05 tem texto embaixo do marcador, ela passava 38 a 108 px abaixo do centro do 05.
- No computador, a horizontal usava 10% de margem nas pontas e ficava 10 px fora dos centros.
- O preenchimento era uma fração fixa (`etapas alcançadas ÷ 4`). Com textos de alturas diferentes, ele não parava no centro do marcador.

**Correção** (`Process.tsx`)
- A linha é medida a partir dos centros reais dos marcadores 01 e 05 e remedida quando a lista muda de tamanho (`ResizeObserver`), por causa das fontes, do idioma e da largura.
- O preenchimento para exatamente no centro da última etapa alcançada.
- A animação de progresso e a direção (vertical no celular, horizontal no computador) foram mantidas.

**Resultado:** 0 px de diferença nas duas pontas, em PT e EN, de 320 a 1440 px, também com um texto três vezes mais alto numa etapa do meio.

## 3. Animação do FAQ

**Como funciona** (`Faq.tsx`)
- Continua sendo um `<details>`/`<summary>` nativo, com o mesmo teclado (Enter e espaço), a mesma semântica para leitores de tela, a busca na página e o funcionamento sem JavaScript.
- O clique na pergunta é interceptado só para animar, com a Web Animations API do próprio navegador, sem biblioteca nova:
  - **altura:** a real da resposta, medida na hora (sem altura fixa);
  - **duração:** abre em 240 ms e fecha em 200 ms;
  - **curva:** suave na abertura e acelerada no fechamento;
  - **texto:** aparece aos poucos (opacidade e 4 px de deslocamento);
  - **ícone:** gira junto.
- Ao terminar, a resposta volta à altura automática, então nada fica cortado. Um segundo clique durante a animação parte da altura atual, sem salto.
- Com movimento reduzido no sistema ou "Pausar animações" no site, abre e fecha na hora, e o ícone muda sem girar.

**Correção junto:** o ícone de "+" nunca girava suavemente. O Tailwind 4 usa a propriedade `rotate`, e a transição listava `transform`. Agora a transição inclui `rotate`.

## 4. Refino do Hero (sem reconstruir)

**Descrição nova**
- PT: "Apresente melhor seus serviços, organize informações e reduza tarefas repetitivas com soluções feitas para sua rotina. Do orçamento à entrega, você fala diretamente comigo."
- EN: "Present your services better, keep information organized and cut down on repetitive tasks with solutions built around your routine. From quote to delivery, you talk directly with me."

**No celular**

| Ajuste | Antes | Depois |
| --- | --- | --- |
| Espaço acima do conteúdo | 96 px | 88 px (24 px abaixo da barra) |
| Linha de apoio | "ALTO CODE — ESTÚDIO…", em 2 a 3 linhas | só "ESTÚDIO DE DESENVOLVIMENTO INDEPENDENTE" (a logo já está logo acima) |
| Título | 36 px | 32 px em 320, 35 px em 390, 37 px em 430; igual no computador |
| Descrição | 18 px | 17 px com entrelinha 1,6, até 46 caracteres por linha |
| Botões | espaço de 12 px | 10 px, mesma altura; empilhados abaixo de 380 px |
| Etiqueta da bancada em 320 | cortada ("Experimente as aba") | só "Bancada interativa" abaixo de 360 px |
| Planilha da bancada em 320 | 39 px para fora (coluna "Lucro" cortada) | cabe inteira: abaixo de 360 px o "R$" vai para o cabeçalho; leitores de tela continuam ouvindo o valor completo |

O título não mudou: as palavras que a moldura percorre continuam iguais, assim como as quatro cores e a animação.

**Quanto a bancada subiu (topo da bancada, página no topo)**

| Largura | PT antes → depois | EN antes → depois |
| --- | --- | --- |
| 320 px | 886 → 814 px | 811 → 734 px |
| 390 px | 721 → 693 px | 690 → 664 px |
| 430 px | 731 → 637 px | 639 → 608 px |
| 1440 px | 489 → 492 px (praticamente igual) | 489 → 492 px |

**Correção encontrada na comparação:** a moldura do título podia ficar levemente fora da palavra logo na carga.
- Causa: o `fonts.ready` resolve antes de a fonte do título começar a carregar.
- Aconteceu em 1 de 16 capturas da versão anterior.
- Agora a moldura também se remede quando cada fonte termina de carregar. Ficou alinhada em 24 de 24 capturas, e há um teste para isso.

## 5. Testes (executados no código entregue)

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319, incluindo `efeitos-limpeza` (proteção do "TypeError: d is not a function") |
| Build oficial (`npm run build`) | concluído sem erros |
| Build (`npm run verify:dist`) | 208 de 208 |
| Navegador (`npm run test:e2e`) | **3.366 de 3.366**, em 27 arquivos (318 no novo `acabamento.test.mjs`) |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | 0 violações em 28 páginas × 2 larguras |

**Novo: `acabamento.test.mjs`.** Em PT e EN, em 320, 360, 390, 430, 520, 600, 768 e 1440 px:
- **botões dos cinco projetos:**
  - sem corte, com respiro de 16 px nas laterais e 9 px ou mais em cima e embaixo;
  - texto centralizado e ícone dentro do botão;
  - empilhados abaixo de 520 px; lado a lado em uma linha entre 520 e 767 px;
- **linha do Processo:**
  - do centro do 01 ao centro do 05, com o preenchimento parando no 05;
  - também com texto mais alto numa etapa e com preenchimento parcial;
- **FAQ:**
  - abre e fecha aos poucos, em cerca de 240 ms, com opacidade e ícone sincronizados;
  - resposta inteira depois de aberta;
  - interrupção sem travar;
  - Enter e espaço funcionam e o foco é preservado;
  - todas as perguntas funcionam;
- **FAQ sem movimento:** com movimento reduzido e com "Pausar animações", abre e fecha sem animação;
- **Hero:**
  - descrição nova;
  - etiqueta e planilha da bancada sem corte;
  - palavras da moldura no título e moldura alinhada logo na carga;
- **geral:** nenhuma rolagem lateral e nenhum erro de página.

## 6. Arquivos alterados

| Arquivo | Mudança |
| --- | --- |
| `src/components/ui/Button.tsx` | altura mínima, respiro vertical, texto centralizado, ícones que não encolhem |
| `src/components/sections/Projects.tsx` | botões empilhados até 520 px |
| `src/components/sections/ProjectActions.tsx` | aviso de demonstração com altura flexível |
| `src/components/sections/Process.tsx` | linha medida pelos centros dos marcadores |
| `src/components/sections/Faq.tsx` | abertura e fechamento animados sobre o `<details>` nativo |
| `src/components/sections/Hero.tsx` | composição no celular, etiqueta da bancada, moldura remedida ao carregar a fonte |
| `src/components/sections/HeroWorkbench.tsx` | planilha sem rolagem lateral abaixo de 360 px |
| `src/config/site.ts`, `src/config/site.en.ts` | descrição nova do Hero |
| `src/styles/index.css` | tamanho do título no celular; ícone do FAQ sem giro com movimento reduzido ou pausado |
| `tests/e2e/acabamento.test.mjs` (novo) | testes desta etapa |

## 7. Pendências

- [ ] Aprovar e publicar (nada foi publicado).
- [ ] Conferir num celular real a vitrine (botões), o Processo, o FAQ e o Hero.
