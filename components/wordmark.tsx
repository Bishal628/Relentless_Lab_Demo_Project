// ---------------------------------------------------------------------------
// The wordmark — pure type, no image asset.
//
// The institution has no logo file, and the Cloudinary public IDs the nav used
// to point at (relentlesslab/logo1 and logo2) do not exist in this demo's media
// account, so both rendered as broken images. A typographic mark is the honest
// answer rather than a placeholder graphic: this is a demo of a system, and the
// system's own display serif is a better mark than a stand-in PNG.
//
// It is built as a LOCKUP, not a line of nav text (demo_design_system.md §2):
//   * "Relentless Lab" in the display serif at a confident weight, with a touch
//     of negative tracking so the letterforms sit as one unit.
//   * "School & College" beneath it in the body sans — small, uppercase, widely
//     letterspaced. That tracking is what makes the second line read as part of
//     a mark rather than as a subtitle someone forgot to style.
//   * A fixed line-height on both, so the two-line stack fits the 80px nav bar
//     without wrapping and without pushing the bar taller.
//
// The short form is deliberate. "Relentless Lab School & College" set on one
// line either wraps or shrinks below a legible size at tablet widths; splitting
// the name from the descriptor keeps the full institution name present while
// giving the memorable half the size it deserves.
//
// `tone` follows the same rule as every other piece of text on the site: ink on
// light grounds, cream on dark ones. No accent — §1 rations that to CTAs and
// small highlight moments, and a logo that is always on screen is neither.
// ---------------------------------------------------------------------------
export function Wordmark({
  tone = 'light',
  size = 'md',
  className = '',
}: {
  tone?: 'light' | 'dark';
  /** `md` for the nav bar, `lg` for the footer's identity block. */
  size?: 'md' | 'lg';
  className?: string;
}) {
  const dark = tone === 'dark';

  return (
    // aria-hidden on both lines + a single sr-only name on the link that wraps
    // this would be over-engineering; the two lines read as "Relentless Lab
    // School & College" in order, which is exactly the institution's name.
    <span className={`flex flex-col ${className}`}>
      <span
        className={[
          'font-display font-semibold leading-none tracking-[-0.015em]',
          size === 'lg' ? 'text-[1.5rem]' : 'text-[1.375rem]',
          dark ? 'text-cream' : 'text-ink-950',
        ].join(' ')}
      >
        Relentless Lab
      </span>
      <span
        className={[
          'mt-1 font-body font-medium uppercase leading-none',
          size === 'lg'
            ? 'text-[0.625rem] tracking-[0.22em]'
            : 'text-[0.5625rem] tracking-[0.2em]',
          dark ? 'text-sand-deep/80' : 'text-ink-muted',
        ].join(' ')}
      >
        School &amp; College
      </span>
    </span>
  );
}
