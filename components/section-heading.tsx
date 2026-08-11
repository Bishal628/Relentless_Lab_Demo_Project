import type { ReactNode } from 'react';
import { Reveal } from '@/components/reveal';

// ---------------------------------------------------------------------------
// The section opener, in one place.
//
// demo_design_system.md §3 asks the page to break centred-everything, and the
// most repeatable way to do that is to stop stacking every section header in a
// centred column. This lays the heading against the left edge of a 12-column
// grid and drops the supporting sentence into the right-hand columns, so the
// eye travels across the band rather than down its spine. On mobile it is
// simply two stacked blocks — asymmetry that costs nothing at 390px.
//
// The eyebrow is one of the accent's rationed appearances (§1): a 32px rule and
// a line of small caps, in the deeper accent cut that passes AA on cream. That
// is the entire accent budget for a section header — the heading itself is ink.
// ---------------------------------------------------------------------------
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'split',
  tone = 'light',
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  /** The supporting sentence. On `split`, it sits in the right-hand columns. */
  intro?: ReactNode;
  /** `split` puts the intro beside the heading; `stacked` puts it beneath. */
  align?: 'split' | 'stacked';
  tone?: 'light' | 'dark';
  className?: string;
}) {
  const dark = tone === 'dark';

  const heading = (
    <div>
      {eyebrow ? (
        <p
          className={`flex items-center gap-3 text-eyebrow uppercase ${
            dark ? 'text-signature' : 'text-signature-ink'
          }`}
        >
          <span
            aria-hidden="true"
            className="h-px w-8 flex-none bg-signature"
          />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={`mt-5 font-display text-h2 text-balance ${
          dark ? 'text-cream' : 'text-ink-950'
        }`}
      >
        {title}
      </h2>
    </div>
  );

  if (align === 'stacked' || !intro) {
    return (
      <Reveal className={`max-w-2xl ${className}`}>
        {heading}
        {intro ? (
          <p
            className={`measure mt-5 text-lead ${
              dark ? 'text-sand-deep' : 'text-ink-muted'
            }`}
          >
            {intro}
          </p>
        ) : null}
      </Reveal>
    );
  }

  return (
    <Reveal
      className={`grid gap-x-10 gap-y-6 lg:grid-cols-12 lg:items-end ${className}`}
    >
      <div className="lg:col-span-7">{heading}</div>
      <p
        className={`text-lead lg:col-span-5 ${
          dark ? 'text-sand-deep' : 'text-ink-muted'
        }`}
      >
        {intro}
      </p>
    </Reveal>
  );
}
