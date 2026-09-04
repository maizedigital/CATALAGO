import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useSEO } from '@/hooks/useSEO';
import { formatPrice, effectivePrice } from '@/lib/format';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  useSEO({ title: 'Carrinho — MB', description: 'Revise os itens do seu carrinho na MB.' });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900">Seu carrinho está vazio</h1>
        <p className="mt-3 text-sm text-neutral-500">
          Explore o catálogo MB e adicione produtos ao carrinho.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
        Carrinho
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <Link to={`/produto/${item.slug}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-28 w-24 object-cover bg-neutral-100"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-3">
                    <Link
                      to={`/produto/${item.slug}`}
                      className="text-sm font-medium text-neutral-900 hover:text-neutral-600"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.id)}
                      aria-label="Remover"
                      className="text-neutral-400 hover:text-neutral-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Tamanho: {item.size} · Cor: {item.color}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="inline-flex items-center border border-neutral-200">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 text-neutral-700 hover:bg-neutral-50"
                        aria-label="Diminuir"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-neutral-700 hover:bg-neutral-50"
                        aria-label="Aumentar"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-neutral-900">
                      {formatPrice(effectivePrice(item.price, item.promo_price) * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex justify-between">
            <Link to="/" className="text-sm text-neutral-600 underline hover:text-neutral-900">
              ← Continuar comprando
            </Link>
            <button
              onClick={clearCart}
              className="text-sm text-neutral-500 underline hover:text-neutral-900"
            >
              Limpar carrinho
            </button>
          </div>
        </div>

        {/* Summary */}
        <aside className="h-fit border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Resumo
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span className="font-medium text-neutral-900">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Frete</span>
              <span className="text-neutral-500">R$ 25,00 (Bahia)</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4">
            <span className="font-bold text-neutral-900">Total</span>
            <span className="text-lg font-bold text-neutral-900">{formatPrice(total + 25)}</span>
          </div>
          <Link
            to="/finalizar"
            className="mt-6 flex w-full items-center justify-center gap-2 bg-neutral-900 py-4 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            Finalizar pedido <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
