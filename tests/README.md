# Testes da Alto Code

Três grupos, do mais rápido ao mais completo:

| Comando | O que faz | Precisa de |
| --- | --- | --- |
| `npm run test:unit` | regras das demonstrações: cálculos, filtros, validações; e nenhum efeito ou ref do React devolvendo algo que não seja função de limpeza (`tests/unidade/`) | só `npm install` |
| `npm run verify:dist` | confere a pasta `dist/`: 5 estudos de caso com metadados, sitemap, robots, `_redirects`, `_headers`, fontes WOFF2, todas as imagens e nenhum arquivo citado por HTML, CSS ou JavaScript ausente da pasta | `npm run build` antes |
| `npm run test:e2e` | navegador real (Chromium): portfólio, formulário, bancada, fontes, responsividade (320–1440 px), acessibilidade e as 5 demonstrações (`tests/e2e/`) | `npm run build` e, uma vez, `npm run test:setup` |
| `npm test` | tudo acima, em sequência | — |

`npm run test:setup` instala o Playwright 1.56 e o Chromium **sem alterar** o `package.json` nem o
`package-lock.json` (o site publicado não carrega nada disso). Se um `npm install` posterior
remover o Playwright, é só rodar `npm run test:setup` de novo.

## Testes de navegador

Sem configuração, `npm run test:e2e` sobe o `vite preview` com a pasta `dist/` em
`http://127.0.0.1:4173` e roda cada arquivo de `tests/e2e/`. Para rodar só alguns:

```bash
npm run test:e2e -- portfolio fontes bancada
```

Para testar um endereço já publicado (Deploy Preview, projeto de teste ou o site oficial):

```bash
BASE_URL=https://altocode.netlify.app npm run test:e2e
```

Variáveis opcionais: `TEST_OUT` (pasta das capturas geradas, padrão `tests/saida/`),
`PW_CHROMIUM` (caminho de outro Chromium), `PW_ARGS` (argumentos extras do navegador) e
`HASH_URL` (endereço de um build feito com `VITE_HASH_ROUTER=true`, para testar os links com `#`).

| Arquivo | Cobre |
| --- | --- |
| `portfolio.test.mjs` | rotas, atualização de página, menu, cartões, capturas reais, estudos de caso, 404 |
| `hero-e-cartoes.test.mjs` | hero, botões, ordem das seções, cartões no celular |
| `links-antigos.test.mjs` | links antigos com `#/` continuam funcionando |
| `contato.test.mjs` | formulário: validação, WhatsApp/e-mail, máscara, cópia manual |
| `bancada.test.mjs` | abas da bancada por mouse e teclado, painéis e fórmulas |
| `fontes.test.mjs` | todo texto em Sora/Onest/Azeret Mono, arquivos carregados, nenhum caractere sem glifo |
| `responsivo.test.mjs` | sem rolagem lateral em 320, 390, 768, 1024 e 1440 px (portfólio e demos) |
| `acessibilidade.test.mjs` | idioma, títulos, nomes de controles, rótulos, ids, alvos de toque, link de pular |
| `movimento.test.mjs` | botão "Pausar animações", lembrança da escolha, "reduzir movimento", pausa fora da tela, uma prévia em vídeo por vez, botões das prévias, formulário sem interferência |
| `desempenho.test.mjs` | vídeos fora do carregamento inicial, estabilidade visual (CLS), thread principal livre, resposta à digitação; computador e celular simulado (CPU 4×) |
| `navegacao-historico.test.mjs` | Voltar/Avançar entre portfólio, estudos de caso e as 5 demonstrações (3 vezes cada, computador e celular), atualizar na demo e voltar, também com a rolagem do Chrome 150+ (scrollTo devolvendo Promise); simula um deploy novo com a aba aberta (arquivos antigos com 404) e exige recarga única ou tela de recuperação, nunca página vazia |
| `textos.test.mjs` | nenhum travessão em textos, títulos, rótulos e metadados (portfólio e demonstrações) |
| `gestao360`, `prime-imoveis(-teclado)`, `nova-servicos(-teclado)`, `arena-store`, `orcafacil` | as funcionalidades de cada demonstração |

Cada arquivo termina com `N passaram, M falharam` e o runner mostra um resumo no final.
Os testes não enviam dados a nenhum servidor.
