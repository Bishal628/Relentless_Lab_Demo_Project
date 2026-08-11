import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Band } from '@/components/band';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';

// Evergreen programme blurbs — no dates, no intake years. Rows link to the
// programmes index for now; per-programme detail pages are CMS-driven.
//
// A LIST OF ROWS, not a grid of cards (§3). Four equal cards say "these are
// four interchangeable things"; a ruled list with the level called out says
// "these are the stages of an education", which is what the page is actually
// claiming. It also lets each row carry a real sentence at a readable measure
// instead of a blurb squeezed into a 280px column.
const PROGRAMMES = [
  {
    title: '+2 Management',
    level: 'Grades 11–12',
    blurb:
      'Business studies, computer science, hotel management and travel & tourism — a broad commerce foundation with a stream chosen at admission.',
  },
  {
    title: '+2 Law',
    level: 'Grades 11–12',
    blurb:
      'Run with Lakeview Institute of Legal Studies, on a separate syllabus and a smaller intake, for students already set on a legal career.',
  },
  {
    title: 'BBS',
    level: "Bachelor's, 4 years",
    blurb:
      'A Bachelor of Business Studies affiliated to Lakeview National University, taught on the same campus as the +2 programmes.',
  },
  {
    title: 'Secondary',
    level: 'Grades 9–10',
    blurb:
      'The grounding the +2 programmes are built on, with laboratory and library access from Grade 9 rather than Grade 11.',
  },
];

export function ProgrammesOverview() {
  return (
    // Sand, not cream: this sits between two cream bands and is the quiet warm
    // break between them.
    <Band tone="sand">
      <SectionHeading
        eyebrow="What we offer"
        title="From Grade 9 to a Bachelor’s degree, without changing campus"
        intro="Four programmes, one campus, one set of teachers who follow a student through."
      />

      <Reveal stagger as="ul" className="mt-16 border-t border-line">
        {PROGRAMMES.map((programme) => (
          <li key={programme.title}>
            <Link
              href="/programmes"
              className="group grid items-baseline gap-x-10 gap-y-3 border-b border-line py-8 transition-colors duration-200 ease-[var(--ease-soft)] hover:bg-signature-wash/60 lg:grid-cols-12 lg:py-10 motion-reduce:transition-none"
            >
              <div className="lg:col-span-4">
                <h3 className="font-display text-h3 text-ink-950">
                  {programme.title}
                </h3>
                <p className="mt-1 text-small text-signature-ink">
                  {programme.level}
                </p>
              </div>

              <p className="text-body text-ink-muted lg:col-span-7">
                {programme.blurb}
              </p>

              {/* The affordance is one icon that leans on hover — no "Learn
                  more →" on every row, which at four rows reads as four
                  competing calls to action. */}
              <span className="flex text-ink-500 lg:col-span-1 lg:justify-end">
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-5 transition-transform duration-200 ease-[var(--ease-soft)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0 motion-reduce:group-hover:translate-y-0"
                />
                <span className="sr-only">
                  Read more about {programme.title}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </Reveal>
    </Band>
  );
}
