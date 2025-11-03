# Interface de Talentos - Leapy

Interface web para gerenciamento e consulta de talentos com busca avançada, múltiplos filtros e paginação server-side.

## Funcionalidades

### Busca e Filtragem
- **Busca por email** com debounce (400ms)
- **8 filtros disponíveis:** department, status, PDI, orchestrator, intervalos de data, líder e cargo
- **Paginação server-side** configurável (10/20/50/100 registros por página)
- **Ordenação interativa** por data de atualização (↑ crescente / ↓ decrescente)
- **Export CSV** de todos os resultados filtrados (até 10.000 registros)
- **Deep-linking (URL sync)** - Compartilhe filtros via URL, estado persiste em navegação

### UX e Acessibilidade
- **Aria-live regions** para feedback de loading/resultados
- **Aria-sort** no header ordenável
- **Aria-busy** durante carregamento
- **Navegação por teclado** (Enter/Space para ordenar)
- **Tratamento de erros** e estados de carregamento com skeleton loaders
- **Interface responsiva** (tabela em desktop, cards em mobile)

## Stack Tecnológica

**Backend:**
- PostgreSQL 15
- Directus 10 (headless CMS + API REST)
- Docker Compose

**Frontend:**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React 19

**Arquitetura:** BFF (Backend for Frontend) - Next.js Route Handlers fazem proxy para Directus

## Pré-requisitos

- Docker e Docker Compose instalados e em execução
- Node.js 18+ e npm
- Portas disponíveis: 5432 (PostgreSQL), 8055 (Directus), 3000 (Next.js)

**Importante:** Certifique-se de que o Docker Desktop está rodando antes de executar os comandos. Se encontrar o erro `Cannot connect to the Docker daemon`, inicie o Docker Desktop e aguarde sua inicialização completa.

## Instruções de Instalação e Execução

### Passo 1: Configurar e Iniciar o Backend

```bash
cd directus
cp .env.example .env
docker compose up -d --build
```

Aguarde a inicialização completa dos serviços.

**Processo de inicialização automática:**
- PostgreSQL cria o banco de dados `leapy`
- Directus provisiona suas tabelas internas (`directus_*`)
- Usuário admin é criado (email: `admin@example.com`, senha: `admin`)
- Token estático é configurado no usuário admin
- Scripts de seed criam tabelas customizadas e populam dados:
  - 100 talentos fictícios (`talent0001@example.com` até `talent0100@example.com`)
  - 20 líderes (`leader01@example.com` até `leader20@example.com`)
  - 10 cargos/roles (`Role 1` até `Role 10`)

### Passo 2: Configurar e Iniciar o Frontend

```bash
cd ../web
npm install
cp .env.example .env.local
npm run dev
```

Acesse a aplicação em: http://localhost:3000

**Nota:** O token de autenticação está pré-configurado no arquivo `.env.example`. A aplicação redireciona automaticamente a rota raiz para `/talents`.

## Estrutura do Projeto

```
01-interface-talent/
├── directus/
│   ├── docker-compose.yml       # Orquestração (Postgres + Directus + Seed)
│   ├── .env.example            # Template de variáveis
│   └── seed/                   # Scripts SQL
│       ├── 01_schema_phase1.sql
│       ├── 02_schema_add_fk.sql
│       └── 20_seed_fixed.sql
├── web/
│   ├── src/app/
│   │   ├── api/                # Route Handlers (BFF)
│   │   │   └── talents/route.ts
│   │   └── talents/            # Interface principal
│   │       └── page.tsx
│   ├── .env.example
│   └── package.json
└── README.md                   # Documentação
```

## Filtros Disponíveis

| Filtro | Tipo | Valores |
|--------|------|---------|
| Email | Text | Busca parcial no email do usuário |
| Departamento | Select | Engineering, Design, Product, Marketing, Operations |
| Status | Select | ACTIVE, INACTIVE, ONBOARDING, PENDING_FIRST_ACCESS |
| Orchestrator | Select | ACTIVE, PENDING, PAUSED, DONE |
| PDI Pronto | Select | Sim / Não |
| Data Início | Date | Filtro >= (a partir de) |
| Data Fim | Date | Filtro <= (até) |
| Leader ID | Number | ID do líder (1-20) |
| Target Role ID | Number | ID do cargo alvo (1-10) |

## Schema do Banco de Dados

**Tabela `talents`:**
- `id`, `user_id` (→ directus_users), `department`, `current_status`
- `orchestrator_state`, `pdi_plan_ready`, `start_date`, `end_date`
- `leader_id` (→ internship_leaders), `target_role_id` (→ target_roles)
- `current_cycle`, `phone_number`, `date_created`, `date_updated`

**Relacionamentos:**
```
talents.user_id → directus_users.id (email, nome)
talents.leader_id → internship_leaders.id
talents.target_role_id → target_roles.id
```

## Testando a API

