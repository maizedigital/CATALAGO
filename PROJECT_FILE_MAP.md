# PROJECT_FILE_MAP.md — MB

## Inventario de Arquivos

### Raiz do projeto

| Arquivo | Função |
|---|---|
| `package.json` | Dependências e scripts npm |
| `package-lock.json` | Lock de dependências |
| `vite.config.ts` | Configuração Vite (alias `@/` → `src/`, exclusão de lucide-react do optimizeDeps) |
| `tsconfig.json` | Config raiz TypeScript (referencia app + node) |
| `tsconfig.app.json` | Config TypeScript do app (strict, path alias `@/*`) |
| `tsconfig.node.json` | Config TypeScript do Node/Vite |
| `tailwind.config.js` | Config Tailwind (paleta primary/accent/success/warning/error, animações customizadas) |
| `postcss.config.js` | Config PostCSS (Tailwind + autoprefixer) |
| `eslint.config.js` | Config ESLint |
| `index.html` | HTML raiz (meta tags, fontes, título) |
| `.env` | Variáveis de ambiente (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) — gitignored |
| `.gitignore` | Arquivos ignorados pelo Git |
| `README.md` | README do projeto |
| `ENVIRONMENT.md` | Documentação de variáveis de ambiente |
| `PROJECT_CONTEXT.md` | Contexto técnico do projeto |
| `PROJECT_FILE_MAP.md` | Este arquivo |

### `public/`

| Arquivo | Função |
|---|---|
| `public/favicon.svg` | Favicon |
| `public/_redirects` | Redirect SPA para hosting (Netlify) |
| `public/assets/IMG_3937.jpg` | Logo/imagen da marca MB (usada no componente Logo) |

### `src/`

| Arquivo | Função |
|---|---|
| `src/main.tsx` | Entry point React (StrictMode + render) |
| `src/App.tsx` | Rotas + providers (ErrorBoundary, BrowserRouter, AdminAuth, Cart, Tracking) |
| `src/index.css` | Tailwind base + estilos globais (fontes, scrollbar, reveal, glass, gradient-text) |
| `src/vite-env.d.ts` | Tipos de ambiente Vite |

### `src/config/`

| Arquivo | Função |
|---|---|
| `src/config/site.ts` | Configuração centralizada da marca MB (nome, WhatsApp, Instagram, endereço, horários, frete grátis, whatsappLink helper) |

### `src/types/`

| Arquivo | Função |
|---|---|
| `src/types/index.ts` | Tipos compartilhados: Product, CartItem, Gender, SortOption |

### `src/lib/`

| Arquivo | Função |
|---|---|
| `src/lib/supabase.ts` | Client Supabase (createClient com URL + anon key do env) |
| `src/lib/adminApi.ts` | Cliente HTTP para Edge Functions (adminApi get/post/put/delete, uploadProductImage, adminLogin) |
| `src/lib/format.ts` | Helpers de formatação (formatPrice BRL, discountPercent, effectivePrice) |

### `src/hooks/`

| Arquivo | Função |
|---|---|
| `src/hooks/useCart.tsx` | Context do carrinho (items, add, remove, update, clear, total, count, drawer open/close) — persistido em localStorage |
| `src/hooks/useTracking.tsx` | Context de tracking (trackEvent → customer_events, visitor ID, WhatsApp ID) — registra visitantes e page_views |
| `src/hooks/useAdminAuth.tsx` | Context de auth admin (isAuthenticated, username, login via adminLogin, logout) — token em localStorage |
| `src/hooks/useProducts.ts` | Hooks de busca de produtos (useProducts, useProduct by slug, useSearch) |
| `src/hooks/useSEO.ts` | Hook para atualizar title e meta tags dinamicamente |
| `src/hooks/useReveal.ts` | Hook IntersectionObserver para animações de scroll reveal |

### `src/components/`

| Arquivo | Função |
|---|---|
| `src/components/Header.tsx` | Cabeçalho sticky com marquee de avisos, navegação, busca, carrinho, menu mobile |
| `src/components/Footer.tsx` | Rodapé com CTA WhatsApp, links, contatos, endereço, horários, formas de pagamento |
| `src/components/Hero.tsx` | Banner principal da homepage com parallax e CTAs |
| `src/components/Logo.tsx` | Logo MB (imagem circular com link para home) |
| `src/components/CartDrawer.tsx` | Drawer lateral do carrinho com barra de progresso de frete grátis (R$ 480) |
| `src/components/WhatsAppButton.tsx` | Botão flutuante de WhatsApp com pulse animation e tooltip |
| `src/components/LeadCaptureModal.tsx` | Modal de captura de leads (nome + WhatsApp com máscara e validação, detecta origem) |
| `src/components/ProductCard.tsx` | Card de produto com hover effects (segunda imagem, quick add, wishlist) |
| `src/components/ProductFilter.tsx` | Painel de filtros (categoria, tamanho, cor, preço, ordenação) — desktop sticky + mobile drawer |
| `src/components/ProductGallery.tsx` | Galeria de imagens com thumbnail selector |
| `src/components/ProductGrid.tsx` | Grid responsivo de ProductCards (2/3/4 colunas) |
| `src/components/ProductSelector.tsx` | Seletor de tamanho e cor para página de produto |
| `src/components/CategoryBanner.tsx` | Banner de categoria com reveal animation e hover effects |
| `src/components/PromoBanner.tsx` | Banner promocional "Ficou com dúvida?" com CTA WhatsApp |
| `src/components/CheckoutForm.tsx` | Formulário de checkout (nome, WhatsApp, CPF, endereço) → envia pedido via WhatsApp + salva customer no CRM |
| `src/components/SearchBar.tsx` | Barra de busca reutilizável |
| `src/components/AdminLayout.tsx` | Layout do admin (sidebar fixa desktop + drawer mobile, nav items, logout) |
| `src/components/ProtectedRoute.tsx` | Guard de rota — redireciona para /admin/login se não autenticado |
| `src/components/ErrorBoundary.tsx` | Captura erros de renderização com tela de fallback |

