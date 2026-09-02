# PROJECT_CONTEXT.md — MB

## Objetivo

E-commerce / catálogo de moda feminina e masculina da marca **MB**. O site exibe produtos, permite filtragem, e direciona o checkout via WhatsApp. Possui um painel administrativo completo para gestão de produtos, pedidos, clientes, leads e analytics.

## Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **Estilização:** Tailwind CSS 3 (configuração customizada com paleta neutral/stone + accent amber)
- **Roteamento:** react-router-dom 7
- **Ícones:** lucide-react
- **Fontes:** Inter (sans) + Cormorant Garamond (serif) via Google Fonts
- **Backend/Banco:** Supabase (PostgreSQL) — catálogo, CRM, tracking, auth admin
- **Edge Functions:** Deno (Supabase Functions) — `admin-api` e `admin-login`
- **Persistência local:** localStorage (carrinho, visitor ID, auth token admin)

## Arquitetura

### Frontend (SPA)

O app é uma Single Page Application renderizada no cliente. O ponto de entrada é `src/main.tsx` → `src/App.tsx`.

**Providers aninhados (ordem de fora para dentro):**
1. `ErrorBoundary` — captura erros de renderização
2. `BrowserRouter` — roteamento
3. `AdminAuthProvider` — gerencia autenticação do admin (token no localStorage)
4. `CartProvider` — gerencia carrinho (persistido em localStorage)
5. `TrackingProvider` — rastreamento de visitantes e eventos (Supabase)

**Layout público:** `Header` + `<main>` + `Footer` + `CartDrawer` + `WhatsAppButton` + `LeadCaptureModal`

**Layout admin:** `AdminLayout` (sidebar + header mobile) — envolve todas as rotas `/admin/*` protegidas por `ProtectedRoute`.

### Backend (Supabase)

- **Banco:** PostgreSQL com RLS habilitado em todas as tabelas
- **Catálogo público:** tabelas `products`, `categories` — leitura anon + authenticated
- **CRM:** tabelas `leads`, `customers`, `orders`, `order_items` — leitura authenticated, escrita mista (anon para leads/customers via checkout, authenticated para admin)
- **Tracking:** tabelas `visitors`, `customer_events` — escrita anon, leitura authenticated
- **Admin auth:** tabela `admin_users` (sem RLS — acesso apenas via service role nas Edge Functions)
- **Storage:** bucket público `product-images` para upload de fotos via admin
- **Edge Functions:**
  - `admin-login` — autentica admin (bcrypt via `verify_password` RPC), retorna token de sessão
  - `admin-api` — API CRUD completa para produtos, pedidos, clientes, leads, eventos, dashboard, analytics, rankings, upload de imagens, settings, troca de senha

### Autenticação Admin

Não usa Supabase Auth nativo. Fluxo customizado:
1. Admin envia username + senha para a Edge Function `admin-login`
2. A função busca `admin_users` (via service role), valida senha com `verify_password` (bcrypt/pgcrypto)
3. Retorna um token base64 (id + timestamp + UUID) armazenado no localStorage
4. Requisções admin subsequentes enviam o token via header `X-Admin-Token` para a Edge Function `admin-api`
5. **Observação:** O token não é verificado criptograficamente — a Edge Function confia no header. O `admin-api` usa service role key diretamente, sem validar o token no banco.

### Checkout

O checkout **não processa pagamentos**. O cliente preenche dados de entrega e o pedido é formatado como mensagem de WhatsApp e enviado via `wa.me`. O registro do cliente é salvo/atualizado na tabela `customers` e o lead correspondente é marcado como "cliente".

## Estrutura de Pastas

```
src/
├── App.tsx                    # Rotas + providers
├── main.tsx                   # Entry point
├── index.css                  # Tailwind + estilos globais
├── components/                # Componentes reutilizáveis
├── pages/                     # Páginas públicas
├── pages/admin/               # Páginas do painel admin
├── hooks/                     # Hooks customizados (cart, tracking, auth, SEO, etc)
├── lib/                       # Clients e utilitários (supabase, adminApi, format)
├── config/                    # Configuração centralizada da marca
└── types/                     # Tipos TypeScript compartilhados
supabase/
├── config.toml                # Config das Edge Functions
├── migrations/                # Migrations SQL (8 arquivos)
└── functions/                 # Edge Functions (Deno)
    ├── admin-api/
    └── admin-login/
```

## Páginas Principais (Públicas)

