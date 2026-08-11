import type { CSSProperties } from 'react';
import { Band } from '@/components/band';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { statOrFallback } from '@/lib/settings';
import { CountUp } from './count-up';

// Institutional figures, now SETTINGS-DRIVEN (PRD 11). The homepage reads the
// three values from the settings store and passes them in.
//
// The hardcoded figures survive as FALLBACKS, not as the source of truth: a
// blank setting renders the real number below rather than an empty stat or a
// counter climbing to 0. PRD 11 is explicit that the current site's unfilled
// "0 +" is the thing to avoid.
const STAT_FALLBACKS = {
  years: '30+',
  students: '1,200+',
  teachers: '60+',
};

// A statistic is stored as ONE free-text string ('1,200+') because the suffix is
// part of what the school wants displayed — see the Settings page. The counter,
// though, needs a number.
//
// So: split the leading digits (commas allowed) from whatever follows, animate
// the number, and render the remainder statically beside it. '1,200+' counts up
// to 1,200 with a '+' pinned next to it, exactly as the hardcoded version did.
//
// A value with no leading number ('over a thousand') simply does not animate —
// it renders verbatim. That is the right failure: the figure the school typed is
// always what a visitor reads, and only the animation is negotiable.
function splitStat(value: string): { to: number; suffix: string } | null {
  const match = value.trim().match(/^([\d,]+)(.*)$/);
  if (!match) return null;
  const to = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(to)) return null;
  return { to, suffix: match[2] };
}

// The value proposition, as an EDITORIAL LIST rather than three identical
// boxes. §3 asks the page to break the card-grid-everywhere instinct, and three
// cards directly under the hero is exactly that instinct: it turns three
// sentences into three pieces of furniture. Numbered entries separated by
// hairlines read as a considered argument and take a third of the vertical
// space, which buys the whitespace §3 wants elsewhere.
//
// Copy is specific rather than superlative (§7): a number, a named path, a
// named outcome.
const BENEFITS = [
  {
    title: 'Twenty-two years, one campus',
    text: 'Teaching in Riverside since 2004, with graduates now sending their own children.',
  },
  {
    title: 'Grade 11 to a degree, uninterrupted',
    text: 'A +2 programme and a Bachelor’s on the same campus — no transfer year, no lost time.',
  },
  {
    title: 'Learning you can point at',
    text: 'Laboratory work, field visits and a student publication, assessed alongside the board syllabus.',
  },
];

// One "why Relentless Lab, by the numbers" block directly under the hero: the three
// story benefits AND the three headline stats live together here (the old
// separate lower stats band is gone). Benefits row on top, stats row below.
export function ThreeBenefits({
  statYears = '',
  statStudents = '',
  statTeachers = '',
}: {
  statYears?: string;
  statStudents?: string;
  statTeachers?: string;
}) {
  // Fallbacks are applied HERE rather than at the call site, so the component
  // renders real figures whatever it is handed — including nothing at all.
  //
  // `accent` is each column's own --stat-accent (see .stat-card in globals.css)
  // — the rule above the figure. It steps sand-deep → ink-500 → ink-900 across
  // the row, a gradation in the ink family rather than three arbitrary colours.
  // Deliberately NOT the signature accent: §1 rations that to CTAs and small
  // highlight moments, and three of them in a row is neither.
  const stats = [
    {
      value: statOrFallback(statYears, STAT_FALLBACKS.years),
      label: 'years of teaching',
      accent: 'var(--sand-deep)',
    },
    {
      value: statOrFallback(statStudents, STAT_FALLBACKS.students),
      label: 'students enrolled',
      accent: 'var(--ink-500)',
    },
    {
      value: statOrFallback(statTeachers, STAT_FALLBACKS.teachers),
      label: 'teaching staff',
      accent: 'var(--ink-900)',
    },
  ];

  return (
    <Band tone="cream">
      <SectionHeading
        eyebrow="Why Relentless Lab"
        title="A small institution that keeps its promises"
        intro="Three things prospective families ask about first, answered plainly."
      />

      {/* The numbered list. Hairline-separated rows on a 12-column grid: the
          index and title sit left, the sentence runs in the right-hand columns,
          so each entry reads across rather than down (§3). */}
      <Reveal stagger as="ol" className="mt-16 border-t border-line">
        {BENEFITS.map((benefit, index) => (
          <li
            key={benefit.title}
            className="grid gap-x-10 gap-y-3 border-b border-line py-8 lg:grid-cols-12 lg:items-baseline lg:py-10"
          >
            <div className="flex items-baseline gap-5 lg:col-span-6">
              {/* Oldstyle-ish index in the display serif — the figure is part of
                  the typography, not a badge. */}
              <span
                aria-hidden="true"
                className="font-display text-h3 tabular-nums text-signature-ink"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-h3 text-ink-950">
                {benefit.title}
              </h3>
            </div>
            <p className="text-body text-ink-muted lg:col-span-6">
              {benefit.text}
            </p>
          </li>
        ))}
      </Reveal>

      {/* Stats row — counts up on scroll; CountUp shows the final value
          immediately under prefers-reduced-motion. The figures are LEFT-aligned
          in three hairline-separated columns rather than centred in three
          cards: the count-up and the Reveal stagger are untouched, but the
          furniture around them is gone, so the numbers themselves carry the
          moment. Each column keeps its accent rule, which still draws itself
          out as the row reveals. */}
      <Reveal
        stagger
        as="dl"
        className="mt-16 grid gap-x-10 gap-y-10 sm:grid-cols-3"
      >
        {stats.map((stat) => {
          const parsed = splitStat(stat.value);
          return (
            <div
              key={stat.label}
              // The column's identity colour. An inline custom property, not a
              // class, so the rule reads one value.
              style={{ '--stat-accent': stat.accent } as CSSProperties}
              className="stat-card flex flex-col items-start gap-4"
            >
              <dd className="font-display text-hero leading-none text-ink-950">
                {parsed ? (
                  <>
                    <CountUp to={parsed.to} />
                    {parsed.suffix}
                  </>
                ) : (
                  stat.value
                )}
              </dd>
              <dt className="text-small uppercase tracking-wide text-ink-muted">
                {stat.label}
              </dt>
            </div>
          );
        })}
      </Reveal>
    </Band>
  );
}
