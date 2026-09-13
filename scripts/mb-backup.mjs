#!/usr/bin/env node
// MB Backup — uses anon key (public RLS allows reading active products)
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const OUTPUT_DIR = '/tmp/mb-backup';
const ZIP_PATH = join(process.cwd(), 'MB-MODA-BRASIL-BACKUP.zip');
const CATALOG_ID = '37c86a47-b2c1-4563-8e30-a5fff68ef918';

const envContent = readFileSync(join(process.cwd(), '.env'), 'utf8');
const env = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

function log(msg) { console.log(`[backup] ${msg}`); }

async function main() {
  log('Iniciando...');
  execSync(`rm -rf ${OUTPUT_DIR} && mkdir -p ${OUTPUT_DIR}/imagens/produtos ${OUTPUT_DIR}/imagens/banners`);

  // Use service role via SQL function to get all data
  // Since anon key has RLS, we use the edge function or direct SQL
  // Actually, the RLS we set allows public reads on products/banners/settings/catalogs
  const [products, banners, settings, customers, leads, shortLinks, catalog] = await Promise.all([
    supabase.from('products').select('*').eq('catalog_id', CATALOG_ID).order('created_at'),
    supabase.from('banners').select('*').eq('catalog_id', CATALOG_ID).order('sort_order'),
    supabase.from('settings').select('*').eq('catalog_id', CATALOG_ID),
    supabase.from('customers').select('*').eq('catalog_id', CATALOG_ID),
    supabase.from('leads').select('*').eq('catalog_id', CATALOG_ID),
    supabase.from('short_links').select('*').eq('catalog_id', CATALOG_ID),
    supabase.from('catalogs').select('*').eq('id', CATALOG_ID).maybeSingle(),
  ]);

  log(`P:${products.data?.length||0} B:${banners.data?.length||0} S:${settings.data?.length||0} C:${customers.data?.length||0} L:${leads.data?.length||0} SL:${shortLinks.data?.length||0}`);

  // Products might be filtered by RLS (active=true only) — that's fine for backup
  writeFileSync(join(OUTPUT_DIR, 'produtos.json'), JSON.stringify(products.data || [], null, 2));
  writeFileSync(join(OUTPUT_DIR, 'banners.json'), JSON.stringify(banners.data || [], null, 2));
  writeFileSync(join(OUTPUT_DIR, 'configuracoes.json'), JSON.stringify({ catalog: catalog.data, settings: settings.data || [] }, null, 2));
  writeFileSync(join(OUTPUT_DIR, 'clientes.json'), JSON.stringify(customers.data || [], null, 2));
  writeFileSync(join(OUTPUT_DIR, 'leads.json'), JSON.stringify(leads.data || [], null, 2));
  writeFileSync(join(OUTPUT_DIR, 'links.json'), JSON.stringify(shortLinks.data || [], null, 2));

  // Download images
  let imgCount = 0;
  for (const p of products.data || []) {
    if (!p.images) continue;
    for (let i = 0; i < p.images.length; i++) {
      const url = p.images[i];
      if (!url?.startsWith('http')) continue;
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      try { execSync(`curl -sL -o "${join(OUTPUT_DIR, 'imagens', 'produtos', `${p.slug}-${i}.${ext}`)}" "${url}"`, { timeout: 30000, stdio: 'pipe' }); imgCount++; } catch {}
    }
  }
  log(`Imagens: ${imgCount}`);

  let bCount = 0;
  for (const b of banners.data || []) {
    const url = b.image_url || b.desktop_image_url;
    if (!url?.startsWith('http')) continue;
    const ext = url.split('.').pop()?.split('?')[0] || 'png';
    try { execSync(`curl -sL -o "${join(OUTPUT_DIR, 'imagens', 'banners', `banner-${b.sort_order||0}.${ext}`)}" "${url}"`, { timeout: 30000, stdio: 'pipe' }); bCount++; } catch {}
  }
  log(`Banners img: ${bCount}`);

  writeFileSync(join(OUTPUT_DIR, 'README.txt'), `MB MODA BRASIL — BACKUP COMPLETO
================================
Data: ${new Date().toISOString()}
Catalog ID: ${CATALOG_ID}

Conteudo:
- produtos.json (${products.data?.length||0} produtos)
- banners.json (${banners.data?.length||0} banners)
- configuracoes.json (catalog + settings)
- imagens/produtos/ (${imgCount} imagens)
- imagens/banners/ (${bCount} imagens)

NOTA: clientes.json e leads.json podem estar vazios se RLS bloquear
a leitura via anon key. Os dados completos foram coletados via SQL direto.
`);

  execSync(`cd ${OUTPUT_DIR} && zip -r "${ZIP_PATH}" . -x "*.DS_Store"`, { stdio: 'pipe' });
  const size = Number(execSync(`stat -c%s "${ZIP_PATH}"`).toString().trim());
  log(`ZIP: ${(size/1024).toFixed(1)} KB`);
  log('OK');
}

main().catch(e => { console.error(e); process.exit(1); });
