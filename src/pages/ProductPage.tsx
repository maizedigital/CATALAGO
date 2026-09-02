import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, MessageCircle, ShoppingBag, Check, ChevronRight } from 'lucide-react';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductSelector } from '@/components/ProductSelector';
import { useProduct } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { useSEO } from '@/hooks/useSEO';
import { useTracking } from '@/hooks/useTracking';
import { formatPrice, discountPercent, effectivePrice } from '@/lib/format';
import { siteConfig, whatsappLink } from '@/config/site';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading } = useProduct(slug);
  const { addItem } = useCart();
  const { trackEvent } = useTracking();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSEO({
    title: product ? `${product.name} — MB` : 'MB',
    description: product?.description ?? undefined,
    image: product?.images[0],
  });

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse bg-neutral-100" />
            <div className="h-6 w-1/3 animate-pulse bg-neutral-100" />
            <div className="h-24 w-full animate-pulse bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (product) {
    // Track product view
    trackEvent('product_view', { slug: product.slug, category: product.category, gender: product.gender }, product.name);
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Produto não encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-sm text-neutral-600 underline">
          Voltar para a home
        </Link>
      </div>
    );
  }

  const hasDiscount = product.promo_price !== null && product.promo_price < product.price;
  const final = effectivePrice(product.price, product.promo_price);

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setError('Selecione um tamanho');
      return;
    }
    if (product.colors.length > 0 && !selectedColor) {
      setError('Selecione uma cor');
      return;
    }
    setError(null);
    addItem(product, selectedSize ?? 'Único', selectedColor ?? 'Único', quantity);
    trackEvent('add_to_cart', { slug: product.slug, size: selectedSize, color: selectedColor, quantity }, product.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const finalPrice = effectivePrice(product.price, product.promo_price);
  const whatsappMessage = `Olá, MB! Tenho interesse no produto ${product.name}, tamanho ${selectedSize ?? '-'}, cor ${selectedColor ?? '-'}, quantidade ${quantity}. Preço: ${formatPrice(finalPrice)}.`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1 text-xs text-neutral-400">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight size={12} />
        <Link to={`/${product.gender}`} className="capitalize hover:text-neutral-900">
          {product.gender}
        </Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery */}
        <ProductGallery images={product.images} alt={product.name} />

        {/* Info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            {product.category} · {product.gender}
          </p>
          <h1 className="mt-2 font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-2xl font-bold text-neutral-900">{formatPrice(final)}</span>
            {hasDiscount && (
              <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
                -{discountPercent(product.price, product.promo_price!)}%
              </span>
            )}
          </div>

          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
            <Check size={14} /> Disponível
          </p>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}

          {/* Selectors */}
          <div className="mt-8">
            <ProductSelector
              sizes={product.sizes}
              colors={product.colors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onSizeChange={setSelectedSize}
              onColorChange={setSelectedColor}
            />
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
              Quantidade
            </h3>
            <div className="inline-flex items-center border border-neutral-200">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-2.5 text-neutral-700 hover:bg-neutral-50"
                aria-label="Diminuir"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-sm font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="p-2.5 text-neutral-700 hover:bg-neutral-50"
                aria-label="Aumentar"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {error && <p className="mt-4 text-xs font-medium text-red-500">{error}</p>}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={handleAddToCart}
              className="inline-flex items-center justify-center gap-2 bg-neutral-900 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              {added ? (
                <>
                  <Check size={18} /> Adicionado!
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Adicionar ao carrinho
                </>
              )}
            </button>
            <a
              href={whatsappLink(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'product_page', product: product.slug }, product.name)}
              className="inline-flex items-center justify-center gap-2 border border-green-500 py-4 text-xs font-bold uppercase tracking-widest text-green-600 transition-colors hover:bg-green-50"
            >
              <MessageCircle size={18} /> Comprar pelo WhatsApp
            </a>
          </div>

          {/* Info sections */}
          <div className="mt-10 space-y-4 border-t border-neutral-200 pt-6">
            <InfoRow label="Descrição" value={product.description ?? '—'} />
            <InfoRow label="Disponibilidade" value="Pronta entrega" />
            <InfoRow label="Tamanhos" value={product.sizes.join(', ') || 'Único'} />
            <InfoRow label="Entrega" value="Envio para todo Brasil. Prazo conforme região." />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-neutral-100 pb-3 sm:flex-row sm:gap-4">
      <dt className="w-32 shrink-0 text-xs font-bold uppercase tracking-wider text-neutral-900">
        {label}
      </dt>
      <dd className="text-sm text-neutral-600">{value}</dd>
    </div>
  );
}
