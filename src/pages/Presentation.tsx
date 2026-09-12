import { PresentationHeader } from '@/components/presentation/PresentationHeader';
import { PresentationFooter } from '@/components/presentation/PresentationFooter';
import { PresentationHero } from '@/components/presentation/PresentationHero';
import { PresentationProblem, PresentationSolution } from '@/components/presentation/PresentationProblem';
import { PresentationAudience } from '@/components/presentation/PresentationAudience';
import { PresentationFashion, PresentationNiches } from '@/components/presentation/PresentationFashion';
import { PresentationPhysicalStore } from '@/components/presentation/PresentationPhysicalStore';
import { PresentationInstagramFlow } from '@/components/presentation/PresentationInstagramFlow';
import { PresentationHowItWorks } from '@/components/presentation/PresentationHowItWorks';
import { PresentationBranding } from '@/components/presentation/PresentationBranding';
import { PresentationFeatures } from '@/components/presentation/PresentationFeatures';
import { PresentationBeforeAfter } from '@/components/presentation/PresentationBeforeAfter';
import { PresentationGrow } from '@/components/presentation/PresentationGrow';
import {
  PresentationPricing,
  PresentationPriceJustification,
} from '@/components/presentation/PresentationPricing';
import { PresentationSocialProof } from '@/components/presentation/PresentationSocialProof';
import { PresentationFAQ } from '@/components/presentation/PresentationFAQ';
import { PresentationFinalCTA } from '@/components/presentation/PresentationFinalCTA';

export default function Presentation() {
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <PresentationHeader />
      <main>
        <PresentationHero />
        <PresentationProblem />
        <PresentationSolution />
        <PresentationAudience />
        <PresentationFashion />
        <PresentationNiches />
        <PresentationPhysicalStore />
        <PresentationInstagramFlow />
        <PresentationHowItWorks />
        <PresentationBranding />
        <PresentationFeatures />
        <PresentationBeforeAfter />
        <PresentationGrow />
        <PresentationPricing />
        <PresentationPriceJustification />
        <PresentationSocialProof />
        <PresentationFAQ />
        <PresentationFinalCTA />
      </main>
      <PresentationFooter />
    </div>
  );
}
