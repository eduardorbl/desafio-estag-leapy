# Desafio 02 — Coin Change

Implemente uma solução para o problema de Coin Change. Linguagem livre, mas você deve fornecer um `Dockerfile` e um `runner.yml` descrevendo como executar sua solução via CLI.

## Contrato de I/O (obrigatório)

- Entrada (stdin) JSON: `{ "coins": number[], "amount": number }`
- Saída (stdout) JSON: `{ "minCoins": number }`

Exemplo:

```json
{ "coins": [1, 2, 5], "amount": 11 }
```

```json
{ "minCoins": 3 }
```

## Como rodar os testes

Localmente:

```bash
npm install
npm test
```

No CI (GitHub Actions) os testes serão executados automaticamente ao abrir o PR.

## Requisitos

- Fornecer `Dockerfile` que constrói uma imagem capaz de executar o comando definido em `runner.yml`.
- Manter o contrato de I/O e saída estritamente conforme descrito.
- Opcional: testes próprios adicionais e documentação.

## Arquivos fornecidos

- `tests/cases.json` — casos de teste oficiais
- `tests/harness.js` — test runner genérico
- `runner.yml` — contrato do comando de execução

## Observações importantes

- Você deve propor e implementar sua própria solução. Nenhum código de solução está incluído neste repositório.
- Garanta que sua solução siga o contrato de I/O descrito acima.
- O `Dockerfile` deve ser capaz de construir uma imagem que execute o comando definido em `runner.yml`.
