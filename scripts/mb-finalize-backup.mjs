#!/usr/bin/env node
// Extract produtos.json from persisted SQL result, download images, create ZIP
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const PERSISTED = '/tmp/cc-agent/70322261/.v3/persisted-tool-results/v3-session/call_61b158238cd44221a90d9d9f.txt';
const BACKUP_DIR = join(process.cwd(), 'MB-MODA-BRASIL-BACKUP');
const ZIP_PATH = join(process.cwd(), 'MB-MODA-BRASIL-BACKUP.zip');

function log(msg) { console.log(`[backup] ${msg}`); }

try {
  log('Lendo dados de produtos...');
  const raw = readFileSync(PERSISTED, 'utf8');
  
  // The file is a JSON string containing untrusted-data tags
  let cleaned = raw;
  try { cleaned = JSON.parse(raw); if (typeof cleaned === 'string') cleaned = cleaned; } catch {}
  
  // Remove untrusted-data wrapper tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');
  
  // Find the JSON array — look for [{"produtos":
  const startIdx = cleaned.indexOf('[{');
  const endIdx = cleaned.lastIndexOf('}]');
  if (startIdx === -1 || endIdx === -1) throw new Error('JSON array not found');
  
  const jsonStr = cleaned.substring(startIdx, endIdx + 2);
  const parsed = JSON.parse(jsonStr);
  const products = parsed[0]?.produtos || [];
  
  log(`Produtos extraidos: ${products.length}`);
  writeFileSync(join(BACKUP_DIR, 'produtos.json'), JSON.stringify(products, null, 2));
  
  // Download product images
  let imgCount = 0;
  for (const p of products) {
    if (!p.images) continue;
    for (let i = 0; i < p.images.length; i++) {
      const url = p.images[i];
      if (!url?.startsWith('http')) continue;
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg';
      const filename = `${p.slug}-${i}.${ext}`;
      try {
        execSync(`curl -sL -o "${join(BACKUP_DIR, 'imagens', 'produtos', filename)}" "${url}"`, { timeout: 30000, stdio: 'pipe' });
        imgCount++;
      } catch {}
    }
  }
  log(`Imagens de produtos baixadas: ${imgCount}`);
  
  // Download banner images
  const banners = JSON.parse(readFileSync(join(BACKUP_DIR, 'banners.json'), 'utf8'));
  let bCount = 0;
  for (const b of banners) {
    const url = b.image_url;
    if (!url?.startsWith('http')) continue;
    const ext = url.split('.').pop()?.split('?')[0] || 'png';
    try {
      execSync(`curl -sL -o "${join(BACKUP_DIR, 'imagens', 'banners', `banner-${b.sort_order||0}.${ext}`)}" "${url}"`, { timeout: 30000, stdio: 'pipe' });
      bCount++;
    } catch {}
  }
  log(`Imagens de banners baixadas: ${bCount}`);
  
  // Create ZIP
  execSync(`cd "${BACKUP_DIR}" && zip -r "${ZIP_PATH}" . -x "*.DS_Store"`, { stdio: 'pipe' });
  const size = Number(execSync(`stat -c%s "${ZIP_PATH}"`).toString().trim());
  log(`ZIP criado: ${(size / 1024).toFixed(1)} KB`);
  
  // Verify
  const listing = execSync(`unzip -l "${ZIP_PATH}"`).toString();
  const files = listing.split('\n').filter(l => l.trim() && !l.startsWith('Archive') && !l.startsWith('  Length') && !l.startsWith('---')).length - 1;
  log(`Arquivos no ZIP: ${files}`);
  log('Backup concluido com sucesso!');
} catch (e) {
  console.error('Erro:', e.message);
  process.exit(1);
}
