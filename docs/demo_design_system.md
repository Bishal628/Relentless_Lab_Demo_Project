# Demo Design System — Relentless Lab School & College

**Purpose.** This is a direction, not a rulebook. It exists so the site reads as one coherent, considered thing rather than a collection of default-Tailwind pages — and so it looks nothing like the template-driven school/college sites that are the actual competition in this pitch. Where a rule below would fight good judgment on a specific page, use the judgment; come back and update this doc if the change is worth keeping everywhere.

**The one sentence that matters.** Most school/college sites in this market read as a bright, centered, blue-and-white Bootstrap template with a stock-photo hero carousel. This site should read as a confident, editorial, institutional publication — closer to a well-produced prospectus or annual report than a SaaS landing page.

---

## 1. Color

Not exact hex-locked — pick values in these families and hold them consistent once chosen.

**Primary (ink)** — a deep, near-black navy or forest green. Something in the neighborhood of `#12172B` (ink navy) or `#14261E` (deep forest). This carries headers, nav, footer, and dark-background sections. Avoid bright/saturated blue (`#2563EB`-style) — that's the default-template color every competitor already uses.

**Accent (signature)** — exactly one warm color: muted amber, terracotta, or deep gold. Something like `#C77D3A` or `#B8863B`. This is rationed the way the real Modern build rations `--green-signature` — CTAs, active states, a small number of highlight moments. It should never appear as a background fill on more than a small element at a time. If in doubt, use less of it, not more.

**Background** — warm off-white or cream, not stark white. Something like `#FAF6EF` or `#F7F3EA`. This single swap (cream instead of `#FFFFFF`) does a disproportionate amount of the "considered, not default" work.

**Text** — charcoal, not pure black (`#1C1C1C`-ish for body copy on light backgrounds; the cream/off-white equivalent on dark sections).

**Supporting neutrals** — a small warm-gray scale for borders, muted text, card backgrounds sitting between the cream base and full ink. Radix Colors' sand/olive/clay scales are a reasonable starting point if you want pre-built, accessible steps rather than hand-picking.

Feel free to land on the exact hex values during implementation — the constraint is the *relationship* between these (dark ink, one warm accent, cream base, charcoal text), not specific numbers.

---

## 2. Typography

This is the highest-leverage decision in the whole system — get this right and a lot of other choices become easier.

**Display / headline typeface — a serif.** Something with real character and a confident weight range: Fraunces, Source Serif 4, Newsreader, or similar. Used for H1/H2, pull quotes, the leadership message titles, and other moments that should feel authored rather than generated. This is the single biggest differentiator from competitor sites, almost none of which use a serif anywhere.

**Body typeface — a clean, warm sans.** Inter, Public Sans, or similar, for anything read at length — body copy, form labels, nav, card metadata.

**Devanagari fallback** — pair each: a Devanagari serif alongside the display serif (Noto Serif Devanagari is a reasonable default) and a Devanagari sans alongside the body sans (Noto Sans Devanagari), so any Nepali-script proper nouns or names don't fall back to tofu boxes or a mismatched weight.

