# Coin Change - Solução com Programação Dinâmica

Implementação do problema clássico de Coin Change utilizando programação dinâmica bottom-up. A solução encontra o número mínimo de moedas necessárias para formar um valor específico, ou retorna -1 caso seja impossível.

## Problema

Dado um conjunto de denominações de moedas e um valor alvo, determinar o **menor número de moedas** necessário para formar esse valor. Se for impossível formar o valor com as moedas disponíveis, retornar -1.

**Exemplo:**
- Moedas: `[1, 2, 5]`
- Valor: `11`
- Resposta: `3` (5 + 5 + 1)

## Solução Implementada

### Abordagem: Programação Dinâmica (Bottom-Up)

A solução utiliza programação dinâmica com a seguinte estratégia:

1. **Subestrutura ótima**: Se conhecemos a solução ótima para valores menores, podemos construir a solução para valores maiores
2. **Subproblemas sobrepostos**: Calculamos cada subproblema uma única vez e reutilizamos o resultado
3. **Construção incremental**: Partimos do caso base (valor 0 = 0 moedas) e construímos soluções até o valor alvo

### Por que escolhi Programação Dinâmica?

**Análise de complexidade das alternativas:**

| Abordagem | Complexidade Temporal | Complexidade Espacial | Viabilidade |
|-----------|----------------------|----------------------|-------------|
| Força Bruta (recursão) | O(k^n) exponencial | O(n) pilha | ❌ Inviável para valores grandes |
| Greedy (guloso) | O(n log n) | O(1) | ❌ Não garante solução ótima |
| **Programação Dinâmica** | **O(n × m)** | **O(n)** | **✅ Ótimo e eficiente** |
| Memoização (top-down) | O(n × m) | O(n) | ✅ Equivalente, mas overhead de recursão |

Onde:
- `n` = valor alvo (amount)
- `m` = número de moedas disponíveis
- `k` = número médio de opções em cada passo

**Decisão:** Escolhi programação dinâmica bottom-up porque:

1. **Garantia de solução ótima**: Diferente do algoritmo greedy, sempre encontra o mínimo global
2. **Eficiência prática**: O(n × m) é polinomial e aceitável para os casos de teste
3. **Sem overhead de pilha**: Bottom-up evita o custo de chamadas recursivas da memoização
4. **Código simples**: Implementação direta com dois loops aninhados

**Exemplo de falha do greedy:**
- Moedas: `[1, 3, 4]`
- Valor: `6`
- Greedy escolheria: `4 + 1 + 1 = 3 moedas` ❌
- Solução ótima: `3 + 3 = 2 moedas` ✅

### Implementação

```python
def min_coins(coins, amount):
    if amount == 0: return 0
    if not coins or amount < 0: return -1

    INF = amount + 1  # Valor sentinela (impossível ter mais moedas que o valor)
    dp = [0] + [INF] * amount  # dp[i] = mínimo de moedas para valor i

    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return dp[amount] if dp[amount] != INF else -1
```

**Invariante do loop:**
- Após processar `i`, `dp[i]` contém o número mínimo de moedas para formar o valor `i`
- Se `dp[i] == INF`, é impossível formar o valor `i` com as moedas disponíveis

## Contrato de Interface (I/O)

### Entrada (stdin)
JSON com formato:
```json
{
  "coins": [1, 2, 5],
  "amount": 11
}
```

**Campos:**
- `coins`: array de inteiros positivos (denominações disponíveis)
- `amount`: inteiro não-negativo (valor alvo)

### Saída (stdout)
JSON com formato:
```json
{
  "minCoins": 3
}
```

**Campo:**
- `minCoins`: número mínimo de moedas, ou -1 se impossível

## Instruções de Execução

### Pré-requisitos

- **Opção 1 (Docker):** Docker instalado
- **Opção 2 (Local):** Python 3.8+ ou Node.js 18+ (para testes)

### Executar com Docker

```bash
cd 02-coin-change 

# 1. Construir a imagem
docker build -t coin-change .

# 2. Executar com entrada via pipe
echo '{"coins":[1,2,5],"amount":11}' | docker run -i coin-change
```

**Saída esperada:**
```json
{"minCoins":3}
```

### Executar localmente (Python)

```bash
# Executar diretamente
echo '{"coins":[1,2,5],"amount":11}' | python3 main.py

# Ou com arquivo
python3 main.py < input.json
```

### Executar testes automatizados

**Importante:** Os testes são em JavaScript (Node.js), mas testam sua solução em Python via Docker. O test runner executa o container e valida as saídas.

```bash
# Instalar dependências do test runner
npm install

# Executar suite de testes (executa Docker automaticamente)
npm test
```

**Como funciona:**
1. O test runner (`harness.js`) lê os casos de `tests/cases.json`
2. Para cada caso, executa `docker run -i coin-change` com entrada JSON
3. Captura a saída stdout e compara com o esperado
4. Reporta sucessos/falhas

**Casos de teste incluídos:**
1. `[1,2,5]` para valor `11` → 3 moedas (5+5+1)
2. `[2]` para valor `3` → -1 (impossível)
3. `[1]` para valor `0` → 0 moedas (caso base)
4. `[1,3,4]` para valor `6` → 2 moedas (3+3)
5. `[5,10,25]` para valor `30` → 2 moedas (25+5)

## Estrutura do Projeto

```
02-coin-change/
├── main.py              # Implementação da solução
├── Dockerfile           # Container para execução
├── runner.yml           # Definição do comando de execução
├── package.json         # Configuração do test runner
├── tests/
│   ├── cases.json       # Casos de teste oficiais
│   └── harness.js       # Test runner genérico
└── README.md            # Documentação
```

## Análise de Complexidade

**Tempo:** O(n × m)
- `n` = valor alvo (amount)
- `m` = número de denominações de moedas
- Loop externo: n iterações
- Loop interno: m iterações por valor

**Espaço:** O(n)
- Array `dp` com tamanho `n + 1`
- Variáveis auxiliares: O(1)

## Casos Especiais Tratados

1. **Valor zero**: Retorna 0 (não precisa de moedas)
2. **Array vazio**: Retorna -1 (impossível sem moedas)
3. **Valor negativo**: Retorna -1 (entrada inválida)
4. **Valor impossível**: Retorna -1 (ex: moedas pares para valor ímpar)
5. **Entrada malformada**: Retorna -1 (mantém contrato de saída)

## Validação

A solução foi testada contra:
- 5 casos de teste oficiais (incluídos em `tests/cases.json`)
- Casos extremos (valor 0, impossível, moedas únicas)
- Entradas inválidas (JSON malformado, tipos incorretos)

Todos os testes passam com sucesso no ambiente local e no CI/CD.

## Decisões de Implementação

1. **Python 3.12**: Escolhido por simplicidade e clareza do código
2. **Sem dependências externas**: Apenas stdlib (json, sys)
3. **INF = amount + 1**: Sentinela seguro (nunca precisaremos de mais moedas que o valor)
4. **Saída compacta**: `separators=(",", ":")` remove espaços desnecessários
5. **Tratamento de erros**: Qualquer exceção retorna -1 mantendo o contrato

---

**Desenvolvido por José Eduardo Santos Rabelo**
