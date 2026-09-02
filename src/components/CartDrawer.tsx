import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatPrice, effectivePrice } from '@/lib/format';

const FREE_SHIPPING_THRESHOLD = 480;

export function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, total } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={closeCart}
      />
      {/* Panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-400 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-primary-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-primary-900" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-900">
              Carrinho ({items.length})
            </h2>
          </div>
          <button onClick={closeCart} aria-label="Fechar carrinho" className="text-primary-500 transition-colors hover:text-primary-900">
            <X size={22} />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="border-b border-primary-100 bg-primary-50 px-5 py-3">
            <div className="mb-2 flex items-center gap-2 text-xs text-primary-700">
              <Truck size={15} className={remaining === 0 ? 'text-success-600' : ''} />
              {remaining > 0 ? (
                <span>Faltam <strong className="font-bold">{formatPrice(remaining)}</strong> para frete grátis</span>
              ) : (
                <span className="font-medium text-success-600">Voc&ecirc; ganhou frete grátis!</span>
              )}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-primary-200">
              <div
                className="h-full rounded-full bg-success-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
              <ShoppingBag size={28} className="text-primary-400" />
            </div>
            <p className="text-sm text-primary-400">Seu carrinho est&aacute; vazio.</p>
            <Link
              to="/"
              onClick={closeCart}
              className="border border-primary-900 px-6 py-3 text-xs font-bold uppercase tracking-widest text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
            >
              Continuar comprando
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 animate-fade-in">
                    <Link to={`/produto/${item.slug}`} onClick={closeCart} className="shrink-0">
                      <img src={item.image} alt={item.name} className="h-24 w-20 object-cover bg-primary-100" />
                    </Link>
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <Link to={`/produto/${item.slug}`} onClick={closeCart} className="text-sm font-medium text-primary-900">
                          {item.name}
                        </Link>
                        <button onClick={() => removeItem(item.id)} aria-label="Remover item" className="text-primary-400 transition-colors hover:text-error-600">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-primary-500">{item.size} · {item.color}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-primary-200">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 text-primary-700 transition-colors hover:bg-primary-50" aria-label="Diminuir">
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 text-primary-700 transition-colors hover:bg-primary-50" aria-label="Aumentar">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-primary-900">
                          {formatPrice(effectivePrice(item.price, item.promo_price) * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-primary-200 px-5 py-4">
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-primary-500">Subtotal</span>
                <span className="font-semibold text-primary-900">{formatPrice(total)}</span>
              </div>
              <Link to="/carrinho" onClick={closeCart} className="mb-2 block border border-primary-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-primary-900 transition-colors hover:bg-primary-50">
                Ver carrinho
              </Link>
              <Link to="/finalizar" onClick={closeCart} className="block bg-primary-950 py-3 text-center text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-primary-800">
                Finalizar pedido
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
