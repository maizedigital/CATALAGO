import { useState } from 'react';

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-[3/4] bg-neutral-100" />;
  }

  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden bg-neutral-100">
        <img
          src={images[active]}
          alt={alt}
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`h-20 w-16 overflow-hidden border-2 transition-colors ${
                active === i ? 'border-neutral-900' : 'border-transparent hover:border-neutral-300'
              }`}
              aria-label={`Imagem ${i + 1}`}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
