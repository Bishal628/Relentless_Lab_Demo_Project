import type { Metadata } from 'next';
import {
  Fraunces,
  Inter,
  Noto_Serif_Devanagari,
  Noto_Sans_Devanagari,
  Geist_Mono,
} from 'next/font/google';
import './globals.css';

// ---------------------------------------------------------------------------
// Typography (demo_design_system.md §2 — "the highest-leverage decision in the
// whole system").
//
// Self-hosted via next/font, never a stylesheet <link>: subset, preloaded, and
// served from our own origin, so there is no layout shift and no third-party
// request. Each face exposes a CSS variable; app/globals.css composes those
// variables into the --font-display / --font-body stacks that everything else
// reads.
//
// PAIRING: Fraunces (display serif) + Inter (body sans).
//   * Fraunces is the differentiator. §2 asks for a serif with "real character
//     and a confident weight range", and almost no competitor site uses a serif
//     anywhere. Fraunces is variable across the full weight range and carries an
//     optical-size axis, so one family covers a 4.5rem hero and a 1.375rem card
//     title without either looking like the other scaled up or down. Its default
//     cut (SOFT/WONK at 0) is the restrained one — editorial, not novelty.
//   * Inter carries everything read at length. The character belongs in the
//     headlines; body copy, form labels, nav, and card metadata want a face that
//     disappears, and Inter is the most legible of the options at the 16–18px
//     base §2 specifies.
//
// DEVANAGARI: each is paired with its Noto counterpart — serif with serif, sans
// with sans (§2) — so a Nepali-script proper noun renders in the matching style
// rather than as tofu or in a mismatched weight.
// ---------------------------------------------------------------------------
const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  // Deliberately NOT named --font-sans. That name belongs to the shadcn theme
  // layer, which maps it to --font-body in globals.css; using it here too would
  // make --font-sans resolve to itself.
  variable: '--font-inter',
  display: 'swap',
});

const displayDevanagari = Noto_Serif_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-serif-deva',
  display: 'swap',
});

const bodyDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-noto-sans-deva',
  display: 'swap',
});

const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Relentless Lab School & College',
    template: '%s · Relentless Lab School & College',
  },
  description:
    'Relentless Lab School & College, Lakeview — a modern +2 and Bachelor’s institution. Curiosity, discipline, purpose, since 2004.',
  // This is a demonstration platform for a fictional institution (PRD 33) and
  // must never rank. Inherited by every page that does not override it.
  //
  // Belt and braces with app/robots.ts: robots.txt asks a crawler not to fetch,
  // this asks a crawler that fetched anyway not to index or follow. A URL
  // blocked only by robots.txt can still be indexed from an inbound link, so
  // this is the half that actually keeps the demo out of results.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${displayDevanagari.variable} ${bodyDevanagari.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
