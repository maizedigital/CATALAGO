MB MODA BRASIL — BACKUP COMPLETO
================================
Data: 2026-09-13
Catalog ID: 37c86a47-b2c1-4563-8e30-a5fff68ef918
Slug: mbmodabrasil

ESTRUTURA
---------
catalogo.json       — dados do catalogo (name, slug, domain, settings)
configuracoes.json  — settings do catalogo (whatsapp, email, instagram, horarios)
banners.json        — 2 banners
produtos.json       — 25 produtos (gerado via SQL, ver arquivo no projeto)
clientes.json       — 2 clientes
leads.json          — 3 leads
links.json          — 1 link curto
imagens/produtos/   — imagens baixadas dos produtos
imagens/banners/    — imagens baixadas dos banners

RESTAURACAO
-----------
1. Criar um catalog no Supabase com os mesmos settings
2. Importar produtos.json (gerar novos IDs, manter slugs)
3. Importar banners.json
4. Importar configuracoes.json (settings)
5. Re-upload das imagens para o bucket product-images
6. Atualizar URLs das imagens nos produtos/banners

NOTA: As URLs das imagens apontam para o bucket Supabase.
As imagens em imagens/ servem como copia local de seguranca.

DADOS COMPLETOS: Os 25 produtos completos foram exportados via SQL
e estao disponiveis no resultado da query json_agg. O arquivo
produtos.json deve ser gerado a partir dessa exportacao.
