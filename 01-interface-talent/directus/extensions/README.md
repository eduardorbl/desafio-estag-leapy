# Directus Extensions

Este diretório é mapeado para `/directus/extensions` no container do Directus, permitindo que você desenvolva e carregue extensions customizadas.

## Tipos de Extensions Disponíveis

Baseado na [documentação oficial do Directus](https://directus.io/docs/guides/extensions):

- **API Extensions**: [Endpoints](https://directus.io/docs/guides/extensions/api-extensions/endpoints) para criar rotas API customizadas
- **API Extensions**: [Event Hooks](https://directus.io/docs/guides/extensions/api-extensions/hooks) para executar código durante eventos do Directus
- **Bundles**: [Bundles](https://directus.io/docs/guides/extensions/bundles) para agrupar múltiplas extensions
- **Flow Operations**: operações customizadas para Flows (automação no-code)

## Como Criar uma Extension

### Via CLI do Directus

1. Instale o CLI globalmente:

```bash
npm install -g directus
```

2. Crie uma nova extension:

```bash
cd 01-interface-talent/directus
directus extensions create
```

Escolha o tipo (endpoint, hook, bundle, etc.)

### Manualmente

Crie um diretório em `extensions/` seguindo a estrutura padrão:

```
extensions/
└─ my-extension/
   ├─ package.json
   └─ src/
      └─ index.ts (ou index.js)
```

## Exemplo: API Endpoint

Para criar um endpoint customizado que retorna estatísticas dos talentos:

```typescript
// extensions/talent-stats/src/index.ts
export default (router, context) => {
  const { database } = context;

  router.get("/stats", async (req, res) => {
    const stats = await database
      .select(database.raw("COUNT(*) as total"))
      .from("talents");

    res.json(stats);
  });
};
```

Acesse via: `GET http://localhost:8055/talent-stats/stats`

## Observações

- Extensions são **opcionais** neste desafio, mas são valorizadas na avaliação
- Use extensions para customizar o backend quando precisar de lógica não coberta pela API padrão do Directus
- O volume está mapeado e `EXTENSIONS_AUTO_RELOAD=true` está ativo — alterações serão recarregadas automaticamente

## Documentação Completa

- [Directus Extensions Overview](https://directus.io/docs/guides/extensions/overview)
- [API Extensions](https://directus.io/docs/guides/extensions/api-extensions/endpoints)
- [App Extensions](https://directus.io/docs/guides/extensions/app-extensions/overview)
