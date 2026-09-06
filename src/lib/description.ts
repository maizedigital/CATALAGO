export interface DescriptionSection {
  title: string;
  items: string[];
  paragraph: string | null;
}

export interface NormalizedDescription {
  description: string | null;
  details: string[];
  observations: string | null;
}

const SECTION_TITLES = ['descrição', 'descricao', 'detalhes', 'observações', 'observacoes', 'observacao', 'características', 'caracteristicas', 'composição', 'composicao', 'material'];

function cleanLine(line: string): string {
  return line
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*\.\s*/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function capitalizeFirst(text: string): string {
  const t = text.trim();
  if (!t) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function ensurePeriod(text: string): string {
  const t = text.trim();
  if (!t) return t;
  if (/[.!?]$/.test(t)) return t;
  return t + '.';
}

function isSectionTitle(line: string): boolean {
  const lower = line.toLowerCase().replace(/[:\-–*]/g, '').trim();
  return SECTION_TITLES.some((t) => lower === t || lower === t + ':');
}

function looksLikeListItem(line: string): boolean {
  const t = line.trim();
  return /^[•\-\*]\s+/.test(t) || /^\d+[.)]\s+/.test(t);
}

function stripBullet(line: string): string {
  return line.replace(/^[•\-\*]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
}

export function normalizeDescription(raw: string | null | undefined): NormalizedDescription {
  if (!raw || !raw.trim()) {
    return { description: null, details: [], observations: null };
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const descriptionParts: string[] = [];
  const details: string[] = [];
  const observationParts: string[] = [];

  let currentSection: 'description' | 'details' | 'observations' = 'description';

  for (const line of lines) {
    if (isSectionTitle(line)) {
      const lower = line.toLowerCase().replace(/[:\-–*]/g, '').trim();
      if (lower.startsWith('detalhe') || lower.startsWith('caracter') || lower.startsWith('compos') || lower.startsWith('material')) {
        currentSection = 'details';
      } else if (lower.startsWith('observ')) {
        currentSection = 'observations';
      } else {
        currentSection = 'description';
      }
      continue;
    }

    const cleaned = cleanLine(line);

    if (currentSection === 'details' || looksLikeListItem(line)) {
      if (looksLikeListItem(line)) {
        const item = cleanLine(stripBullet(line));
        if (item) details.push(item);
      } else if (currentSection === 'details') {
        const parts = cleaned.split(/[,;]\s+/).map((p) => p.trim()).filter(Boolean);
        for (const p of parts) details.push(p);
      } else {
        descriptionParts.push(cleaned);
      }
    } else if (currentSection === 'observations') {
      observationParts.push(cleaned);
    } else {
      descriptionParts.push(cleaned);
    }
  }

  if (descriptionParts.length === 0 && details.length === 0 && observationParts.length === 0) {
    const flat = cleanLine(raw.replace(/\s+/g, ' '));
    return { description: flat || null, details: [], observations: null };
  }

  if (descriptionParts.length === 0 && details.length > 0) {
    const firstDetail = details[0];
    if (firstDetail && firstDetail.split(/\s+/).length >= 4) {
      descriptionParts.push(firstDetail);
      details.shift();
    }
  }

  let description: string | null = null;
  if (descriptionParts.length > 0) {
    description = capitalizeFirst(ensurePeriod(descriptionParts.join(' ')));
  }

  let observations: string | null = null;
  if (observationParts.length > 0) {
    observations = capitalizeFirst(ensurePeriod(observationParts.join(' ')));
  }

  return { description, details, observations };
}

export function hasStructuredDescription(norm: NormalizedDescription): boolean {
  return norm.description !== null || norm.details.length > 0 || norm.observations !== null;
}
