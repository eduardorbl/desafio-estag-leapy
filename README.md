# Desafio de Estágio — Leapy

Repositório com dois desafios independentes:

- 01 — Interface (lista de talentos) usando Postgres/Directus (bônus) e Next.js (bônus)
- 02 — Coin Change (algoritmo) com testes e CI linguagem-agnósticos (via Docker)

Cada candidato deve fazer fork, implementar e abrir PR com sua solução. Leia os READMEs dentro de cada diretório.

## Sumário

- `01-interface-talent/` — Instruções, `docker-compose` com Directus/Postgres, `schema.sql`/`seed.sql`, exemplos de endpoints
- `02-coin-change/` — Enunciado, contrato de I/O, `tests` (harness e cases), `runner.yml` e exemplos (Node/Python)
- `.github/workflows/` — Workflows de CI

## Requisitos de Submissão

1. Faça fork deste repositório
2. Crie uma branch por desafio (`feat/interface-seunome`, `feat/coin-change-seunome`)
3. Implemente sua solução e atualize o README do desafio com instruções claras de setup/execução
4. Abra um PR por desafio descrevendo decisões, trade-offs e incluindo screenshots/GIFs quando aplicável
5. Para o desafio de interface, forneça instruções claras de como rodar o projeto (back + front). Sem essas instruções, o projeto não será avaliado. Deploy público é opcional

## Critérios de Avaliação (resumo)

- Interface (60%):
  - Correção e filtros (25%)
  - UX/UI e acessibilidade (15%)
  - Código/arquitetura/performance (15%)
  - Testes e docs (5%)
- Coin Change (40%):
  - Correção (25%)
  - Qualidade e complexidade (10%)
  - Testes e docs (5%)

Detalhes completos nos READMEs de cada desafio.

## Directus — Referências e Guia Rápido

- Este repositório inclui um ambiente de dados baseado em Directus + Postgres para o desafio de interface (veja `01-interface-talent/directus/docker-compose.yml`).
- Para conhecer recursos, API (REST/GraphQL), SDK e guias de integração frontend, consulte a documentação oficial do Directus: [Directus Documentation](https://directus.io/docs/)
- Passos típicos:
  - Subir o ambiente com Docker Compose
  - Configurar variáveis de ambiente conforme `.env.example`
  - Popular o banco com `schema.sql` e `seed.sql`
  - Consumir a API do Directus no frontend (REST/GraphQL) ou via um BFF
