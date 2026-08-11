import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Band } from '@/components/band';
import { Reveal } from '@/components/reveal';
import { Button } from '@/components/ui/button';

// Evergreen closing call-to-action (PRD 11 — the homepage's bottom conversion
// point). Any admission-season urgency lives in the staff-controlled homepage
// pop-up (PRD Decision 12), never here.
//
// Deliberately COMPACT: this band sits directly above the footer, and a
// full-height marketing section there just pushes the footer off the fold. It
// opts out of `section-y` for roughly half the usual vertical padding, and lays
// out as a row on desktop (message left, action right) so its height is one
// heading tall rather than heading + copy + button stacked.
//
// The `ink-950` tone carries `.on-ink`, so the secondary button flips to the
// cream side of the palette without this component knowing anything about it.
export function ClosingCTA() {
  return (
    <Band
      tone="ink-950"
      padded={false}
      className="py-[clamp(3rem,6vw,4.5rem)]"
      containerClassName="flex flex-col gap-8 md:flex-row md:items-end md:justify-between"
    >
      <Reveal className="max-w-2xl">
        <p className="flex items-center gap-3 text-eyebrow uppercase text-signature">
          <span aria-hidden="true" className="h-px w-8 flex-none bg-signature" />
          Admissions
        </p>
        <h2 className="mt-5 font-display text-h2 text-balance text-cream">
          Apply in a few minutes. No account, no fee.
        </h2>
        <p className="mt-3 text-sand-deep">
          Tell us which programme interests you and the admissions office will
          call you back.
        </p>
      </Reveal>

      <Reveal className="shrink-0">
        <Button asChild>
          <Link href="/apply">
            Apply now
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </Reveal>
    </Band>
  );
}
