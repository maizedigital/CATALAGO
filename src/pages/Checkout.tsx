import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useSEO } from '@/hooks/useSEO';
import { CheckoutForm } from '@/components/CheckoutForm';
import { formatPrice, effectivePrice } from '@/lib/format';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  useSEO({ title: 'Finalizar pedido — MB', description: 'Finalize seu pedido na MB.' });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-neutral-900">
          Não há itens para finalizar
        </h1>
        <p className="mt-3 text-sm text-neutral-500">
          Adicione produtos ao carrinho para continuar.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-neutral-900 px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
        >
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
      <h1 className="mb-8 font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
        Finalizar pedido
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Form */}
        <div>
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Dados de entrega
          </h2>
          <CheckoutForm items={items} total={total} onClear={clearCart} />
        </div>

        {/* Summary */}
        <aside className="h-fit border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-24">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-neutral-900">
            Seu pedido
          </h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-16 w-14 object-cover bg-neutral-100"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-neutral-900">{item.name}</p>
                  <p className="text-xs text-neutral-500">
                    {item.size} · {item.color} · Qtd: {item.quantity}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-neutral-900">
                    {formatPrice(effectivePrice(item.price, item.promo_price) * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-neutral-200 pt-4">
            <span className="font-bold text-neutral-900">Total</span>
            <span className="text-lg font-bold text-neutral-900">{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
