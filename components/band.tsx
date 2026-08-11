import type { ElementType, ReactNode } from 'react';
import { Container } from './container';

// The "full-bleed band with contained inner content" pattern (design_system.md
// Section 5 & 12): the band spans the full viewport width and carries the
// background/colour to the screen edges; its inner Container keeps the content
// on the comfortable measure. Every coloured section, image band, and the
// footer is a Band, so the full-bleed/contained rhythm is consistent site-wide.
//
// `tone` picks a background from the token palette; pass `className` for any
// other treatment. Set `bleedInner` to render children edge-to-edge (e.g. a
// full-width gallery grid) without the inner Container.
//
// DARK TONES CARRY `.on-ink`. That class (app/globals.css) flips the secondary
// button to the cream side of the palette, so a dark band never needs a
// bespoke button — the same two styles read correctly on both grounds
// (demo_design_system.md §6).
const TONES: Record<string, string> = {
  none: '',
  // Pass-1 names, written against the new palette.
  cream: 'bg-cream text-ink',
  sand: 'bg-sand text-ink',
  'ink-900': 'on-ink bg-ink-900 text-sand-deep',
  'ink-950': 'on-ink bg-ink-950 text-sand-deep',

  // Legacy names — every page except the homepage still passes these. Same
  // grounds, re-pointed at the new palette; deleted in pass 2.
  paper: 'bg-paper text-ink',
  surface: 'bg-surface text-ink',
  mist: 'bg-green-mist text-ink',
  forest: 'on-ink bg-green-forest text-green-pale',
  ink: 'on-ink bg-green-ink text-green-pale',
  // --green-brand is a MID green, not a dark one, so it does NOT inherit
  // forest's text pairing. Measured against #1f7a4d: --green-pale is 4.22:1,
  // which fails AA for normal text; --paper is 5.17:1 and passes. (White is
  // 5.32:1, marginally higher, but --paper is the token the system already
  // uses for text on dark ground — §8's ghost button — and the difference
  // between #fbfcfb and #ffffff is imperceptible.)
  //
  // Because this ground is lighter, a component that renders its own dark text
  // (a --green-ink heading, an --ink-muted line) is NOT safe here just because
  // it was safe on mist or paper. Anything placed on this tone needs its own
  // on-dark treatment.
  brand: 'on-ink bg-green-brand text-paper',
};

export function Band({
  as: Tag = 'section',
  tone = 'none',
  padded = true,
  bleedInner = false,
  className = '',
  containerClassName = '',
  children,
}: {
  as?: ElementType;
  tone?: keyof typeof TONES | string;
  padded?: boolean;
  bleedInner?: boolean;
  className?: string;
  containerClassName?: string;
  children: ReactNode;
}) {
  const toneClass = TONES[tone] ?? '';
  return (
    <Tag className={`w-full ${toneClass} ${padded ? 'section-y' : ''} ${className}`}>
      {bleedInner ? children : <Container className={containerClassName}>{children}</Container>}
    </Tag>
  );
}