**Scale.** No fixed pixel table here — use a type scale that gives headlines real presence (don't be shy with H1 size on the homepage hero) and keeps body copy comfortable at 16–18px base. Let hierarchy do work: fewer font sizes, used more deliberately, reads calmer than many closely-spaced sizes.

**Load fonts via `next/font`**, not a stylesheet `<link>`, so they self-host and subset without layout shift.

---

## 3. Layout & Spacing

**Break centered-everything.** The default template instinct is: hero centered, section centered, card grid centered, repeat. Vary it — let a headline sit left-aligned against an image on the right, let some sections run full-bleed edge to edge, let spacing rhythm change section to section rather than using one uniform padding value everywhere.

**Generous whitespace.** When unsure whether a section has enough breathing room, give it more, not less. Cramped spacing is the fastest way to look like a budget template regardless of how good the colors and type are.

**Grid.** CSS subgrid or a standard 12-column grid for anything with repeating cards (faculty, gallery, news) is fine — consistency across card layouts matters more than which grid mechanism produces it.

**Corners & elevation.** Pick one corner-radius language (soft-rounded throughout, or sharp throughout) and hold it — mixing sharp cards with pill-shaped buttons on the same page is a common tell of an unconsidered system. Shadows should be soft and rare; reach for a border or a background-color shift before reaching for a drop shadow.

---

## 4. Imagery

**Avoid posed stock photography** where possible — "students high-fiving at the camera," generic handshake-over-desk shots. Prefer documentary/candid-feeling imagery: a classroom mid-lesson, hands at a workbench, a library shelf, a campus corridor. If only posed stock is available for a given slot, that's fine — it's a demo — but favor the more editorial option when there's a choice.

**Consistent treatment.** Since demo imagery will come from several different stock sources, apply a light, consistent color treatment across all of it (a subtle warm grade, consistent brightness/contrast) so disparate photos read as one coherent shoot rather than a stock-photo grab-bag. A CSS filter or a shared Cloudinary transformation preset both work.

**Public delivery images** already go through a resizing transformation per the PRD (Decision 6) — this is a reasonable place to also apply the shared color treatment, so it's consistent by construction rather than per-component.

---

## 5. Motion

**Purposeful, not decorative.** Scroll-triggered reveals (fade + slight upward slide) for sections entering the viewport, and the animated stat counters already spec'd in the PRD (§11) — keep and refine these. That's close to the ceiling of how much motion this site needs.

**Avoid:** parallax scrolling effects, spinning/bouncing icons, auto-advancing carousels the user didn't ask for, anything that reads as "template with animation plugins bolted on afterward." If a motion choice would need to be explained or justified, it's probably too much.

Framer Motion / Motion is a reasonable library choice if hand-rolled CSS transitions get unwieldy, but plain CSS transitions are enough for most of this.

---

## 6. Components

**Build on shadcn/ui + Radix primitives** for anything interactive that needs accessible behavior out of the box — dialogs (leadership message expansion, gallery lightbox), dropdowns, tabs, form controls. This gives a consistent primitive vocabulary instead of every interactive element being bespoke.

**Buttons.** One primary style (ink or accent fill, used for the single most important action per section — Apply Now, Submit), one secondary style (outline or ghost, for everything else). Resist adding a third button style unless there's a real reason.

**Cards.** One card treatment reused across faculty, news, gallery, achievements, testimonials — same corner radius, same border/shadow language, same internal padding rhythm — so switching between sections of the site feels like the same product, not five different ones stitched together.

**Icons.** lucide-react for consistency — same stroke width, same visual family, throughout.

**Variant management.** `class-variance-authority` (cva) paired with `tailwind-merge` is worth using once there are more than two or three button/badge/card variants — keeps variant logic in one place instead of scattered conditional className strings.

---

## 7. Tone in Copy (where it touches design)

Not a copywriting spec, but worth naming: headline copy should read as confident and specific rather than generic marketing filler ("Excellence in Education Since 2004" is the kind of line every competitor site already has). Where possible, prefer specific, concrete language over superlatives — this pairs with the editorial visual direction rather than fighting it.

---

## 8. What Explicitly Carries Over From the Real Build

- The signature-accent rationing discipline (one accent color, used sparingly) — same principle as `--green-signature` in the production system, just a different color.
- Sentence case throughout (not Title Case Headlines) — reads calmer and more editorial, consistent with the direction above.
- Mobile-first responsiveness — most visitors will view this on a phone; design and check there first, not as an afterthought.

---

## 9. A Note on Process

This document sets direction, not a checklist to satisfy mechanically. If a specific page wants to break one of these guidelines for a good reason, that's a fine outcome — the point of writing this down is to make the *default* choice a good one, not to remove judgment from the process. Visual results are reviewed by a human, not iterated toward automatically or judged by any automated tool — see `CLAUDE.md`.