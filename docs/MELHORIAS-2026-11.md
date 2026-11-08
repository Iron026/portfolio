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
  errada ao compartilhar o link. O build agora gera `dist/demos/<nome>.html` com título,
  descrição, canonical e imagem próprios. `verify:dist` confere os cinco.
- **Barra final no Netlify (verificado no site publicado em 08/11):** quando existe
  `pasta/index.html`, o Netlify responde **301** de `/projetos/gestao360` para
  `/projetos/gestao360/`. Já um arquivo `nome.html` é entregue em `/nome` com **200**, sem
  redirecionar. Por isso:
  - as demonstrações usam arquivo plano (`demos/imoveis.html`) e continuam sem redirecionamento;
  - os estudos de caso seguem como em produção (`projetos/<slug>/index.html`), e o canonical e o
    sitemap passaram a usar a URL final, com barra. Antes eles citavam a URL que redireciona.
  - O teste de Voltar e Avançar aceita a barra final dos estudos de caso, que o Netlify adiciona
    ao carregar a página diretamente.
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

## 5. Decisões registradas (08/11/2026)
- Melhorias comerciais, formulário, acessibilidade e estudos de caso: **aprovados**.
- Identidade visual: **sem novas alterações estéticas.**
- Nome e foto na seção Sobre: **continuam vazios.** A Alto Code é só o portfólio comercial, sem currículo e sem GitHub.
- Caixa em Dia: próxima demonstração, **depois** da publicação e dos testes desta versão. FluxoPronto: etapa posterior.

## 6. Sugestões não aplicadas
- **Exemplos para Planilhas e Automação:** enquanto não houver projeto, esses cartões poderiam apontar para as abas "Planilha" e "Automação" da bancada do topo.
- **Pré-renderizar a página inicial** para melhorar o LCP (ver a seção 3).

## 7. Publicação verificada no Netlify (08/11/2026)

Deploy `6aefd32a491606fbb44d7ef5` (Netlify Drop, produção), publicado às 01:41 UTC sem erros.

**Pacote e endereços**
- Os 184 arquivos do pacote estão no ar e respondem 200. O JavaScript publicado (`index-D4Gz049i.js`) é o mesmo do build gerado.
- As 2 regras de redirecionamento e as 2 de cabeçalhos foram processadas sem erro.
- `/demos/<nome>` responde 200 sem redirecionar, com título próprio, nas cinco demonstrações. `/demos/imoveis/PI-101` responde 200.
- `/projetos/<slug>` responde 301 para `/projetos/<slug>/` e depois 200. Arquivo antigo em `/assets` responde 404. `sitemap.xml` e `robots.txt` respondem 200.

**Testes de navegador contra `https://altocode.netlify.app`:** os 20 arquivos passaram, incluindo Voltar e Avançar (254/254) e o novo `comercial` (61/61). Três arquivos caíram na primeira rodada e passaram ao repetir:
- `comercial`: o `fetch` do Node precisava do proxy deste ambiente;
- `orcafacil` e `navegacao-historico`: oscilação de rede.

**Teste de digitação corrigido:** o "maior evento" acima de 200 ms não era digitação. Era um `pointerover` gerado pelo mouse do Playwright durante a inicialização do app (CPU 4× mais lenta), que esperava na fila. O teste agora mede só a partir do início da digitação. Resultado: 32 a 48 ms no site publicado e 24 a 32 ms localmente.

**Lighthouse 12.6 no site publicado** (laboratório, a partir deste ambiente na nuvem; não são dados de campo do Chrome UX Report):

| Perfil | Desempenho | FCP | LCP | TBT | CLS | Transferido |
| --- | --- | --- | --- | --- | --- | --- |
| Celular (2 execuções) | 97 e 95 | 1,7 s | 2,1 e 2,2 s | 120 e 210 ms | 0 | 293 KiB |
| Computador (2 execuções) | 100 e 100 | 0,4 s | 0,5 s | 0 ms | 0,001 | 358 KiB |

Acessibilidade 97, Boas práticas 100 e SEO 100. Os pontos que ainda aparecem já existiam antes desta versão:
- contraste dos números animados das ilustrações de serviço (decorativos);
- `label-content-name-mismatch`: botões de fórmula da bancada e de reprodução das prévias com `aria-label` que não contém o texto visível.

**Selo "Powered by Netlify":** o Netlify injeta no site publicado o script `/.netlify/scripts/hud?variant=public`. Ele mostra um selo fixo de 201 × 64 px no canto inferior direito, no celular e no computador, sobre o conteúdo. Não faz parte do código da Alto Code e não afetou os testes nem o tempo de digitação (medido com o script bloqueado). Tirá-lo depende das configurações da conta ou do projeto no Netlify.
