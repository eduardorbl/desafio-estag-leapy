# Soluções Implementadas - Desafio Leapy

## ✅ Desafios Completados

### 01 - Interface de Talentos
**Stack:** Next.js 15 + TypeScript + Tailwind CSS + PostgreSQL + Directus  
**Funcionalidades implementadas:**
- 🔍 **8 filtros funcionais** (email, departamento, status, PDI, orchestrator, datas, líder, cargo)
- 📊 **Ordenação interativa** (↑/↓ por data de atualização)
- 📥 **Export CSV** (até 10k registros filtrados)
- 🔗 **Deep-linking** (URL sync - compartilhe filtros via link)
- ♿ **Acessibilidade completa** (ARIA, navegação por teclado)
- 📱 **Design responsivo** (tabela em desktop, cards em mobile)

**Arquitetura:** BFF pattern (Backend for Frontend) com Route Handlers do Next.js

### 02 - Coin Change
**Stack:** Python 3.12 + Docker + Node.js (test harness)  
**Algoritmo:** Programação Dinâmica (bottom-up)  
**Complexidade:** O(n×m) tempo, O(n) espaço  
**Resultados:** ✅ 5/5 casos de teste passando
## 📁 Estrutura

```
├── 01-interface-talent/          # Interface web completa
│   ├── directus/                 # Backend (PostgreSQL + Directus)
│   ├── web/                      # Frontend (Next.js 15)
│   ├── TECHNICAL.md              # Decisões arquiteturais
│   └── README.md                 # Setup detalhado
├── 02-coin-change/               # Algoritmo + testes
│   ├── main.py                   # Solução DP
│   ├── Dockerfile                # Container Alpine
│   ├── tests/                    # Suite de testes
│   └── README.md                 # Análise algoritmo
└── .github/workflows/            # CI/CD pipelines
```

## 🔧 Principais Decisões Técnicas

**Interface:**
- **BFF pattern** - Token de autenticação seguro no servidor
- **Dynamic Programming** - Garantia de solução ótima vs algoritmos greedy
- **Alpine Linux** - Containers 50MB menores, builds 30x mais rápidos
- **Server-side pagination** - Performance com datasets grandes
- **URL sync** - UX enterprise (compartilhamento, navegação browser)

**Algoritmo:**
- **Programação dinâmica bottom-up** - O(n×m) eficiente, sem overhead de recursão
- **Docker multi-stage** - Python + Node.js em container otimizado
- **Tratamento de edge cases** - Valor 0, impossíveis, entradas malformadas

## 📊 Validação Completa

- ✅ **100 talentos** carregados e filtráveis
- ✅ **8 filtros** testados individualmente e em combinação
- ✅ **Ordenação** funcionando (25 com orchestrator NULL, 75 preenchidos)
- ✅ **Export CSV** com dados reais (escaping correto de aspas)
- ✅ **5 casos de teste** algoritmo passando
- ✅ **CI/CD** rodando automaticamente no GitHub Actions
- ✅ **A11y** completa (aria-live, aria-sort, aria-busy, keyboard nav)

---

**Desenvolvido por José Eduardo Santos Rabelo**  
**GitHub:** [@eduardorbl](https://github.com/eduardorbl/desafio-estag-leapy)
