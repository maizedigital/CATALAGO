import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus, MessageCircle, ShoppingBag, Check, ChevronRight, X } from 'lucide-react';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductSelector } from '@/components/ProductSelector';
import { ProductDescription } from '@/components/ProductDescription';
import { useProduct } from '@/hooks/useProducts';
import { useSEO } from '@/hooks/useSEO';
import { useTracking } from '@/hooks/useTracking';
import { formatPrice, discountPercent, effectivePrice } from '@/lib/format';
import { siteConfig, whatsappLink } from '@/config/site';
import type { Product } from '@/types';
import { catalogPath } from '@/hooks/useCatalogPath';

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const catalogId = '37c86a47-b2c1-4563-8e30-a5fff68ef918';
  const storeName = siteConfig.name;
  const storeWa = siteConfig.whatsapp;
  const { product, loading } = useProduct(slug, catalogId);
  const { addItem } = useCart();
  const { trackEvent } = useTracking();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [unitSizes, setUnitSizes] = useState<string[]>([]);

  useSEO({
    title: product ? `${product.name} — ${storeName}` : storeName,
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
    trackEvent('product_view', { slug: product.slug, category: product.category, gender: product.gender }, product.name);
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-neutral-900">Produto não encontrado</h1>
        <Link to={catalogPath('/')} className="mt-4 inline-block text-sm text-neutral-600 underline">
          Voltar para a home
        </Link>
      </div>
    );
  }

  const hasDiscount = product.promo_price !== null && product.promo_price < product.price;
  const final = effectivePrice(product.price, product.promo_price);
  const needsSizes = quantity > 1 && product.sizes.length > 0;

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

    if (needsSizes) {
      setUnitSizes(Array(quantity).fill(selectedSize ?? ''));
      setShowSizeModal(true);
      return;
    }

    completeAddToCart(product, selectedSize ?? 'Único', selectedColor ?? 'Único', quantity, undefined);
  };

  const completeAddToCart = (
    prod: Product,
    size: string,
    color: string,
    qty: number,
    sizes?: string[]
  ) => {
    addItem(prod, size, color, qty, sizes);
    trackEvent('add_to_cart', { slug: prod.slug, size, color, quantity: qty }, prod.name);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleSizeModalConfirm = () => {
    if (unitSizes.some((s) => !s)) {
      return;
    }
    completeAddToCart(product, selectedSize ?? 'Único', selectedColor ?? 'Único', quantity, unitSizes);
    setShowSizeModal(false);
  };

  const whatsappMessage = `Olá, ${storeName}! Tenho interesse no produto ${product.name}, tamanho ${selectedSize ?? '-'}, cor ${selectedColor ?? '-'}, quantidade ${quantity}. Preço: ${formatPrice(final)}.`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <nav className="mb-6 flex items-center gap-1 text-xs text-neutral-400">
        <Link to={catalogPath('/')} className="hover:text-neutral-900">Home</Link>
        <ChevronRight size={12} />
        <Link to={catalogPath(`/${product.gender}`)} className="capitalize hover:text-neutral-900">
          {product.gender}
        </Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} alt={product.name} />

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-400">
            {product.category} · {product.gender}
          </p>
          <h1 className="main-product-name mt-2 font-serif text-2xl font-bold text-neutral-900 md:text-3xl">
            {product.name}
            <img
              src="https://download.host2b.net/imagem/selo-veri.svg"
              alt=""
              className="ml-1 inline-block h-5 w-5 align-top"
            />
          </h1>

          <div className="main-product-prices mt-4 flex items-baseline gap-3">
            {hasDiscount && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <span className="text-2xl font-bold text-black" style={{ color: '#000' }}>{formatPrice(final)}</span>
            {hasDiscount && (
              <span className="bg-neutral-900 px-2 py-0.5 text-xs font-bold text-white">
                -{discountPercent(product.price, product.promo_price!)}%
              </span>
            )}
          </div>
          <p className="installment-text mt-1 text-xs text-neutral-500">
            ou em até 3x sem juros no cartão
          </p>

          <div className="mt-6">
            <ProductDescription raw={product.description} />
          </div>

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
              href={storeWa ? whatsappLink(storeWa, whatsappMessage) : '#'}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent('whatsapp_click', { source: 'product_page', product: product.slug }, product.name)}
              className="inline-flex items-center justify-center gap-2 border border-green-500 py-4 text-xs font-bold uppercase tracking-widest text-green-600 transition-colors hover:bg-green-50"
            >
              <MessageCircle size={18} /> Comprar pelo WhatsApp
            </a>
          </div>

          <div className="mt-10 space-y-4 border-t border-neutral-200 pt-6">
            <InfoRow label="Entrega" value="Envio para todo Brasil. Prazo conforme região." />
          </div>
        </div>
      </div>

      {showSizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSizeModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-neutral-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-neutral-900">Tamanho por unidade</h2>
              <button onClick={() => setShowSizeModal(false)} className="text-neutral-400 hover:text-neutral-900">
                <X size={20} />
              </button>
            </div>
            <p className="mb-4 text-sm text-neutral-500">
              Selecione o tamanho de cada unidade ({quantity} no total).
            </p>
            <div className="max-h-72 space-y-3 overflow-y-auto">
              {Array.from({ length: quantity }).map((_, i) => (
                <div key={i}>
                  <label className="mb-1.5 block text-xs font-semibold text-neutral-600">
                    Unidade {i + 1}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setUnitSizes((prev) => prev.map((s, idx) => idx === i ? size : s))}
                        className={`min-w-11 border px-3 py-2 text-sm font-medium transition-colors ${
                          unitSizes[i] === size
                            ? 'border-neutral-900 bg-neutral-900 text-white'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-900'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSizeModalConfirm}
                disabled={unitSizes.some((s) => !s)}
                className="flex-1 bg-neutral-900 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                Confirmar
              </button>
              <button
                onClick={() => setShowSizeModal(false)}
                className="rounded-lg border border-neutral-200 px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-700 transition-colors hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
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