| Rota | Arquivo | Função |
|---|---|---|
| `/` | `Home.tsx` | Homepage com hero, categorias, produtos em destaque/novidades/ofertas, promo banner |
| `/feminino` | `Catalog.tsx` | Catálogo feminino com filtros e ordenação |
| `/masculino` | `Catalog.tsx` | Catálogo masculino com filtros e ordenação |
| `/produto/:slug` | `ProductPage.tsx` | Página de produto individual com galeria, seletor de tamanho/cor, adicionar ao carrinho |
| `/carrinho` | `Cart.tsx` | Página do carrinho com revisão de itens |
| `/finalizar` | `Checkout.tsx` | Formulário de checkout (dados de entrega) → envia via WhatsApp |
| `/buscar` | `Search.tsx` | Resultados de busca |
| `/sobre` | `About.tsx` | Página institucional sobre a MB |
| `/contato` | `Contact.tsx` | Página de contato (WhatsApp, Instagram, endereço, horários) |
| `*` | `NotFound.tsx` | Página 404 |

## Páginas do Admin

| Rota | Arquivo | Função |
|---|---|---|
| `/admin/login` | `AdminLogin.tsx` | Tela de login |
| `/admin` | `AdminDashboard.tsx` | Dashboard com estatísticas |
| `/admin/produtos` | `AdminProducts.tsx` | Lista de produtos |
| `/admin/produtos/:id` | `AdminProductForm.tsx` | Formulário de criação/edição de produto |
| `/admin/pedidos` | `AdminOrders.tsx` | Lista de pedidos |
| `/admin/pedidos/:id` | `AdminOrderDetail.tsx` | Detalhe de pedido |
| `/admin/crm` | `AdminCRM.tsx` | Visão geral do CRM |
| `/admin/leads` | `AdminLeads.tsx` | Gestão de leads |
| `/admin/clientes` | `AdminCustomers.tsx` | Lista de clientes |
| `/admin/clientes/:id` | `AdminCustomerDetail.tsx` | Detalhe de cliente |
| `/admin/analytics` | `AdminAnalytics.tsx` | Analytics e gráficos |
| `/admin/configuracoes` | `AdminSettings.tsx` | Configurações da loja |

## Componentes Principais

| Componente | Função |
|---|---|
| `Header` | Cabeçalho com navegação, busca, carrinho, marquee de avisos |
| `Footer` | Rodapé com links, contatos, endereço, pagamentos |
| `Hero` | Banner principal da homepage com parallax |
| `CartDrawer` | Drawer lateral do carrinho com barra de progresso de frete grátis |
| `WhatsAppButton` | Botão flutuante de WhatsApp com pulse animation |
| `LeadCaptureModal` | Modal de captura de leads (nome + WhatsApp) com validação |
| `ProductCard` | Card de produto com hover effects, quick add, wishlist |
| `ProductFilter` | Painel de filtros (categoria, tamanho, cor, preço, ordenação) |
| `ProductGallery` | Galeria de imagens do produto com thumbnails |
| `ProductSelector` | Seletor de tamanho e cor |
| `ProductGrid` | Grid responsivo de produtos |
| `CategoryBanner` | Banner de categoria com reveal animation |
| `PromoBanner` | Banner promocional com CTA de WhatsApp |
| `CheckoutForm` | Formulário de checkout → WhatsApp |
| `AdminLayout` | Layout do admin (sidebar + conteúdo) |
| `ProtectedRoute` | Guard de rota admin |
| `ErrorBoundary` | Captura de erros de renderização |
| `Logo` | Logo da MB (imagem circular) |

## Hooks

| Hook | Função |
|---|---|
| `useCart` | Context do carrinho (items, total, add, remove, clear, drawer state) |
| `useTracking` | Context de tracking (trackEvent, visitor ID, WhatsApp ID) |
| `useAdminAuth` | Context de auth admin (isAuthenticated, login, logout) |
| `useProducts` | Busca lista de produtos ativos do Supabase |
| `useProduct` | Busca produto por slug |
| `useSearch` | Busca produtos por termo |
| `useSEO` | Atualiza title e meta tags dinamicamente |
| `useReveal` | IntersectionObserver para animações de scroll |

## Bibliotecas e Clients

| Arquivo | Função |
|---|---|
| `lib/supabase.ts` | Client Supabase (anon key) para uso no frontend |
| `lib/adminApi.ts` | Cliente HTTP para Edge Functions admin (com token), upload de imagens, login |
| `lib/format.ts` | Helpers: formatPrice, discountPercent, effectivePrice |
| `config/site.ts` | Configuração centralizada da marca (nome, WhatsApp, Instagram, endereço, horários, frete) |

