# Alto Code: melhorias de novembro de 2026

Base: o código-fonte enviado em 07/11/2026, importado sem alterações no primeiro commit
(`Importa código-fonte original`). Todas as mudanças estão no commit seguinte, e o histórico
mostra o antes e o depois.

## 1. O que mudou e por quê

### Apresentação comercial
| Mudança | Por quê |
| --- | --- |
| Subtítulo do topo: "Desenvolvedor independente: você fala direto com quem desenvolve, aprova escopo, prazo e valor antes de começar e recebe a solução testada no celular e no computador." | O texto anterior ("Estúdio de desenvolvimento de um profissional independente…") não dizia como funciona a contratação. Agora quem chega entende na primeira tela o que acontece ao pedir um orçamento. |
| Nova pergunta frequente: "Quanto custa um projeto?" | É a primeira dúvida de um pequeno empresário. A resposta é honesta: não há tabela fixa, e o valor vem na proposta escrita, sem custo. |
| Introdução de Projetos: "teste no navegador, sem cadastro" | Reduz a hesitação antes de abrir uma demonstração. |
| Termos técnicos trocados nos projetos: `localStorage` → "Armazenamento no navegador", "CSS de impressão" → "Impressão e PDF", "CSV" → "Exportação CSV" | São mais claros para quem não programa, sem perder a informação técnica. |

### Seção Sobre
Os três compromissos viraram seis: **Atendimento direto**, **Entender antes de propor**,
**Proposta por escrito**, **Revisado e testado**, **Fácil de manter** e **Transparência**.
Os textos repetem apenas o que o site já promete no Processo e nas Perguntas frequentes.
Nenhum cliente, certificação ou trajetória foi inventado. O nome e a foto continuam opcionais
(`ownerName` e `ownerPhoto` vazios).

### GitHub
- "Git e GitHub" passou a ser "Controle de versões (Git)" nas ferramentas.
- O comentário de `contact.profiles` em `src/config/site.ts` agora orienta a não incluir o GitHub.
- Não havia outro link, botão ou menção pública. Duas verificações garantem que continue assim:
  `verify:dist` confere os textos e todas as páginas HTML do build, e `comercial.test.mjs`
  confere o texto e os links das páginas renderizadas.
- O processo interno (repositório e deploy) não mudou.

### Estudos de caso (os cinco)
Cada estudo de caso ganhou, a partir de novos campos em `src/data/projects.ts`:
- **Quem usa e o que resolve:** dois perfis por projeto, por exemplo cliente final e dono do negócio.
- **Como experimentar a demonstração:** roteiro de quatro passos, coerente com o que cada demonstração faz, e o botão da demonstração.
- **Possibilidades para um negócio real:** quatro adaptações, com o aviso de que o escopo é combinado na proposta.
- **Como pedir um orçamento:** três passos e o botão que abre o formulário com o serviço e o projeto já escolhidos.
- A seção "Decisões de implementação" passou a se chamar **"Cuidados que fazem diferença no uso"**,
  com uma frase de introdução. Três explicações perderam jargão ("pontos-base", "UTF-8 com BOM",
  "SVG próprio") sem perder o conteúdo.
- A transparência continua, e o aviso agora diz também que nenhum resultado de cliente é apresentado.

### Percurso até o orçamento
| Problema encontrado (medido) | Correção |
| --- | --- |
| No celular, ao tocar em "Pedir orçamento de site", o formulário ficava cerca de **990 px abaixo** do ponto de chegada (390 px de largura): o visitante precisava rolar além do diagrama e da lista de canais. | No celular a ordem passou a ser título → formulário → diagrama e canais. Logo abaixo do título há um atalho "Chamar no WhatsApp ou enviar e-mail". **No desktop o layout continua igual.** |
| Números de WhatsApp com DDD inválido (por exemplo, 01) ou celular de 11 dígitos sem o 9 eram aceitos. | Mensagens específicas: "Confira o DDD…" e "Celular com 11 dígitos começa com 9…". O telefone fixo continua aceito. |
| Depois de "Enviar pelo WhatsApp" ou "Enviar por e-mail", a mensagem afirmava que o aplicativo **foi** aberto, o que não dá para garantir (bloqueio de nova aba ou aparelho sem e-mail configurado). | O texto agora diz "Abrindo…". Para o e-mail, aparece a alternativa "O aplicativo de e-mail não abriu? Use Copiar mensagem e envie para iron.comercial26@gmail.com". |

Continuam como estavam: preenchimento automático por `?servico=` e `?projeto=`, referência
removível, máscara de telefone, cópia manual quando a área de transferência falha, link de
reserva do WhatsApp e nenhum envio a servidor. O sistema de contato não foi trocado.

### Acessibilidade (achados do axe-core, corrigidos)
- **Gestão360:** a tabela que rola para o lado no celular não podia ser rolada pelo teclado. Agora ela recebe foco, tem nome ("Transações") e mostra o contorno de foco.
- **Arena Store:** o texto dos produtos esgotados tinha contraste de 3,97:1 e 3,25:1 (o mínimo é 4,5:1), porque o cartão inteiro ficava esmaecido. Agora só a ilustração fica esmaecida.
- **Faixa "empresa fictícia" das demonstrações:** estava fora de qualquer região da página, e quem usa leitor de tela podia não ouvir o aviso. Agora é uma região rotulada "Sobre esta demonstração".
- **Seção Sobre e estudo de caso:** dois `<aside>` aninhados dentro de outras regiões foram trocados por blocos comuns.
- **Bancada (aba Planilha):** a célula de cabeçalho vazia ganhou o texto "Linha", visível só para leitores de tela.

