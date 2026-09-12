import { Reveal } from './Reveal';
import { Link } from 'react-router-dom';

const fashionCategories = [
  'Feminino',
  'Masculino',
  'Infantil',
  'Calçados',
  'Bolsas',
  'Acessórios',
  'Moda Praia',
  'Moda Fitness',
  'Lingerie',
];

export function PresentationFashion() {
  return (
    <section id="moda" className="bg-[#050505] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Feito para quem vende <span className="text-[#19E66B]">moda</span>.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-neutral-400 md:text-lg">
            Roupas são visuais. Seu cliente precisa conseguir ver, escolher e comparar seus
            produtos de forma rápida.
          </p>
        </Reveal>

        {/* Category chips */}
        <Reveal className="mt-12" delay={100}>
          <div className="flex flex-wrap justify-center gap-3">
            {fashionCategories.map((cat) => (
              <span
                key={cat}
                className="rounded-full border border-white/10 bg-[#0D0D0D] px-5 py-2.5 text-sm font-semibold text-neutral-300 transition-colors hover:border-[#19E66B]/40 hover:text-white"
              >
                {cat}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14 text-center" delay={200}>
          <p className="text-2xl font-bold text-white md:text-3xl">
            Sua coleção online 24 horas por dia.
          </p>
          <Link
            to="/admin/login"
            className="mt-8 inline-flex items-center justify-center rounded-xl border border-[#19E66B]/30 bg-[#19E66B]/10 px-7 py-4 text-base font-bold text-[#19E66B] transition-all hover:bg-[#19E66B]/20"
          >
            Criar minha loja de moda
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

const secondaryNiches = [
  {
    title: 'Beleza',
    copy: 'Cosméticos, maquiagem, perfumes, skincare, cabelos e muito mais.',
  },
  {
    title: 'Alimentação',
    copy: 'Doces, bolos, marmitas, lanches, encomendas e produtos artesanais.',
  },
];

export function PresentationNiches() {
  return (
    <section id="nichos" className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
            Venda o que você quiser.
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {secondaryNiches.map((n, i) => (
            <Reveal key={n.title} delay={i * 100}>
              <div className="rounded-2xl border border-white/10 bg-[#0D0D0D] p-8 text-center">
                <h3 className="text-2xl font-bold text-[#19E66B]">{n.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-neutral-400">{n.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mx-auto mt-10 max-w-2xl space-y-2 text-center" delay={200}>
          <p className="text-lg text-neutral-300">
            Moda é nosso foco. Mas o ENVIEY não foi feito para um único tipo de negócio.
          </p>
          <p className="text-lg font-semibold text-white">Se você vende produtos, pode criar sua loja.</p>
        </Reveal>
      </div>
    </section>
  );
}
