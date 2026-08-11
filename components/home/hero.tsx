'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HeroMedia } from '@/lib/cloudinary-url';

// Split hero: a solid deep-ink panel carries the message, the video fills the
// rest. Because the text lives on the SOLID panel, legibility NEVER depends on
// the video — the whole point of the split, and the reason this hero needs no
// scrim over the copy. On mobile the two stack (panel on top, 16:9 video below)
// and never overlap.
//
// The join between panel and video is a diagonal, not a straight line: a solid
// ink BASE spans the whole hero and the media layer sits on top of it,
// cut back on a gentle rake. The edge is deliberately SHARP — no gradient, no
// dissolve. The mechanics and the numbers live in app/globals.css
// (`.hero-media`), because the diagonal has to be re-derived for the stacked
// layout and that is a media query, not a utility class.
export function Hero({ media }: { media: HeroMedia }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt the video on ALL devices, mobile included. The poster is the SAFETY
  // NET — shown only when there is no media, prefers-reduced-motion is set, or a
  // browser rejects muted autoplay (the play().catch below). It is NOT a blanket
  // mobile block.
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    if (!media.hasMedia) {
      setShowVideo(false);
      return;
    }

    // Reduced motion → poster still, no autoplay.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowVideo(false);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // muted MUST be set as a PROPERTY (not merely the attribute) or mobile
    // browsers block inline autoplay.
    video.muted = true;

    // Try to autoplay; if the browser still refuses, drop to the poster rather
    // than leaving a blank/frozen area.
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => setShowVideo(false));
    }

    // TODO(data-saver): a considerate enhancement could autoplay on wifi and
    // show the poster on metered/cellular connections via the Network
    // Information API / Save-Data hint (navigator.connection.saveData /
    // effectiveType). Not built now.
  }, [media.hasMedia]);

  return (
    // `relative` only establishes the containing block for the layers inside;
    // the section's own bg-green-forest IS the base layer, and the grid below
    // still owns the height exactly as before (88vh floor on desktop, panel +
    // 16:9 band when stacked) — site-nav.tsx measures this element's
    // offsetHeight to decide when to go solid, so that must not move.
    // `.on-ink` puts the secondary button on the cream side of the palette for
    // the whole hero (globals.css) — one button style, two grounds, no bespoke
    // variant.
    <section data-hero className="on-ink relative w-full bg-ink-950">
      {/* NOT md:grid-cols-2. A 50/50 split is the centred-everything instinct in
          two-column clothing (§3); giving the message panel the larger share
          also gives the headline the room §2 asks for and puts the diagonal
          right of centre, where it reads as a deliberate edge rather than as a
          page fold. */}
      <div className="grid md:min-h-[88vh] md:grid-cols-[1.15fr_0.85fr]">
        {/* LEFT — the message, in its own layer ABOVE the media (z-10) and with
            NO background of its own: the base already supplies the ink, and an
            opaque panel here would paint over the part of the video that reaches
            back past the centre line. Extra TOP padding (pt-28) clears the
            overlaid fixed nav (--nav-height: 80px) so the headline is never
            hidden under it; on desktop the panel is tall and vertically centred,
            so the clearance is comfortable there too. */}
        <div className="relative z-10 flex items-center px-6 pb-20 pt-32 sm:px-10 lg:px-16 lg:pb-24">
          <div className="max-w-2xl">
            {/* The accent's first and smallest appearance on the page: a rule
                and a line of small caps (§1 — rationed, never a fill). */}
            <p className="flex items-center gap-3 text-eyebrow uppercase text-signature">
              <span aria-hidden="true" className="h-px w-8 flex-none bg-signature" />
              Riverside-7, Lakeview
            </p>

            {/* The serif, at full size, is the whole differentiator (§2). The
                accent lands on ONE word — the institution's own motto is the
                only place on the homepage where colour sits inside a
                headline. */}
            <h1 className="mt-6 font-display text-hero text-cream">
              Curiosity, discipline,{' '}
              <span className="text-signature">purpose</span>
              <span className="text-signature">.</span>
            </h1>

            <p className="measure mt-7 text-lead text-sand-deep">
              A secondary, +2 and Bachelor&apos;s institution in Lakeview,
              teaching since 2004. Small classes, a full laboratory and library,
              and a straight path from Grade 11 to a degree.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button asChild>
                <Link href="/apply">
                  Apply now
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/programmes">Explore programmes</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT — the video half, now a SPACER: it still owns exactly the same
            height it always did (16:9 on mobile, stretched to the row on
            desktop), so the hero's outer height is unchanged, but the media is
            layered on top of it and escapes this box on the diagonal. Its
            green-ink base moved onto that layer (see globals.css) so the cut
            never exposes a second green behind the seam. */}
        <div className="relative aspect-video md:aspect-auto">
          <div className="hero-media" aria-hidden="true">
            {media.hasMedia &&
              (showVideo ? (
                // A real <video> (NOT the poster still). Attempts muted inline
                // autoplay on every device; poster= the so_0 .jpg shows instantly
                // while it loads and stays put if autoplay is ever blocked, so
                // the hero is never blank. The Cloudinary f_auto delivery serves
                // a mobile-decodable format (mp4/H.264) via content negotiation.
                <video
                  ref={videoRef}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={media.posterUrl}
                  src={media.videoUrl}
                  aria-hidden="true"
                />
              ) : (
                // Poster fallback: no media, reduced motion, or autoplay rejected.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src={media.posterUrl}
                  alt=""
                  aria-hidden="true"
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}
