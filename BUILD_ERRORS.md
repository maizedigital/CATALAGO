# BUILD_ERRORS.md — MB

## Build (npm run build)

**Status:** PASSOU (exit 0)

```
vite v5.4.8 building for production...
✓ 1697 modules transformed.
dist/index.html                   1.29 kB │ gzip:   0.58 kB
dist/assets/index-DGRvSYpt.css   43.44 kB │ gzip:   7.45 kB
dist/assets/index-CELzCj4H.js   477.65 kB │ gzip: 129.07 kB
✓ built in 12.68s
```

Nenhum erro de build.

## TypeScript (npx tsc --noEmit -p tsconfig.app.json)

**Status:** PASSOU (exit 0, sem output)

Nenhum erro de tipo.

## Lint (npm run lint)

**Status:** PASSOU com warnings (exit 0, 21 problemas: 17 erros, 4 warnings)

Todos os 17 erros são da regra `@typescript-eslint/no-explicit-any` na Edge Function `admin-api/index.ts` (código Deno/TypeScript). Estes não bloqueiam o build nem o typecheck.

### Detalhes dos erros de lint

| Arquivo | Linha | Regra | Descrição |
|---|---|---|---|
| `src/pages/admin/AdminProductForm.tsx` | 52:36 | `@typescript-eslint/no-unused-vars` | Variável `_created_at` atribuída mas não usada (warning) |
| `supabase/functions/admin-api/index.ts` | 41:68 | `no-explicit-any` | Uso de `any` em reduce de produtos |
| `supabase/functions/admin-api/index.ts` | 42:61 | `no-explicit-any` | Uso de `any` em filter de eventos |
| `supabase/functions/admin-api/index.ts` | 43:63 | `no-explicit-any` | Uso de `any` em filter de produtos |
| `supabase/functions/admin-api/index.ts` | 241:58 | `no-explicit-any` | Uso de `any` em reduce de clientes |
| `supabase/functions/admin-api/index.ts` | 242:49 | `no-explicit-any` | Uso de `any` em filter de clientes |
| `supabase/functions/admin-api/index.ts` | 243:44 | `no-explicit-any` | Uso de `any` em filter de leads |
| `supabase/functions/admin-api/index.ts` | 244:61 | `no-explicit-any` | Uso de `any` em filter de eventos |
| `supabase/functions/admin-api/index.ts` | 272:38 | `no-explicit-any` | Uso de `any` em função countByProduct |
| `supabase/functions/admin-api/index.ts` | 290:77 | `no-explicit-any` | Uso de `any` em map de rankings |
| `supabase/functions/admin-api/index.ts` | 379:42 | `no-explicit-any` | Uso de `any` em parâmetro de okOrError |
| `supabase/functions/admin-api/index.ts` | 383:31 | `no-explicit-any` | Uso de `any` em parâmetros de groupByDay |
| `supabase/functions/admin-api/index.ts` | 383:45 | `no-explicit-any` | Uso de `any` em parâmetros de groupByDay |
| `supabase/functions/admin-api/index.ts` | 383:60 | `no-explicit-any` | Uso de `any` em parâmetros de groupByDay |

### Possível causa

A Edge Function `admin-api` é código Deno que manipula resultados do Supabase client sem tipagem forte (o cliente retorna `any` por padrão). Os tipos `any` poderiam ser substituídos por interfaces ou `unknown` com type guards, mas isso não afeta o funcionamento.

## Resumo

| Verificação | Resultado |
|---|---|
| Build (`npm run build`) | OK |
| TypeScript (`tsc --noEmit`) | OK |
| Lint (`npm run lint`) | 17 erros `no-explicit-any` (não bloqueantes) + 4 warnings |
