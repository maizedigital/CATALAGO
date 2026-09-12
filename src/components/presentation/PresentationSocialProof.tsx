import { Reveal } from './Reveal';

export function PresentationSocialProof() {
  return (
    <section className="bg-[#080808] py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 text-center md:px-6">
        <Reveal>
          <div className="mx-auto max-w-2xl">
            <p className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Seja uma das primeiras lojas a usar o ENVIEY.
            </p>
            <p className="mt-4 text-base text-neutral-400 md:text-lg">
              Estamos no início da jornada. Você pode ser parte dos primeiros negócios que crescem
              com a plataforma.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
