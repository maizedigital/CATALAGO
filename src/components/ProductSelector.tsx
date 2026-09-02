import { Check } from 'lucide-react';

interface ProductSelectorProps {
  sizes: string[];
  colors: string[];
  selectedSize: string | null;
  selectedColor: string | null;
  onSizeChange: (size: string) => void;
  onColorChange: (color: string) => void;
}

export function ProductSelector({
  sizes,
  colors,
  selectedSize,
  selectedColor,
  onSizeChange,
  onColorChange,
}: ProductSelectorProps) {
  return (
    <div className="space-y-6">
      {sizes.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Tamanho
            </h3>
            <span className="text-xs text-neutral-400">
              {selectedSize ? `Selecionado: ${selectedSize}` : 'Escolha um tamanho'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`min-w-11 border px-3 py-2 text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-900">
              Cor
            </h3>
            <span className="text-xs text-neutral-400">
              {selectedColor ? `Selecionado: ${selectedColor}` : 'Escolha uma cor'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onColorChange(color)}
                className={`inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
                }`}
              >
                {selectedColor === color && <Check size={14} />}
                {color}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