## Banco de Dados

### Tabelas

| Tabela | RLS | Acesso anon | Acesso authenticated | Função |
|---|---|---|---|---|
| `products` | Sim | SELECT | CRUD | Catálogo de produtos |
| `categories` | Sim | SELECT | CRUD | Categorias |
| `product_variants` | Sim | SELECT | CRUD | Variantes (tamanho/cor/estoque) |
| `customers` | Sim | INSERT | SELECT/UPDATE/DELETE | Clientes do CRM |
| `orders` | Sim | — | CRUD | Pedidos |
| `order_items` | Sim | — | CRUD | Itens dos pedidos |
| `settings` | Sim | SELECT | CRUD | Configurações da loja (chave-valor) |
| `leads` | Sim | INSERT | SELECT/UPDATE/DELETE | Leads capturados no site |
| `customer_events` | Sim | INSERT | SELECT/DELETE | Eventos de tracking |
| `visitors` | Sim | INSERT/UPDATE | SELECT/DELETE | Visitantes únicos |
| `admin_users` | Não | — | (via service role apenas) | Usuários admin |
| `inventory_adjustments` | Sim | — | SELECT/INSERT | Histórico de ajustes de estoque |

### Functions (PostgreSQL)

| Função | Tipo | Função |
|---|---|---|
| `verify_password(p_password, p_hash)` | SECURITY DEFINER | Verifica senha contra hash bcrypt |
| `hash_password(p_password)` | SECURITY DEFINER | Gera hash bcrypt |

### Storage

| Bucket | Acesso | Função |
|---|---|---|
| `product-images` | Leitura pública, escrita authenticated | Imagens de produtos (upload via admin) |

### Migrations (ordem cronológica)

1. `20260825224915_mb_catalog_schema.sql` — Schema inicial (products, categories, customers, orders, settings + seed 20 produtos)
2. `20260825230242_mb_admin_crm_schema.sql` — admin_users, leads, customer_events, visitors + extensões de customers/orders
3. `20260825230303_mb_verify_password_function.sql` — Função verify_password
4. `20260825230329_mb_hash_password_function.sql` — Função hash_password
5. `20260826142855_mb_admin_products_extensions.sql.sql` — Colunas subcategory, stock_minimum, active em products + tabela inventory_adjustments
6. `20260826144433_mb_fix_verify_password_search_path.sql.sql` — Corrige search_path das funções para `extensions, public`
7. `20260827025145_mb_crm_customer_extensions.sql` — Colunas address, number, complement, updated_at em customers
8. `20260829181556_mb_product_images_bucket.sql` — Bucket público product-images

## Edge Functions

### `admin-login` (`supabase/functions/admin-login/index.ts`)
- **Método:** POST
- **Input:** `{ username, password }`
- **Output:** `{ token, username, id }`
- **verify_jwt:** false
- Autentica contra `admin_users` usando bcrypt via RPC `verify_password`

### `admin-api` (`supabase/functions/admin-api/index.ts`)
- **verify_jwt:** false
- API CRUD completa. Recursos: `dashboard`, `upload`, `products`, `orders`, `customers`, `leads`, `events`, `visitors`, `crm-dashboard`, `rankings`, `analytics`, `settings`, `change-password`
- Usa service role key (acesso total)
- CORS habilitado para todos os origins

## Funcionalidades Existentes

- Catálogo de produtos com filtros (categoria, tamanho, cor, preço) e ordenação
- Página de produto com galeria, seletor de tamanho/cor, adicionar ao carrinho
- Carrinho persistido em localStorage com drawer lateral
- Checkout via WhatsApp (dados de entrega → mensagem formatada)
- Captura de leads via modal (nome + WhatsApp com validação e máscara)
- Rastreamento de visitantes e eventos (page_view, product_view, add_to_cart, whatsapp_click, order_placed, lead_captured)
- Painel admin com login, dashboard, gestão de produtos (CRUD + upload de imagens), pedidos, CRM, leads, clientes, analytics, configurações
- SEO dinâmico (title + meta tags por página)
- Botão flutuante de WhatsApp
- Design responsivo com animações (parallax, reveal on scroll, marquee, hover effects)

## Funcionalidades Parcialmente Implementadas / Preparadas

