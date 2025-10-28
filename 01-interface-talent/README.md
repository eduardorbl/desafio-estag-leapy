# Desafio 01 — Interface de Talentos

Construa uma interface com lista de talentos, filtros e paginação usando os dados do Postgres/Directus deste projeto (bônus por usar Next.js).

Você deve fornecer instruções claras de como rodar o projeto (back + front). Sem essas instruções, o projeto não será avaliado.

## Objetivo

- Listagem de talentos com:
  - Barra de busca por `directus_users.email` (via join com `talents.user_id -> directus_users.id`)
  - Filtros (quanto mais, melhor pontuação):
    - `department`, `current_status`, `pdi_plan_ready`, `orchestrator_state`
    - intervalo `start_date`/`end_date`
    - `leader_id`, `target_role_id`
  - Ordenação: por `date_updated` (desc) e opcionalmente outras
  - Paginação server-side
- Exibir contagem de resultados, estado de carregamento e erros
- Responsividade e acessibilidade

## Stack

- Backend de dados: Postgres + Directus (fornecidos via docker-compose)
- Frontend: livre (bônus: Next.js + TypeScript)
- Integração: usar API REST/GraphQL do Directus ou um BFF (ex.: Next.js Route Handlers)

## Como rodar localmente

1. Pré-requisitos: Docker e Docker Compose
2. Copie o env exemplo e ajuste portas/credenciais se necessário:

```bash
cp directus/.env.example directus/.env
```

3. Suba os serviços:

```bash
docker compose -f directus/docker-compose.yml up -d --build
```

4. Aguarde o Directus iniciar. O `schema.sql` e `seed.sql` serão aplicados automaticamente (ver compose).
5. Use os exemplos em `api/rest.http` para testar endpoints/filters.

## Esquema e Dados

- Os schemas reais estão em `directus/seed/schema.sql`:
  - `public.talents`
  - `public.internship_leaders`
  - `public.target_roles`
  - (o Directus provisiona `directus_users`)
- Os dados fictícios devem ser gerados em `directus/seed/seed.sql` (~100 talentos, com relacionamentos válidos).

Observação: candidatos que não usarem Directus devem criar uma tabela de usuários compatível com o campo de busca por email (join por `user_id`).

## Directus — Dicas e Referências

- Documentação oficial: [Directus Documentation](https://directus.io/docs/)
- API: consulte os endpoints REST/GraphQL e autenticação (tokens) na doc.
- Busca por email: é comum expor o relacionamento com usuários via `fields=*,user_id.email`.
- CORS/ENV: ajuste `PUBLIC_URL`, tokens e origens conforme seu frontend.

## Extensions Customizadas (Opcional)

Você pode estender o Directus criando extensions customizadas no diretório `directus/extensions/`.

### Tipos de Extensions Disponíveis

- **API Endpoints**: [criar rotas API customizadas](https://directus.io/docs/guides/extensions/api-extensions/endpoints)
- **Event Hooks**: [executar código durante eventos](https://directus.io/docs/guides/extensions/api-extensions/hooks)
- **Bundles**: [agrupar múltiplas extensions](https://directus.io/docs/guides/extensions/bundles)

Consulte `directus/extensions/README.md` para instruções detalhadas sobre como criar e desenvolver extensions.

**Nota**: Extensions são opcionais mas são valorizadas na avaliação, especialmente para cenários que requerem lógica de backend customizada além da API padrão do Directus.

## Requisitos Técnicos

- Debounce na busca, paginação server-side, evitar N+1
- Tratamento de erros e estados vazios
- Qualidade de código, organização e documentação
- CORS e ENV configurados corretamente para integração frontend-backend

## Entrega

- Código + README com instruções claras de setup (back + front), variáveis de ambiente e scripts. Sem essas instruções, o projeto não será avaliado
- Abra um PR com descrição das decisões, trade-offs e, se possível, screenshots/GIFs

## Exemplos de Endpoints

Consulte `api/rest.http` para exemplos de filtros, paginação e join para buscar por email.
