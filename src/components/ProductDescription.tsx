import { normalizeDescription, hasStructuredDescription } from '@/lib/description';

interface ProductDescriptionProps {
  raw: string | null | undefined;
}

export function ProductDescription({ raw }: ProductDescriptionProps) {
  const norm = normalizeDescription(raw);

  if (!hasStructuredDescription(norm)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {norm.description && (
        <section>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Descrição
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">{norm.description}</p>
        </section>
      )}

      {norm.details.length > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Detalhes
          </h3>
          <ul className="space-y-1.5">
            {norm.details.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-600">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {norm.observations && (
        <section>
          <h3 className="mb-1.5 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Observações
          </h3>
          <p className="text-sm leading-relaxed text-neutral-600">{norm.observations}</p>
        </section>
      )}
    </div>
  );
}