- `product_variants` — tabela existe mas não é usada pelo frontend (variantes não são exibidas individualmente)
- `inventory_adjustments` — tabela existe para histórico de ajustes de estoque, mas o admin não registra ajustes
- `orders` / `order_items` — tabelas existem mas pedidos não são salvos no banco pelo checkout atual (apenas enviados via WhatsApp). O checkout salva/atualiza `customers` mas não cria `orders`.
- `settings` — tabela existe e o admin tem página de configurações, mas o frontend lê a configuração da marca de `src/config/site.ts` (hardcoded), não do banco
- `stock` e `stock_minimum` em `products` — campos existem no schema e no tipo TypeScript, mas o frontend não exibe nem gerencia estoque

## Problemas Conhecidos

1. **Token admin não validado:** A Edge Function `admin-api` não valida o token `X-Admin-Token` — confia apenas no header. Qualquer cliente com a service role key (anon key no header `Authorization`) pode acessar a API. O token é mais um identificador de sessão do que uma medida de segurança.
2. **Lint warnings:** 17 erros de `no-explicit-any` na Edge Function `admin-api` (Deno/TypeScript). Não bloqueiam o build.
3. **Settings duplicados:** A configuração da marca existe em dois lugares — `src/config/site.ts` (usada pelo frontend) e tabela `settings` no banco (editável pelo admin mas não lida pelo frontend).
4. **Seed desatualizado:** O seed inicial em `settings` ainda contém WhatsApp `5511999999999` e email `contato@mbmoda.com.br` — valores antigos. O `siteConfig` no código tem os valores corretos.
5. **Estoque no tipo Product:** O tipo `Product` em `src/types/index.ts` inclui `stock: number` e `stock_minimum?: number`, mas o projeto não deve ter sistema de estoque (ver seção abaixo).

## Referências a Estoque (NÃO REMOVER — documentar apenas)

O projeto **não deve** possuir sistema de estoque. No entanto, as seguintes referências existem:

| Arquivo | Linha | Referência |
|---|---|---|
| `src/types/index.ts` | 16 | `stock: number;` no tipo `Product` |
| `src/types/index.ts` | 28 | `stock_minimum?: number;` no tipo `Product` |
| `src/pages/admin/AdminProductForm.tsx` | 164 | `stock: 999,` (valor default ao criar produto) |
| `supabase/migrations/20260825224915_mb_catalog_schema.sql` | 42 | Coluna `stock integer NOT NULL DEFAULT 0` em `products` |
| `supabase/migrations/20260826142855_mb_admin_products_extensions.sql.sql` | 8 | Coluna `stock_minimum integer NOT NULL DEFAULT 5` em `products` |
| `supabase/migrations/20260826142855_mb_admin_products_extensions.sql.sql` | 16-35 | Tabela `inventory_adjustments` |

**Decisão:** Não remover nesta etapa. O Claude Code pode decidir remover estas referências posteriormente.

## Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento (servidor de dev)
npm run dev

# Build de produção
npm run build

# Lint
npm run lint

# Type check
npm run typecheck
# ou
npx tsc --noEmit -p tsconfig.app.json
```

## Configuração para Deploy

1. **Build:** `npm run build` gera a pasta `dist/` com assets estáticos
2. **Hosting:** O `dist/` pode ser hospedado em qualquer hosting estático (Netlify, Vercel, Cloudflare Pages, S3, etc.)
3. **Redirects:** O arquivo `public/_redirects` contém `/* /index.html 200` para suporte a SPA routing
4. **Variáveis:** Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no ambiente de build
5. **Edge Functions:** Já deployadas no Supabase. Para redeploy, usar as Supabase MCP tools ou o painel do Supabase
6. **Domínio customizado:** Configurar no painel do hosting

## Identidade da Marca

- **Nome:** MB (apenas "MB" — não "MB Moda", "MB Moda Brasil" ou "MB Style Hub")
- **Tagline:** "Moda que combina com você"
- **WhatsApp:** +55 73 9 9992-9009 (link: https://wa.me/5573999929009)
- **Instagram:** @mbmodabrasil (link: https://instagram.com/mbmodabrasil)
- **Endereço:** BR-367, km 77 — Coroa Vermelha, Santa Cruz Cabrália — BA, 45810-000
- **Horário loja:** Segunda a sábado: 08:30 às 18:30
- **Horário site:** Disponível 24 horas por dia, 7 dias por semana
- **Frete grátis:** Acima de R$ 480,00 para todo o Brasil
- **Pagamento:** PIX e cartão