```bash
# Listar talentos
curl "http://localhost:3000/api/talents?page=1&limit=10"

# Buscar por email
curl "http://localhost:3000/api/talents?q=talent001"

# Múltiplos filtros
curl "http://localhost:3000/api/talents?department=Engineering&current_status=ACTIVE&page=1"
```

## Troubleshooting

### Docker daemon não está rodando

**Erro:** `Cannot connect to the Docker daemon at unix:///var/run/docker.sock`

**Solução:** Inicie o Docker Desktop e aguarde sua inicialização completa antes de executar comandos Docker.

### Directus não inicia
```bash
docker compose -f directus/docker-compose.yml logs directus
docker compose -f directus/docker-compose.yml down -v
docker compose -f directus/docker-compose.yml up -d --build
```

### Frontend não conecta
1. Verifique se Directus está rodando: http://localhost:8055
2. Confirme o token em `web/.env.local`
3. **Importante:** Reinicie o Next.js após criar/editar `.env.local`:
   - Pare o servidor (Ctrl+C)
   - Se necessário: `rm -rf .next` (limpa cache)
   - Rode novamente: `npm run dev`

### Erro "Invalid user credentials" ou 401 Unauthorized

**Causa:** O token não está configurado corretamente no `.env.local`

**Solução passo a passo:**

1. **Verifique se o token está no arquivo:**
   ```bash
   cd web
   cat .env.local
   ```
   
   **Se aparecer `your_token_here`**, o token não foi configurado!

2. **Gere um novo token no Directus:**
   - Acesse http://localhost:8055
   - Login: `admin@example.com` / `admin`
   - Clique no ícone do usuário (canto **inferior esquerdo**)
   - Selecione **"Admin User"**
   - Role até a seção **"Token"**
   - Clique em **"Regenerate Token"**
   - **Copie o token completo** (começa com `leapy_local_...`)

3. **Cole o token no arquivo `.env.local`:**
   ```bash
   nano .env.local
   # ou abra em qualquer editor de texto
   ```
   
   Deve ficar assim:
   ```bash
   DIRECTUS_URL=http://localhost:8055
   DIRECTUS_STATIC_TOKEN=leapy_local_abc123def456...  # seu token aqui
   ```

4. **Salve o arquivo e reinicie o Next.js:**
   ```bash
   # Pare o servidor (Ctrl+C)
   npm run dev
   ```

5. **Teste se está funcionando:**
   ```bash
   # Em outro terminal
   curl "http://localhost:3000/api/talents?limit=1"
   # Deve retornar JSON com dados, não erro 401
   ```

### Reiniciar do zero
```bash
cd directus
docker compose down -v
docker compose up -d --build

cd ../web
rm -rf node_modules .next
npm install
npm run dev
```

## Decisões Técnicas

- **BFF Pattern**: Next.js Route Handlers mantêm o token de autenticação no servidor, evitando exposição ao cliente e problemas de CORS
- **Server-Side Pagination**: Implementação de paginação no servidor reduz transferência de dados e melhora performance
- **Debounce (400ms)**: Técnica aplicada na busca para evitar requisições excessivas durante digitação
- **Design Responsivo**: Interface adaptativa com tabela completa em desktop e cards compactos em dispositivos móveis

## Observações Técnicas

### Usuários e Dados de Seed

O processo de inicialização cria automaticamente:

- 1 usuário administrador (via docker-compose): `admin@example.com` / senha: `admin`
- 100 talentos: `talent0001@example.com` até `talent0100@example.com`
- 20 líderes: `leader01@example.com` até `leader20@example.com`
- 10 cargos/roles: `Role 1` até `Role 10`

Total de 121 usuários após inicialização completa.

### Autenticação e Tokens

- O token estático do usuário admin está pré-configurado e não expira
- Tokens são específicos do ambiente e não devem ser compartilhados entre máquinas
- Para produção, recomenda-se criar roles com permissões mínimas necessárias
- Regenere tokens comprometidos através da interface do Directus

### Segurança

- Arquivos `.env` e `.env.local` não devem ser versionados (já configurado no `.gitignore`)
- Apenas arquivos `.env.example` devem estar no repositório
- Tokens e credenciais devem ser tratados como informações sensíveis

---

## Diagnóstico e Mudanças no Backend

Esta seção documenta os problemas encontrados na estrutura original do backend e as soluções implementadas para garantir uma inicialização reprodutível e íntegra do banco de dados.

### Baseline (Repositório Original)

**Stack:** PostgreSQL + Directus

**Arquivos originais:**
- `schema.sql` - Tabelas de domínio: `internship_leaders`, `talents`, `target_roles` + índices/FKs
- `seed.sql` - Dados fictícios: ~20 líderes, 10 target roles, 100 talentos

**Compose original:**
- Montava `schema.sql` e `seed.sql` em `/docker-entrypoint-initdb.d/` dentro do Postgres (executavam automaticamente no primeiro boot)
- `directus` apenas dependia de `postgres`, sem aguardar a criação das tabelas internas do Directus

### Problemas Identificados

#### P1) Ordem de Inicialização Incorreta

