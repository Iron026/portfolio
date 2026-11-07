# Publicação oficial no Netlify — passo a passo

Objetivo: colocar no ar o **build oficial** (`npm run build`) no site que já existe
(`https://altocode.netlify.app`), com build automático a partir do GitHub, **sem tirar do ar
a versão atual** enquanto nada estiver conferido.

Princípios de segurança deste roteiro:

- tudo é testado primeiro no seu computador e depois em um **projeto de teste** separado no Netlify;
- o site atual só é ligado ao repositório quando o teste estiver aprovado;
- um build que falha **não substitui** a versão publicada: o Netlify continua mostrando o último deploy que deu certo;
- a versão atual continua guardada na lista de deploys e pode ser republicada a qualquer momento.

---

## Parte A — No seu computador (≈ 15 min)

Pré-requisitos: [Node.js 22 LTS](https://nodejs.org) e [Git](https://git-scm.com).
Confira no terminal: `node -v` (deve mostrar `v22.…`) e `git --version`.

1. Descompacte `alto-code-codigo-fonte.zip` e abra um terminal **dentro** da pasta `alto-code`.
2. Instale as dependências — este comando também **cria o `package-lock.json`**:
   ```bash
   npm install
   ```
   Avisos `npm warn deprecated …` são normais. Se aparecer `npm error` ou `ERESOLVE`, pare e me envie a mensagem.
3. Gere o build oficial (verifica o TypeScript e depois roda o Vite):
   ```bash
   npm run build
   ```
   Deve terminar com `✓ built in …`. Se aparecer alguma linha `error TS…`, pare e me envie o trecho.
4. Confira a pasta `dist/` (rotas, metadados, sitemap, fontes e imagens):
   ```bash
   npm run verify:dist
   ```
   Resultado esperado: `… passaram, 0 falharam`.
5. Veja o resultado no navegador:
   ```bash
   npm run preview
   ```
   Abra `http://localhost:4173`, navegue pelos projetos e demonstrações e feche com `Ctrl + C`.
6. (Opcional, recomendado) Rode todos os testes:
   ```bash
   npm run test:unit
   npm run test:setup     # só na primeira vez: baixa o Playwright e o Chromium
   npm run test:e2e
   ```

> Até aqui nada foi publicado: o site no ar continua exatamente como está.

## Parte B — Repositório no GitHub (≈ 10 min)

1. Em [github.com/new](https://github.com/new), crie um repositório **vazio** (sem README), por
   exemplo `alto-code`. Pode ser **Private**.
2. No terminal, ainda na pasta do projeto (troque `SEU-USUARIO`):
   ```bash
   git init
   git add .
   git commit -m "Alto Code: versão oficial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/alto-code.git
   git push -u origin main
   ```
3. Confira no GitHub: o `package-lock.json` **está** no repositório; `node_modules/` e `dist/`
   **não estão** (o `.gitignore` já cuida disso).

> **Sem Node no computador?** Dá para pular a Parte A: envie a pasta do projeto ao GitHub pelo
> navegador (**Add file → Upload files**, arrastando o conteúdo da pasta `alto-code`, sem
> `node_modules`; o GitHub aceita até 100 arquivos por envio, então faça em duas ou três levas,
> por exemplo `public/` numa delas) e siga para a Parte C. Confira se `.gitignore`, `.nvmrc` e
> `netlify.toml` foram junto (arquivos que começam com ponto podem ficar ocultos no seu sistema). O Netlify roda `npm install` sozinho. Sem o
> `package-lock.json`, ele instala as versões mais recentes permitidas pelo `package.json`; para
> fixar exatamente as versões que deram certo, gere o arquivo depois (Parte A, passo 2) e envie-o.

> Daqui em diante, alterações futuras seguem o ciclo `git add .` → `git commit -m "…"` → `git push`,
> e o Netlify publica sozinho.

## Parte C — Projeto de teste no Netlify (≈ 10 min, sem tocar no site atual)

1. No painel do Netlify: **Add new project → Import an existing project → GitHub**
   (em painéis mais antigos: *Add new site*). Autorize o acesso e escolha o repositório.
2. Configurações de build: o `netlify.toml` já informa tudo. Comando
   `npm run build && npm run verify:dist`, pasta `dist`, Node 22. Deixe os campos como vierem.
   Se o painel pedir, preencha exatamente esses valores.
3. Clique em **Deploy**. O projeto de teste recebe um endereço provisório (`algo-aleatorio.netlify.app`).
4. Quando terminar, confira o log (veja a Parte F) e o site provisório com a lista da Parte E.
   Os metadados apontam para `altocode.netlify.app` de propósito — é o endereço oficial.
5. Opcional: rode os testes de navegador contra o site provisório:
   ```bash
   BASE_URL=https://algo-aleatorio.netlify.app npm run test:e2e
   ```
   (No Windows/PowerShell: `$env:BASE_URL="https://algo-aleatorio.netlify.app"; npm run test:e2e`.)

## Parte D — Ligar o site existente ao repositório

Só faça esta parte com o projeto de teste aprovado.

1. Abra o projeto **altocode** no Netlify → **Deploys**. Anote/identifique o deploy publicado hoje:
   ele é o seu ponto de retorno.
2. Confira **Project configuration → Environment variables**: **não** deve existir
   `NODE_ENV=production` (com ela o Netlify pula as ferramentas de build e o build falha).
3. Vá em **Project configuration → Developer settings → Continuous deployment → Repository →
   Link repository**, escolha GitHub, o repositório e a branch `main`.
   Comando de build e pasta de publicação: os do `netlify.toml` (`npm run build && npm run verify:dist` / `dist`).
4. Se o build não começar sozinho, em **Deploys** use **Trigger deploy → Deploy site**.
5. Acompanhe o log (Parte F).
   - **Deu certo** → o Netlify publica a nova versão. Faça a conferência da Parte E no endereço oficial.
   - **Falhou** → nada muda no ar. Me envie o trecho do log com o erro.
6. Se, depois de publicado, algo não estiver como esperado: **Deploys** → abra o deploy anterior
   → **Publish deploy**. A volta é instantânea, sem novo build.
7. Com tudo aprovado, você pode excluir o projeto de teste da Parte C.

## Parte E — Conferência depois da publicação

Abra cada endereço e **atualize a página (F5)** — isso confirma que as rotas funcionam fora da página inicial:

| O que conferir | Endereço |
| --- | --- |
| Página inicial | `/` |
| Estudos de caso | `/projetos/prime-imoveis`, `/projetos/gestao360`, `/projetos/nova-servicos`, `/projetos/arena-store`, `/projetos/orcafacil` |
| Demonstrações | `/demos/imoveis`, `/demos/gestao360`, `/demos/nova-servicos`, `/demos/arena-store`, `/demos/orcafacil` |
| Página 404 | `/qualquer-coisa` (mostra "Página não encontrada") |
| Fontes | `/fonts/sora-latin-wght-v1.woff2` (o navegador baixa o arquivo) |
| Sitemap e robots | `/sitemap.xml`, `/robots.txt` |
| Imagem de compartilhamento | `/og-image.png`, `/projetos/gestao360/og.jpg` |

Teste também o envio de um link de estudo de caso no WhatsApp: a prévia deve mostrar o título e
a imagem do projeto (o WhatsApp guarda prévias antigas por um tempo; use um link ainda não enviado).

Conferência automática (no seu computador, com o Playwright instalado):

```bash
BASE_URL=https://altocode.netlify.app npm run test:e2e
```

Os testes só navegam e preenchem formulários locais: nada é enviado a servidores.

## Parte F — Como ler o log do Netlify

Onde: **Deploys** → clique no deploy → **Deploy log**. Em caso de falha, o botão
**Why did it fail?** mostra um diagnóstico.

| Etapa | O que procurar (os textos podem variar um pouco) | Sinal de problema |
| --- | --- | --- |
| Versão do Node | uma linha com `v22.` (ex.: `Now using node v22.x.x`) | versão 18 ou 20 → confira o `netlify.toml` e o `.nvmrc` |
| Instalação | instalação com npm e a linha `added … packages … in …s` | `npm error`, `ERESOLVE`, `ENOENT` |
| Comando de build | `$ npm run build && npm run verify:dist` seguido de `> tsc --noEmit && vite build` | — |
| TypeScript | **nenhuma** linha `error TS…`; logo depois aparece `vite v6.… building for production...` | qualquer `error TS1234: …` (o build para aqui) |
| Vite | `✓ … modules transformed.`, a lista de arquivos em `dist/` e `✓ built in …` | `[vite]: Rollup failed to resolve import …` |
| Conferência do `dist/` | `> node tests/verificar-dist.mjs` e, no fim, `… passaram, 0 falharam` | qualquer linha `FAIL: …` (o deploy para e o site no ar não muda) |
| Fim do build | algo como `build.command completed` / `Netlify Build Complete` | `Build script returned non-zero exit code` |
| Publicação | processamento das regras de redirecionamento e cabeçalhos e `Site is live` | — |

---

## Referência rápida

- Comando de build: `npm run build && npm run verify:dist` · Pasta publicada: `dist` · Node: 22 (`netlify.toml` e `.nvmrc`)
- Regras de rotas: `public/_redirects` e `netlify.toml` (`/* → /index.html 200`). Arquivos que
  existem (páginas dos estudos de caso, fontes, imagens, sitemap) são servidos diretamente.
- Arquivos de versões anteriores: `/assets/*` que não existe mais responde **404** (regra no início do
  `public/_redirects` e no `netlify.toml`). Uma aba aberta antes de um deploy novo recarrega sozinha
  uma vez ao abrir uma demonstração; se não der, mostra "Não foi possível abrir esta página" com
  "Tentar novamente" e "Voltar para o início" (nunca uma tela vazia).
- Cache: `public/_headers` (`/assets/*` e `/fonts/*.woff2` por um ano; os nomes mudam quando o arquivo muda).
- O ZIP "netlify-previa" entregue antes é só uma **pré-visualização** gerada sem o Vite. Não o use
  como versão oficial: a versão oficial é a do build automático descrito acima.