Não alterados: o axe aponta contraste baixo nos números animados das ilustrações dos serviços
e nos números do Processo antes de acenderem. São decorativos (`aria-hidden`) e o aviso
aparece porque o teste captura a animação no meio da transição.

### SEO
- **Demonstrações com HTML próprio:** `/demos/<nome>` recebia o título e o endereço canônico da
  página inicial, o que contradizia o sitemap (que lista as demonstrações) e gerava a prévia
  errada ao compartilhar o link. O build agora gera `dist/demos/<nome>/index.html` com título,
  descrição, canonical e imagem próprios. `verify:dist` confere os cinco.
- Já estavam corretos e foram mantidos: títulos e descrições, canonical, Open Graph,
  `sitemap.xml`, `robots.txt`, `noindex` na página 404, um único h1 por página, texto
  alternativo nas capturas e fontes locais com pré-carregamento.

## 2. Testes executados neste ambiente

Os testes rodaram no Chromium 153 com o build oficial do Vite (`npm run build`).

| Suíte | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 305/305 (6 arquivos) |
| Build oficial (`tsc` + Vite) | sem erros |
| Verificação do dist (`npm run verify:dist`) | 122/122 (eram 104; entraram demonstrações e GitHub) |
| Navegador (`npm run test:e2e`), 20 arquivos | todos passaram nas execuções finais |
| Novo `comercial.test.mjs` | 61/61 |
| Voltar e Avançar (`navegacao-historico.test.mjs`) | 254/254 |

Observações honestas sobre os testes:
- **Duas falhas já existiam na versão enviada** (Nova Serviços: "logo → topo" e "menu móvel →
  Dúvidas"). A causa foi o tempo do teste, não um defeito do site: a rolagem suave deste
  Chromium leva cerca de 1 s para percorrer 3.000 px e o teste esperava 900 ms fixos. Os testes
  agora esperam a rolagem terminar. A mesma correção foi aplicada ao menu em `hero-e-cartoes`.
- `movimento.test.mjs` rolava só até o topo do contato e conferia o diagrama. No celular o
  diagrama agora fica abaixo do formulário, e por isso estava pausado, que é o comportamento
  correto. O teste agora rola até o diagrama.
- `desempenho.test.mjs` registrou uma vez 224 ms de resposta à digitação no celular simulado
  (o limite é 200 ms) durante a suíte completa. Em duas execuções isoladas logo depois, mediu
  72 ms e 104 ms. Foi uma oscilação de carga da máquina.
- A correção do "TypeError: d is not a function" foi preservada. O teste `efeitos-limpeza`
  passou e o de Voltar e Avançar passou nas cinco demonstrações, no computador e no celular,
  incluindo a simulação do Chrome 150+.

## 3. Medição de desempenho (Lighthouse 12.6, laboratório local)

Condições: página inicial, perfil de celular simulado do Lighthouse, servidor local
**sem compressão**. **Não é o PageSpeed do site publicado.**

| Versão | Desempenho | FCP | LCP | TBT | CLS | Transferido |
| --- | --- | --- | --- | --- | --- | --- |
| Pré-visualização publicada hoje (esbuild, enviada no .zip) | 63 e 66 | 4,1 s | 4,9 s | 400 e 280 ms | 0 | 809 KiB |
| Build oficial do Vite desta entrega | 75 e 76 | 3,6 s | 4,5 s | 70 e 90 ms | 0 | 667 KiB |

Acessibilidade 97, Boas práticas 100 e SEO 100 nas duas versões. O Lighthouse aponta 377 KiB
de economia com compressão de texto, que o Netlify já aplica automaticamente. Por isso os
números no ar devem ser melhores, mas isso só se confirma medindo o site publicado.

O que ainda limita o LCP: o texto do topo só aparece depois de o JavaScript rodar (é um site
React sem HTML pré-renderizado). Pré-renderizar a página inicial resolveria, mas aumenta a
complexidade do build. Fica como proposta, não foi feito.

## 4. Pendências de validação
- [ ] Testar em aparelhos reais: iPhone com Safari e Android com Chrome. Aqui só houve Chromium com emulação.
- [ ] Rodar o PageSpeed Insights no site publicado depois do deploy.
- [ ] Conferir no aparelho "Enviar por e-mail" sem aplicativo de e-mail configurado e "Enviar pelo WhatsApp" com bloqueio de nova aba.
- [ ] Revisar os textos novos dos estudos de caso: possibilidades de adaptação e roteiros de teste.
- [ ] Aprovar ou ajustar a proposta de novos projetos (`docs/PROPOSTA-NOVOS-PROJETOS.md`).

## 5. Sugestões não aplicadas (dependem de decisão sua)
- **Nome na seção Sobre:** só o primeiro nome (por exemplo, "Iron, responsável pela Alto Code") dá mais pessoalidade sem expor nome completo nem foto. O link do LinkedIn já mostra o nome completo.
- **Exemplos para Planilhas e Automação:** enquanto não houver projeto, esses cartões poderiam apontar para as abas "Planilha" e "Automação" da bancada do topo.
- **Pré-renderizar a página inicial** para melhorar o LCP (ver a seção 3).
