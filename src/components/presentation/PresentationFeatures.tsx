import { Reveal } from './Reveal';
import {
  Store,
  Package,
  LayoutGrid,
  ShoppingCart,
  MessageCircle,
  ClipboardList,
  Palette,
  Image,
  Users,
  BarChart3,
  Smartphone,
  Link2,
} from 'lucide-react';

const features = [
  { icon: Store, title: 'Loja online', desc: 'Uma vitrine profissional.' },
  { icon: Package, title: 'Produtos', desc: 'Organize seus produtos.' },
  { icon: LayoutGrid, title: 'Categorias', desc: 'Facilite a navegação.' },
  { icon: ShoppingCart, title: 'Carrinho', desc: 'Seu cliente monta o pedido.' },
  { icon: MessageCircle, title: 'WhatsApp', desc: 'Continue a conversa e finalize a venda.' },
  { icon: ClipboardList, title: 'Pedidos', desc: 'Veja os pedidos organizadamente.' },
  { icon: Palette, title: 'Personalização', desc: 'Sua loja com a identidade da sua marca.' },
  { icon: Image, title: 'Banners', desc: 'Destaque coleções, campanhas e produtos.' },
  { icon: Users, title: 'Clientes', desc: 'Organize seus clientes.' },
  { icon: BarChart3, title: 'Métricas', desc: 'Entenda melhor sua loja.' },
  { icon: Smartphone, title: 'Responsivo', desc: 'Funciona perfeitamente no celular.' },
  { icon: Link2, title: 'Link da loja', desc: 'Um endereço para divulgar em qualquer lugar.' },
];

export function PresentationFeatures() {
  return (
    <section id="recursos" className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Tudo que você precisa para começar a vender online.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 4) * 60}>
              <div className="group h-full rounded-2xl border border-white/10 bg-[#0D0D0D] p-6 transition-colors hover:border-[#19E66B]/30">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#19E66B]/10 text-[#19E66B] transition-colors group-hover:bg-[#19E66B]/20">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
