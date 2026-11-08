# Verificação depois de publicar no Netlify

Use este roteiro sempre que publicar uma nova versão da Alto Code.

## 1. Publicar (Netlify Drop)
1. Descompacte `alto-code-netlify.zip`.
2. Abra app.netlify.com/projects/altocode/deploys.
3. Arraste a **pasta** `alto-code-netlify` (não o .zip) para a área de deploy.
4. Espere o deploy aparecer como **Published**.

Se algo der errado, o deploy anterior continua na lista: abra-o e use **Publish deploy**
para voltar à versão anterior em segundos.

## 2. Verificação automática (Claude ou qualquer computador com Node)
```bash
BASE_URL=https://altocode.netlify.app npm run test:e2e
```
O comando roda os 20 arquivos de teste de navegador contra o site publicado: rotas, Voltar e
Avançar nas cinco demonstrações, formulário, acessibilidade, fontes, responsividade de 320 a
1440 px e o HTML próprio das demonstrações.

Em ambientes com proxy (como a nuvem do Claude), acrescente `NODE_USE_ENV_PROXY=1` antes do
comando, para o `fetch` do Node usar o proxy.

Conferências rápidas de endereço:

| Endereço | Esperado |
| --- | --- |
| `/` | 200, título "Alto Code \| Sites, sistemas e planilhas sob medida" |
| `/projetos/gestao360` | 301 para `/projetos/gestao360/` e depois 200, título "Gestão360: estudo de caso \| Alto Code" |
| `/demos/imoveis` | 200 **sem redirecionar**, título "Prime Imóveis: demonstração interativa \| Alto Code" |
| `/demos/imoveis/PI-101` | 200 (o app abre o imóvel) |
| `/assets/arquivo-antigo.js` | 404 |
| `/sitemap.xml` e `/robots.txt` | 200 |

## 3. Verificação manual (no seu celular e no computador)
O ambiente de testes não tem iPhone nem Android reais. Estes itens precisam de você:

**Navegação**
- [ ] Abrir o site, tocar em Projetos, abrir um estudo de caso e voltar com o botão do aparelho.
- [ ] Abrir cada uma das cinco demonstrações, usar e voltar ao portfólio pelo "Alto Code / Projetos" do topo.
- [ ] Atualizar a página dentro de uma demonstração: ela deve continuar aberta.

**Formulário**
- [ ] Em um estudo de caso, tocar em "Quero … assim": o formulário aparece logo abaixo do título, com o serviço e o projeto preenchidos.
- [ ] Enviar pelo WhatsApp: a conversa abre com a mensagem pronta (não precisa enviar).
- [ ] Enviar por e-mail: o aplicativo de e-mail abre. Se não abrir, aparece a orientação com o endereço.
- [ ] Copiar mensagem e colar em outro aplicativo.

**Aparência**
- [ ] Nada saindo da tela na horizontal, no celular deitado e em pé.
- [ ] Vídeos das prévias tocam e o botão "Pausar animações" funciona.

## 4. Desempenho real
Rode o PageSpeed Insights (pagespeed.web.dev) com `https://altocode.netlify.app/` e anote
celular e computador. Estes são os primeiros números medidos no site publicado; os do relatório
de melhorias foram medidos localmente.
