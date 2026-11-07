# Proposta: dois novos projetos demonstrativos

> Situação: **proposta para aprovação.** Nada aqui foi desenvolvido nem publicado, e nenhum
> cartão novo foi adicionado ao site.

## Por que agora

A Alto Code oferece seis serviços e tem cinco projetos demonstrativos. Quatro serviços têm
pelo menos um projeto que prova o que é oferecido. Dois não têm nenhum:

| Serviço | Projeto que demonstra hoje |
| --- | --- |
| Sites e landing pages | Nova Serviços, Prime Imóveis, Arena Store |
| Sistemas web | Gestão360, Prime Imóveis |
| Dashboards e análise de dados | Gestão360 |
| **Planilhas inteligentes** | **nenhum** (`proof: []` em `src/data/services.ts`) |
| **Automação de processos** | **nenhum** (`proof: []`) |
| Ferramentas e calculadoras comerciais | OrçaFácil |

A bancada do topo tem as abas "Planilha" e "Automação", mas são ilustrações. Quem procura
justamente esses serviços não encontra nada para abrir e testar.

Os dois projetos seguem as regras dos atuais: empresa e dados fictícios, identificados como
demonstrativos, funcionalidades reais, sem números de resultado inventados.

---

## Projeto 6: planilha de caixa e estoque para pequeno comércio

**Nome de trabalho:** Caixa em Dia (pode mudar).
**Empresa fictícia:** Empório Serra Azul, uma loja de produtos naturais com um caixa e cerca de 25 produtos.

### Problema que representa
O comércio anota vendas e gastos no caderno ou numa planilha simples. No fim do mês não sabe
o resultado nem o que precisa repor, e só uma pessoa entende as contas.

### Como funciona
É um arquivo único, entregue em duas versões: **Excel (.xlsx)** e **Google Planilhas**
(com o link "fazer uma cópia"). Não usa macros, então abre no Excel 2016 ou mais novo, no
Excel on-line e no celular.

| Aba | O que faz |
| --- | --- |
| Início | Instruções curtas e legenda de cores (células para preencher × calculadas) |
| Lançamentos | Data, tipo (entrada ou saída), categoria e forma de pagamento escolhidas em listas, com validação de dados; valores negativos e datas inválidas são recusados |
| Produtos | Cadastro com custo, preço, estoque mínimo e margem calculada |
| Movimento de estoque | Entradas e saídas por produto; o saldo é atualizado sozinho |
| Resumo do mês | Escolha o mês numa lista: receitas, despesas, resultado e despesas por categoria (SOMASES), além dos produtos abaixo do estoque mínimo |
| Painel | Gráficos de receitas × despesas por mês e de despesas por categoria |

Detalhes que dão credibilidade:
- Fórmulas protegidas contra edição acidental (sem senha, apenas proteção das células) e células de preenchimento destacadas.
- Formatação condicional: estoque baixo fica em vermelho e resultado negativo é destacado.
- Dados fictícios de três meses, com cerca de 150 lançamentos, para os gráficos terem sentido.

### No portfólio
- Estudo de caso no mesmo formato dos atuais: quem usa, roteiro para testar, adaptações e como pedir orçamento.
- Capturas reais e um vídeo curto da planilha em uso.
- Botões **Baixar a planilha (.xlsx)** e **Abrir cópia no Google Planilhas**. O site já tem o
  campo `extra` em `src/data/projects.ts` para isso.
- Passa a ser a prova de **Planilhas inteligentes** e, em parte, de **Dashboards**.

### Roteiro para testar (rascunho)
1. Lance uma venda e uma despesa na aba Lançamentos.
2. Registre a saída de um produto e veja o estoque baixar.
3. Troque o mês no Resumo e confira o resultado.
4. Veja o produto abaixo do mínimo destacado.

### Como verificar antes de publicar
- Casos de teste com resultado conhecido, por exemplo um mês com totais calculados à mão.
- Recalcular o arquivo no LibreOffice em modo automático e comparar os totais.
- Abrir no Excel e no Google Planilhas e conferir as listas, a proteção e os gráficos.

### Possibilidades para um cliente real
Categorias e produtos próprios, mais de um caixa ou loja, importação de extrato bancário,
versão em painel web (como o Gestão360) quando a planilha ficar pequena.

---

## Projeto 7: automação de relatório de vendas

**Nome de trabalho:** FluxoPronto (pode mudar).
**Empresa fictícia:** Padaria Pão Dourado, com duas lojas, cada uma exportando as vendas num formato diferente.

### Problema que representa
Toda semana alguém junta as planilhas das lojas, corrige datas e valores, remove duplicados,
monta o relatório e manda um resumo pelo WhatsApp. É trabalho repetitivo e sujeito a erro.

### Como funciona (tudo no navegador, sem servidor)
É uma página interativa que mostra a automação em etapas visíveis:

1. **Entrada:** carregar os arquivos de exemplo das duas lojas (CSV, formatos diferentes) ou enviar um CSV próprio. O arquivo é lido no navegador e não sai do computador.
2. **Padronização:** colunas mapeadas para um formato único, datas e valores convertidos para o padrão brasileiro.
3. **Conferência:** linhas duplicadas, datas inválidas e valores vazios são listados para revisão, sem descarte silencioso.
4. **Consolidação:** totais por loja, por dia e por categoria de produto.
5. **Saídas:**
   - relatório semanal para imprimir ou salvar em PDF, com a mesma técnica do OrçaFácil;
   - CSV consolidado para o Excel, com o mesmo padrão do Gestão360;
   - resumo pronto para copiar e colar no WhatsApp.

Cada etapa mostra o que entrou, o que mudou e o que saiu. É isso que torna a automação
compreensível para quem não programa.

### No portfólio
- Estudo de caso no formato atual, com um vídeo da automação rodando.
- Passa a ser a prova de **Automação de processos**.
- Opcional, numa segunda fase: um modelo de **Google Planilhas + formulário** que mostra a
  automação "formulário → planilha → resumo" na conta do próprio visitante. Fica fora da
  primeira entrega porque depende de permissões do Google na conta de quem testa.

### Roteiro para testar (rascunho)
1. Carregue os arquivos de exemplo das duas lojas.
2. Veja as linhas com problema apontadas na conferência.
3. Gere o relatório da semana e o resumo para o WhatsApp.
4. Exporte o CSV consolidado.

### Como verificar antes de publicar
- Testes unitários das regras: conversão de datas e valores, detecção de duplicados e totais. Seguem o padrão dos testes que já existem em `tests/unidade/`.
- Testes de navegador: carregar os exemplos, gerar o relatório, copiar o resumo e exportar o CSV.

### Possibilidades para um cliente real
Leitura direta dos arquivos do sistema de vendas usado pelo cliente, execução agendada (por
exemplo com Google Apps Script), envio automático por e-mail e mais lojas ou fontes de dados.

---

## O que não entra nesta proposta
- Nenhum número de tempo economizado ou de aumento de vendas.
- Nenhum cliente real, depoimento ou logotipo de terceiros.
- Nenhum cartão "em breve" no site antes de o projeto existir.

## Ordem sugerida
1. **Planilha (Projeto 6).** É o menor escopo e cobre o serviço mais procurado por pequenos negócios. Também reaproveita o campo `extra` do site.
2. **Automação (Projeto 7).** Reaproveita a exportação CSV e a impressão em PDF que já existem nas demonstrações.

Depois de aprovados, cada projeto entra em `src/data/projects.ts` e no `proof` do serviço
correspondente, com as mesmas verificações dos atuais (`verify:dist` e testes de navegador).
