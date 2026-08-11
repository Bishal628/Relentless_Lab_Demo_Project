import {
  Bus,
  FlaskConical,
  Library,
  Trophy,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react';
import { Band } from '@/components/band';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';

// Facilities. lucide-react throughout (§6), so every icon on the site shares one
// stroke width and one visual family — the hand-rolled SVGs that used to live in
// this file were close to that but not identical, and "close" is what makes an
// icon set look assembled rather than chosen.
//
// NOT six circles in a centred row. Chips-in-a-row is the template tell §3 warns
// about; this is a ruled grid where each cell states the facility and one
// concrete fact about it. The facts are the point — "Library" is a claim every
// competitor makes, "12,000 volumes" is not (§7).
const FEATURES = [
  { label: 'Science laboratories', detail: 'Physics, chemistry and biology, timetabled weekly', Icon: FlaskConical },
  { label: 'Library', detail: 'Reference and lending, open through exam season', Icon: Library },
  { label: 'Sports ground', detail: 'Football, volleyball and an inter-house calendar', Icon: Trophy },
  { label: 'Scholarships', detail: 'Merit and need-based, reviewed each intake', Icon: Wallet },
  { label: 'Transport', detail: 'Routes across Lakeview municipality', Icon: Bus },
  { label: 'Cafeteria', detail: 'Cooked on site, priced for students', Icon: UtensilsCrossed },
];

export function FeaturesStrip() {
  return (
    <Band tone="cream">
      <SectionHeading
        eyebrow="The campus"
        title="What a student actually uses, every week"
        intro="Facilities listed because they are timetabled, not because they photograph well."
      />

      {/* A ruled grid rather than free-floating cells: the hairlines do the work
          a card border would, at a fraction of the visual weight (§3 — reach for
          a border before a shadow, and for less of it where possible). */}
      <Reveal
        stagger
        as="ul"
        className="mt-16 grid gap-px border-t border-line sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map(({ label, detail, Icon }) => (
          <li
            key={label}
            className="flex gap-5 border-b border-line py-8 pr-6"
          >
            <Icon
              aria-hidden="true"
              className="mt-0.5 size-6 flex-none text-signature-ink"
              strokeWidth={1.5}
            />
            <div>
              <h3 className="font-display text-h3 text-ink-950">{label}</h3>
              <p className="mt-1.5 text-small text-ink-muted">{detail}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </Band>
  );
}
