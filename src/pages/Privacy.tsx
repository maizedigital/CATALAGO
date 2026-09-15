import { useSEO } from '@/hooks/useSEO';
import { siteConfig } from '@/config/site';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { catalogPath } from '@/hooks/useCatalogPath';

export default function Privacy() {
  useSEO({
    title: `Política de Privacidade — ${siteConfig.name}`,
    description: 'Política de Privacidade e Proteção de Dados Pessoais da MB Moda Brasil conforme a LGPD.',
    canonical: 'https://mbmodabrasil.com.br/privacidade',
  });

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900">
            <Shield size={24} className="text-white" strokeWidth={1.5} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-900 md:text-4xl">
            Política de Privacidade e Proteção de Dados Pessoais
          </h1>
          <p className="mt-3 text-sm font-medium uppercase tracking-wider text-neutral-500">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-xs text-neutral-400">
            Última atualização: 15 de setembro de 2026
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-neutral-700 md:text-[15px]">
          <Section number="1" title="Apresentação">
            <p>
              A {siteConfig.name} respeita a privacidade, a proteção dos dados pessoais e os direitos
              de seus clientes, usuários, visitantes e demais titulares de dados.
            </p>
            <p>
              Esta Política de Privacidade estabelece as regras aplicáveis ao tratamento de dados
              pessoais realizado no contexto do site, catálogo digital, atendimento, relacionamento
              comercial, pedidos e demais serviços digitais disponibilizados pela {siteConfig.name}.
            </p>
            <p>
              O tratamento de dados pessoais observará a legislação brasileira aplicável, especialmente
              a Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais (LGPD), o Marco Civil da
              Internet, o Código de Defesa do Consumidor e demais normas pertinentes.
            </p>
          </Section>

          <Section number="2" title="Controlador dos Dados">
            <p>
              A {siteConfig.name} será identificada como controladora dos dados pessoais tratados no
              âmbito de suas atividades, quando determinar as finalidades e os meios do tratamento.
            </p>
          </Section>

          <Section number="3" title="Princípios Observados">
            <p>
              O tratamento de dados pessoais deverá observar os princípios previstos na LGPD, incluindo:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>finalidade;</li>
              <li>adequação;</li>
              <li>necessidade;</li>
              <li>livre acesso;</li>
              <li>qualidade dos dados;</li>
              <li>transparência;</li>
              <li>segurança;</li>
              <li>prevenção;</li>
              <li>não discriminação;</li>
              <li>responsabilização e prestação de contas.</li>
            </ul>
            <p>
              A {siteConfig.name} buscará limitar o tratamento aos dados necessários para as
              finalidades informadas.
            </p>
          </Section>

          <Section number="4" title="Dados Pessoais Tratados">
            <p>
              Dependendo da interação realizada pelo usuário, poderão ser tratados:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>nome completo;</li>
              <li>número de WhatsApp ou telefone;</li>
              <li>CPF, quando fornecido;</li>
              <li>informações relacionadas a pedidos;</li>
              <li>produtos adquiridos;</li>
              <li>informações fornecidas em formulários;</li>
              <li>informações utilizadas para atendimento;</li>
              <li>informações de cadastro;</li>
              <li>dados relacionados a leads e relacionamento comercial;</li>
              <li>informações técnicas de navegação, quando coletadas.</li>
            </ul>
            <p>
              Não serão coletados dados pessoais desnecessários para a finalidade pretendida.
            </p>
          </Section>

          <Section number="5" title="Dados de Navegação">
            <p>
              Dependendo das tecnologias utilizadas no site, poderão ser tratados dados técnicos, como:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>endereço IP;</li>
              <li>navegador;</li>
              <li>sistema operacional;</li>
              <li>dispositivo;</li>
              <li>data e horário de acesso;</li>
              <li>páginas acessadas;</li>
              <li>informações técnicas necessárias ao funcionamento e segurança da plataforma.</li>
            </ul>
            <p>
              O tratamento desses dados deverá respeitar os princípios da necessidade, segurança,
              transparência e finalidade.
            </p>
          </Section>

          <Section number="6" title="Finalidades do Tratamento">
            <p>Os dados poderão ser tratados para:</p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>processamento de pedidos;</li>
              <li>atendimento;</li>
              <li>comunicação com clientes;</li>
              <li>confirmação de informações;</li>
              <li>entrega ou retirada de produtos;</li>
              <li>processamento de pagamentos;</li>
              <li>relacionamento comercial;</li>
              <li>cadastro de clientes e leads;</li>
              <li>envio de novidades e ofertas quando autorizado ou permitido pela legislação;</li>
              <li>segurança;</li>
              <li>prevenção a fraudes;</li>
              <li>cumprimento de obrigações legais;</li>
              <li>exercício regular de direitos;</li>
              <li>defesa em processos judiciais, administrativos ou arbitrais;</li>
              <li>melhoria do funcionamento do site.</li>
            </ul>
          </Section>

          <Section number="7" title="Bases Legais">
            <p>
              O tratamento poderá ocorrer com fundamento nas hipóteses previstas na LGPD, incluindo,
              conforme aplicável:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>consentimento do titular;</li>
              <li>cumprimento de obrigação legal ou regulatória;</li>
              <li>execução de contrato ou de procedimentos preliminares;</li>
              <li>exercício regular de direitos;</li>
              <li>proteção da vida ou da incolumidade física, quando aplicável;</li>
              <li>tutela da saúde, quando aplicável;</li>
              <li>legítimo interesse, observados os requisitos legais;</li>
              <li>proteção do crédito, quando aplicável;</li>
              <li>demais hipóteses previstas na legislação.</li>
            </ul>
            <p>
              A base legal será definida de acordo com a finalidade e a natureza concreta do tratamento.
            </p>
          </Section>

          <Section number="8" title="Pedidos e Compras">
            <p>
              Quando o usuário realizar um pedido, determinados dados poderão ser necessários para:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>identificação;</li>
              <li>processamento da compra;</li>
              <li>comunicação;</li>
              <li>pagamento;</li>
              <li>entrega;</li>
              <li>retirada;</li>
              <li>atendimento;</li>
              <li>cumprimento de obrigações legais.</li>
            </ul>
            <p>
              O tratamento poderá estar fundamentado, conforme o caso, na execução do contrato,
              cumprimento de obrigação legal, exercício regular de direitos ou outra base legal
              aplicável.
            </p>
          </Section>

          <Section number="9" title="WhatsApp e Comunicação">
            <p>
              O WhatsApp poderá ser utilizado como canal de comunicação entre a {siteConfig.name} e
              seus clientes ou interessados.
            </p>
            <p>
              O número fornecido pelo titular poderá ser utilizado para atendimento, informações
              relacionadas a pedidos, suporte, comunicação comercial e outras finalidades compatíveis
              com o contexto em que o contato foi fornecido.
            </p>
            <p>
              A utilização do WhatsApp também está sujeita aos termos e políticas da própria plataforma.
            </p>
          </Section>

          <Section number="10" title="Recebimento de Novidades e Ofertas">
            <p>
              Quando o usuário fornecer voluntariamente nome e WhatsApp para receber novidades,
              lançamentos ou ofertas, esses dados poderão ser utilizados para comunicação comercial
              compatível com a finalidade informada.
            </p>
            <p>
              Quando o tratamento depender de consentimento, o titular poderá revogá-lo.
            </p>
            <p>
              O titular também poderá solicitar a interrupção de comunicações comerciais.
            </p>
          </Section>

          <Section number="11" title="Cookies e Tecnologias Semelhantes">
            <p>
              O site poderá utilizar cookies e tecnologias semelhantes para:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>funcionamento do site;</li>
              <li>segurança;</li>
              <li>manutenção de sessão;</li>
              <li>preferências;</li>
              <li>análise de utilização;</li>
              <li>melhoria da experiência;</li>
              <li>outras finalidades legítimas devidamente informadas.</li>
            </ul>
            <p>
              Quando necessário, deverão ser observadas as regras de transparência e consentimento
              aplicáveis.
            </p>
          </Section>

          <Section number="12" title="Compartilhamento de Dados">
            <p>
              Os dados poderão ser compartilhados, quando necessário e de acordo com a legislação, com:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>instituições e processadores de pagamento;</li>
              <li>empresas responsáveis por serviços tecnológicos;</li>
              <li>prestadores necessários à operação;</li>
              <li>serviços de comunicação;</li>
              <li>fornecedores envolvidos na execução dos pedidos;</li>
              <li>autoridades públicas, quando houver obrigação legal;</li>
              <li>assessorias ou profissionais que necessitem das informações para exercício regular de direitos.</li>
            </ul>
            <p>
              O compartilhamento será limitado ao necessário para a finalidade correspondente.
            </p>
          </Section>

          <Section number="13" title="Pagamentos">
            <p>
              Quando houver processamento de pagamentos por plataformas ou instituições financeiras,
              determinados dados poderão ser tratados diretamente pelos respectivos prestadores.
            </p>
            <p>
              Cada prestador poderá possuir sua própria política de privacidade e regras de tratamento
              de dados.
            </p>
            <p>
              A {siteConfig.name} não deverá armazenar dados completos de cartão de crédito em seus
              próprios sistemas quando o processamento for realizado por um provedor externo.
            </p>
          </Section>

          <Section number="14" title="Segurança da Informação">
            <p>
              Nos termos dos princípios de segurança e prevenção previstos na LGPD, a {siteConfig.name}{' '}
              buscará adotar medidas técnicas e administrativas adequadas para proteger os dados pessoais.
            </p>
            <p>As medidas poderão envolver:</p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>controle de acesso;</li>
              <li>autenticação;</li>
              <li>restrição de permissões;</li>
              <li>proteção das informações armazenadas;</li>
              <li>monitoramento;</li>
              <li>medidas preventivas contra acessos indevidos;</li>
              <li>procedimentos de segurança aplicáveis aos sistemas utilizados.</li>
            </ul>
            <p>
              Nenhum sistema é absolutamente imune a riscos, mas serão adotadas medidas compatíveis
              com a natureza dos dados tratados.
            </p>
          </Section>

          <Section number="15" title="Incidentes de Segurança">
            <p>
              Na hipótese de incidente de segurança envolvendo dados pessoais, serão adotadas as
              medidas cabíveis de acordo com a legislação aplicável e com a natureza e os riscos do
              incidente.
            </p>
            <p>
              Quando exigido pela legislação, serão realizadas as comunicações pertinentes às
              autoridades competentes e aos titulares afetados.
            </p>
          </Section>

          <Section number="16" title="Armazenamento e Retenção">
            <p>
              Os dados pessoais serão mantidos pelo período necessário para cumprir as finalidades do
              tratamento, obrigações legais, regulatórias e contratuais, bem como para o exercício
              regular de direitos.
            </p>
            <p>
              A eliminação poderá ocorrer quando não houver mais fundamento legítimo para conservação,
              ressalvadas as hipóteses legais de retenção.
            </p>
          </Section>

          <Section number="17" title="Direitos do Titular">
            <p>
              Nos termos da LGPD, o titular poderá exercer, conforme aplicável:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>confirmação da existência de tratamento;</li>
              <li>acesso aos dados pessoais;</li>
              <li>correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>anonimização;</li>
              <li>bloqueio;</li>
              <li>eliminação;</li>
              <li>portabilidade, observadas as regulamentações aplicáveis;</li>
              <li>informação sobre compartilhamentos;</li>
              <li>informação sobre a possibilidade de não fornecer consentimento;</li>
              <li>revogação do consentimento;</li>
              <li>oposição ao tratamento, quando cabível;</li>
              <li>revisão de decisões tomadas unicamente com base em tratamento automatizado, quando aplicável.</li>
            </ul>
            <p>
              O exercício de determinados direitos poderá estar sujeito às limitações previstas na
              legislação.
            </p>
          </Section>

          <Section number="18" title="Veracidade dos Dados">
            <p>
              O titular é responsável pela veracidade e atualização das informações fornecidas.
            </p>
            <p>
              A {siteConfig.name} poderá solicitar informações adicionais para confirmar a identidade do
              solicitante antes de atender determinadas solicitações.
            </p>
            <p>
              Essa medida tem como objetivo proteger o próprio titular contra acesso indevido aos seus
              dados.
            </p>
          </Section>

          <Section number="19" title="Crianças e Adolescentes">
            <p>
              O tratamento de dados pessoais de crianças e adolescentes observará as regras específicas
              previstas na LGPD e demais normas aplicáveis.
            </p>
            <p>
              Quando o tratamento envolver crianças, deverá ser observado o melhor interesse da criança,
              nos termos da legislação.
            </p>
          </Section>

          <Section number="20" title="Direito do Consumidor">
            <p>
              As relações de consumo realizadas por meio do site ou catálogo também estarão sujeitas à
              legislação brasileira aplicável, especialmente ao Código de Defesa do Consumidor e às
              normas de comércio eletrônico.
            </p>
            <p>
              As informações sobre produtos, preços, condições de pagamento, entrega, atendimento e
              demais condições comerciais deverão ser apresentadas de forma clara e adequada ao
              consumidor.
            </p>
          </Section>

          <Section number="21" title="Comércio Eletrônico">
            <p>
              Nas operações realizadas por meio eletrônico, serão observadas, quando aplicáveis, as
              disposições do Decreto nº 7.962/2013 e demais normas relacionadas ao comércio eletrônico
              e à proteção do consumidor.
            </p>
          </Section>

          <Section number="22" title="Marco Civil da Internet">
            <p>
              Quando aplicável às atividades realizadas no ambiente digital, serão observadas as
              disposições da Lei nº 12.965/2014 — Marco Civil da Internet e de seu regulamento, Decreto
              nº 8.771/2016.
            </p>
          </Section>

          <Section number="23" title="Responsabilidade">
            <p>
              O tratamento de dados será realizado de acordo com as finalidades informadas e dentro das
              hipóteses autorizadas pela legislação.
            </p>
            <p>
              Eventuais responsabilidades decorrentes de tratamento irregular de dados pessoais serão
              analisadas de acordo com a legislação aplicável e as circunstâncias concretas.
            </p>
          </Section>

          <Section number="24" title="Como Exercer os Direitos">
            <p>
              O titular poderá solicitar informações sobre seus dados pessoais e exercer seus direitos
              por meio dos canais oficiais de atendimento da {siteConfig.name}.
            </p>
            <p>
              A {siteConfig.name} poderá solicitar informações necessárias à confirmação da identidade
              do titular.
            </p>
          </Section>

          <Section number="25" title="Alterações desta Política">
            <p>
              Esta Política poderá ser atualizada para refletir alterações legislativas, regulatórias,
              tecnológicas ou operacionais.
            </p>
            <p>
              A versão vigente estará sempre disponível na página oficial da Política de Privacidade.
            </p>
          </Section>

          <Section number="26" title="Legislação Aplicável">
            <p>
              Esta Política será interpretada de acordo com a legislação brasileira aplicável, especialmente:
            </p>
            <ul className="ml-4 list-disc space-y-1.5">
              <li>Constituição Federal de 1988;</li>
              <li>Lei nº 13.709/2018 — Lei Geral de Proteção de Dados Pessoais;</li>
              <li>Lei nº 12.965/2014 — Marco Civil da Internet;</li>
              <li>Decreto nº 8.771/2016;</li>
              <li>Lei nº 8.078/1990 — Código de Defesa do Consumidor;</li>
              <li>Decreto nº 7.962/2013 — Comércio Eletrônico;</li>
              <li>Lei nº 10.406/2002 — Código Civil;</li>
              <li>demais normas aplicáveis às atividades desenvolvidas pela {siteConfig.name}.</li>
            </ul>
          </Section>

          <Section number="27" title="Disposições Finais">
            <p>
              A presente Política tem como objetivo garantir transparência ao titular quanto às
              principais práticas de tratamento de dados pessoais realizadas pela {siteConfig.name}.
            </p>
            <p>
              O tratamento será realizado observando-se os princípios da finalidade, adequação,
              necessidade, transparência, segurança, prevenção, não discriminação e responsabilização.
            </p>
            <p>
              Em caso de dúvida relacionada ao tratamento de dados pessoais, o titular poderá utilizar
              os canais oficiais de atendimento disponibilizados pela {siteConfig.name}.
            </p>
          </Section>
        </div>

        <div className="mt-16 border-t border-neutral-200 pt-8 text-center">
          <Link
            to={catalogPath('/')}
            className="text-sm font-medium text-neutral-600 underline transition-colors hover:text-neutral-900"
          >
            Voltar para o início
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-lg font-bold text-neutral-900 md:text-xl">
        {number}. {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