**Causa:** `schema.sql`/`seed.sql` executavam **antes** do Directus criar suas tabelas internas.

**Efeito:** Erro ao criar FKs que referenciam `directus_users`:
```
ERROR: relation "directus_users" does not exist
```

#### P2) Foreign Keys Cíclicas

**Causa:** `talents.target_role_id → target_roles(id)` **E** `target_roles.talent_id → talents(id)`.

**Efeito:** Criar ambas as FKs durante o `CREATE TABLE` quebra por ordem de criação - não é possível criar duas tabelas ao mesmo tempo quando ambas referenciam uma à outra.

#### P3) Seed Sem Integridade Referencial

**Causa:** O seed gerava `user_id` com `gen_random_uuid()` em `internship_leaders` e `talents`, **sem** inserir os **mesmos UUIDs** em `directus_users`.

**Efeito:** `INSERT` falhava por **violação de FK** - os usuários referenciados não existiam na tabela `directus_users`.

**Resumo dos Problemas:**
1. Execução cedo demais (antes do Directus inicializar)
2. Ciclo de FKs criado de imediato
3. Seed que não cria os usuários requeridos

### Soluções Implementadas

#### M1) Orquestração no `docker-compose.yml`

**Mudança:** Removemos os mounts de `schema.sql`/`seed.sql` em `/docker-entrypoint-initdb.d/` do Postgres.

**Por quê:** Evitar que rodem **antes** do Directus provisionar `directus_users`.

**Adicionamos:**
- `healthcheck` no Postgres
- Serviço dedicado **`db-seed`** que:
  - Espera Postgres saudável **E** Directus inicializado
  - Executa os SQLs na **ordem correta** via `psql -h postgres -U postgres -d leapy`

#### M2) Schema em Duas Fases

**Arquivo 1:** `01_schema_phase1.sql`
- Cria `internship_leaders` e `talents` (com índices)
- Cria `target_roles` **sem** a FK de volta para `talents`

**Arquivo 2:** `02_schema_add_fk.sql`
- Adiciona **depois** a FK cíclica com `ALTER TABLE`

**Por quê:** FKs circulares devem ser adicionadas após ambas as tabelas existirem.

#### M3) Seed Referencial Corrigido

**Arquivo:** `20_seed_fixed.sql`

**Mudanças:**
1. `CREATE EXTENSION IF NOT EXISTS pgcrypto;` - para `gen_random_uuid()`
2. Insere 10 `target_roles`
3. Cria **20 usuários** em `directus_users` (com UUIDs) e usa **os mesmos UUIDs** em `internship_leaders.user_id`
4. Cria **100 usuários** em `directus_users` e usa **os mesmos UUIDs** em `talents.user_id`
5. Garante `leader_id ∈ [1..20]` e `target_role_id ∈ [1..10]` válidos
6. Configura token estático no usuário admin para facilitar testes

**Por quê:** Fechar **todas** as FKs (`user_id`, `leader_id`, `target_role_id`) com registros **existentes**, eliminando violações de integridade referencial.

> **Nota:** A extensão `pgcrypto` foi usada **apenas** para gerar UUIDs no SQL de forma prática e compatível com PostgreSQL.

### Como Verificar se Funcionou

**1. Acompanhar o seed:**
```bash
docker logs -f leapy_db_seed
```

**Saída esperada:**
```
Criação das tabelas/índices ✓
Adição da FK cíclica ✓
Inserts (10/20/100) ✓
DB-SEED: done.
```

**2. Checar contagens:**
```bash
docker exec -it leapy_pg psql -U postgres -d leapy -c \
"SELECT (SELECT COUNT(*) FROM public.target_roles) roles, \
        (SELECT COUNT(*) FROM public.internship_leaders) leaders, \
        (SELECT COUNT(*) FROM public.talents) talents;"
```

**Resultado esperado:**
```
 roles | leaders | talents 
-------+---------+---------
    10 |      20 |     100
```

### Resultado Final

- Inicialização determinística com ordem de execução correta
- Foreign keys válidas, incluindo referências a `directus_users`
- Banco de dados preenchido com 10 roles, 20 líderes e 100 talentos
- Directus operacional para queries com join por email, filtros e paginação server-side

### Arquivos Modificados

**Arquivo `docker-compose.yml`:**
- Removidos mounts automáticos de `schema.sql`/`seed.sql` no container Postgres
- Adicionado `healthcheck` no serviço postgres
- Criado serviço dedicado `db-seed` que aguarda inicialização e executa SQLs na ordem correta

**Scripts SQL criados:**
- `01_schema_phase1.sql` - Criação de tabelas e índices sem FK cíclica
- `02_schema_add_fk.sql` - Adição da FK cíclica via `ALTER TABLE`
- `20_seed_fixed.sql` - Seed com integridade referencial, incluindo criação dos `directus_users` correspondentes

**Impacto:** Nenhuma alteração no modelo de dados, apenas correção da ordem de execução e garantia de integridade referencial.

---

**Desenvolvido por José Eduardo Santos Rabelo**

````