### `src/pages/`

| Arquivo | Função |
|---|---|
| `src/pages/Home.tsx` | Homepage: hero, banners de categoria, seções de novidades/destaques/ofertas, promo banner, trust badges, marquee |
| `src/pages/Catalog.tsx` | Catálogo por gênero (feminino/masculino) com filtros, ordenação, grid de produtos |
| `src/pages/ProductPage.tsx` | Página de produto: galeria, info, seletor, add to cart, produtos relacionados, tracking |
| `src/pages/Cart.tsx` | Página do carrinho: lista de itens, totais, CTA para checkout |
| `src/pages/Checkout.tsx` | Página de checkout com CheckoutForm |
| `src/pages/Search.tsx` | Resultados de busca com query param |
| `src/pages/About.tsx` | Página institucional sobre a MB (história, valores, políticas, contato) |
| `src/pages/Contact.tsx` | Página de contato (WhatsApp, Instagram, endereço, horários loja e site) |
| `src/pages/NotFound.tsx` | Página 404 |

### `src/pages/admin/`

| Arquivo | Função |
|---|---|
| `src/pages/admin/AdminLogin.tsx` | Tela de login do admin (username + senha) |
| `src/pages/admin/AdminDashboard.tsx` | Dashboard com estatísticas (vendas, pedidos, clientes, produtos, visitantes, leads, cliques WhatsApp) |
| `src/pages/admin/AdminProducts.tsx` | Lista de produtos com busca, toggle ativo, editar, excluir |
| `src/pages/admin/AdminProductForm.tsx` | Formulário criar/editar produto (nome, SKU, preço, promo, imagens upload, tamanhos, cores, flags, campos administrativos) |
| `src/pages/admin/AdminOrders.tsx` | Lista de pedidos com status e filtros |
| `src/pages/admin/AdminOrderDetail.tsx` | Detalhe de pedido com itens e status |
| `src/pages/admin/AdminCRM.tsx` | Visão geral do CRM (clientes, leads, receita, ticket médio, recorrentes) |
| `src/pages/admin/AdminLeads.tsx` | Gestão de leads com filtros, origem destacada, editar status, excluir |
| `src/pages/admin/AdminCustomers.tsx` | Lista de clientes com busca e filtros |
| `src/pages/admin/AdminCustomerDetail.tsx` | Detalhe de cliente (dados, pedidos, eventos, timeline) |
| `src/pages/admin/AdminAnalytics.tsx` | Analytics com gráficos (visitantes, leads, pedidos por dia, rankings de produtos) |
| `src/pages/admin/AdminSettings.tsx` | Configurações da loja (nome, tagline, WhatsApp, Instagram, endereço, horários) |

### `supabase/`

| Arquivo | Função |
|---|---|
| `supabase/config.toml` | Config das Edge Functions (verify_jwt = false para ambas) |

### `supabase/migrations/`

| Arquivo | Função |
|---|---|
| `20260825224915_mb_catalog_schema.sql` | Schema inicial: products, categories, product_variants, customers, orders, order_items, settings + RLS + índices + seed 20 produtos |
| `20260825230242_mb_admin_crm_schema.sql` | admin_users (seed admin/1234), leads, customer_events, visitors + extensões customers/orders + RLS + índices |
| `20260825230303_mb_verify_password_function.sql` | Função verify_password (SECURITY DEFINER, bcrypt) |
| `20260825230329_mb_hash_password_function.sql` | Função hash_password (SECURITY DEFINER, bcrypt) |
| `20260826142855_mb_admin_products_extensions.sql.sql` | Colunas subcategory, stock_minimum, active em products + tabela inventory_adjustments + RLS |
| `20260826144433_mb_fix_verify_password_search_path.sql.sql` | Corrige search_path das funções para extensions, public |
| `20260827025145_mb_crm_customer_extensions.sql` | Colunas address, number, complement, updated_at em customers |
| `20260829181556_mb_product_images_bucket.sql` | Bucket público product-images + policies de storage |

### `supabase/functions/`

| Arquivo | Função |
|---|---|
| `supabase/functions/admin-login/index.ts` | Edge Function de login (POST username+password → token) |
| `supabase/functions/admin-api/index.ts` | Edge Function API CRUD (dashboard, products, orders, customers, leads, events, visitors, crm-dashboard, rankings, analytics, settings, upload, change-password) |

### `dist/` (gerado pelo build — não comitar)

| Arquivo | Função |
|---|---|
| `dist/index.html` | HTML de produção |
| `dist/assets/index-*.js` | Bundle JS de produção |
| `dist/assets/index-*.css` | Bundle CSS de produção |
| `dist/assets/IMG_3937.jpg` | Logo copiada do public |
| `dist/_redirects` | Redirect SPA copiado do public |
| `dist/favicon.svg` | Favicon copiado do public |
