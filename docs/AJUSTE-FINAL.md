# Ajuste final antes da publicação

Branch `ccr-94f5409e-ms9w90`. **Nada foi publicado no site oficial.**
Comparação com a versão criativa aprovada (`0f3d1a8`) e com a base bilíngue (`97572ef`).

## 1. Prévia em vídeo só com clique (páginas de projeto)

- Nas cinco páginas "Projeto em detalhes", em português e inglês, a prévia **não toca sozinha**.
- Antes do clique em "Ver em movimento", o `<video>` não tem nenhuma fonte (`<source>`), usa
  `preload="none"` e não tem `autoplay`: **nada é baixado**. O arquivo (WebM, ou MP4 como
  alternativa) entra no HTML só depois do clique, no idioma da página.
- A captura real (WebP 800/1600, com prioridade alta) fica como imagem de prévia. Um botão grande de
  reprodução aparece sobre ela. O botão "Ver em movimento", com nome acessível, continua abaixo da
  imagem, indica o carregamento e passa a "Pausar" enquanto o vídeo toca.
- As medidas da moldura são as mesmas antes e depois do clique, então não há deslocamento de layout.
- Na vitrine do Início, a prévia automática foi mantida (pedido restrito às páginas dos projetos).
  Ela continua sem tocar com "Pausar animações", com movimento reduzido e com economia de dados.

## 2. Extensão da vitrine

| | Antes deste ajuste | Depois |
| --- | --- | --- |
| Vitrine no computador (1440 px) | 5.171 px | 4.762 px (−8%) |
| Vitrine no celular (390 px) | 4.660 px | 4.618 px |
| Captura em cada palco (computador) | 784 × 518 px | 784 × 518 px (igual) |
| Palco inteiro (captura, título e ações) | 824–858 px | 773 px, cabe numa tela de 1440 × 900 |

O que saiu ou mudou:
- **Intervalo entre palcos:** passou de 80 para 56 px no computador.
- **Lista de tecnologias:** saiu dos palcos; continua em "Detalhes técnicos" de cada projeto.
- **Contador "01 / 05":** saiu dos palcos no computador, porque repetia o índice ao lado. No celular foi mantido.
- **Margem inferior da mídia:** ficou menor.

O índice e a moldura que acompanha a rolagem foram preservados.

## 3. Desempenho

Mesma metodologia das medições anteriores:
- Lighthouse 12.6.1, celular simulado;
- servidor local sem compressão;
- três execuções por página;
- as três versões medidas na mesma sessão.

É uma medição de laboratório, não do site publicado.

| Página | Versão | Nota | LCP | CLS | JavaScript | Transferido | Vídeo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Início | Base `97572ef` | 76 · 75 · 76 | 4,4–4,6 s | 0 | 415 KiB | 670 KiB | 0 |
| Início | Criativa `0f3d1a8` | 75 · 74 · 74 | 4,6–4,8 s | 0 | 423 KiB | 686 KiB | 0 |
| Início | **Atual** | 75 · 75 · 75 | 4,6 s | 0 | 424 KiB | 688 KiB | 0 |
| Prime Imóveis | Base `97572ef` | 76 · 77 · 76 | 4,3–4,5 s | 0 | 415 KiB | 630 KiB | 0 |
| Prime Imóveis | Criativa `0f3d1a8` | 73 · 74 · 73 | 4,5–4,8 s | 0 | 434 KiB | 853 KiB | 195 KiB |
| Prime Imóveis | **Atual** | 74 · 75 · 76 | 4,4–4,7 s | 0 | 424 KiB | 649 KiB | 0 |

### O que foi recuperado

**Prime Imóveis**
- **Dados transferidos:** de 853 para 649 KiB. Os 195 KiB do vídeo não são mais baixados sem clique.
  Também saíram 10 KiB de JavaScript, porque o tour agora só carrega quando a seção se aproxima da tela.
  Ficou a 19 KiB da base.
- **Nota e LCP:** voltaram para a faixa da base (74–76 e 4,4–4,7 s, contra 76–77 e 4,3–4,5 s).
  A diferença restante é de 1 a 2 pontos.
- O vídeo vinha com prioridade baixa e quase não influía no LCP. Por isso a maior parte do ganho foi em
  dados, não na nota.

**Início**
- Praticamente igual à versão criativa, como esperado: a compactação da vitrine não muda o que é baixado.
- Continua cerca de 1 ponto e 0,1–0,2 s atrás da base. A diferença vem da bancada mais rica e de mais
  9 KiB de JavaScript.

**CLS:** 0 em todas as medições.

## 4. Verificação final (código entregue, depois de todas as alterações)

| Verificação | Resultado |
| --- | --- |
| Unidade (`npm run test:unit`) | 319 de 319, incluindo a proteção do "TypeError: d is not a function" (`efeitos-limpeza`: nenhum efeito ou ref devolve algo que não seja função) |
| Build oficial (`npm run build`) | concluído sem erros |
| Build (`npm run verify:dist`) | 201 de 201 (SEO bilíngue, hreflang, canonical, sitemap); também no ZIP |
| Navegador (`npm run test:e2e`) | **2.072 de 2.072**, em 22 arquivos: histórico, formulário, validação, exportações, cálculos, idiomas, movimento controlado, acessibilidade, 320 a 1440 px |
| Novos em `inovacoes.test.mjs` | 56: nas cinco páginas de projeto, em PT e EN, nenhum pedido de vídeo, nenhuma fonte e nenhuma reprodução antes do clique; botão sobre a imagem; o clique baixa a prévia do idioma certo e reproduz; moldura com a mesma altura antes e depois; botão pausa; tour montado só perto da tela |
| axe-core 4.10 (WCAG 2.0, 2.1 e 2.2, A e AA) | 0 violações em 28 páginas × 2 larguras |

## 5. Pendências

- [ ] Aprovar e publicar (nada foi publicado). Depois, rodar a verificação no ar
      (`docs/VERIFICACAO-POS-PUBLICACAO.md`), incluindo `/en/`.
- [ ] Revisar os textos novos em inglês e conferir num celular real o contraste sobre degradês.
- [ ] Opcional: se quiser o mesmo comportamento na vitrine do Início (vídeo só com clique), é uma troca de
      uma linha (`autoplay: false` no palco).
