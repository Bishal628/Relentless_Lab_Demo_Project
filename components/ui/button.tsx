import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Button — TWO variants, and the count is the point (demo_design_system.md §6:
// "Resist adding a third button style unless there's a real reason").
//
//   primary   — the signature accent fill with ink type. ONE per section, for
//               the single most important action there (Apply now, Submit).
//               This is the entire budget for large accent colour on a page.
//   secondary — an outline, for everything else.
//
// There is no ghost, no link, no destructive. A text link that looks like a
// link is a link; a destructive action in the admin area is a secondary button
// with its own copy. Adding a variant here is a design decision, not a
// convenience, and it should be argued for in the design doc first.
//
// On a dark band, wrap the section in `.on-ink` (app/globals.css) rather than
// reaching for a third variant — the secondary style flips to the cream side of
// the palette and stays one style. Primary needs no flip: an accent fill reads
// on both grounds.
//
// The shadcn scaffolding is kept intact — Slot for `asChild` (so a Next <Link>
// can BE the button rather than nest inside one), the data-slot/data-variant
// attributes the CSS above targets, and cva for the variant table.
// ---------------------------------------------------------------------------
const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap",
    "rounded-sm border font-medium leading-none",
    "transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-soft)]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signature",
    "active:translate-y-px",
    "disabled:pointer-events-none disabled:opacity-60",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "motion-reduce:transition-none motion-reduce:active:translate-y-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-signature text-ink-950 hover:bg-signature-deep",
        // The dark-band flip lives HERE, as utilities, not as an `.on-ink`
        // rule in globals.css — a component-layer rule cannot override a
        // utility-layer one no matter how specific it is, because Tailwind's
        // @layer order decides that before specificity is consulted. The
        // `[.on-ink_&]` arbitrary variant is the same descendant selector,
        // emitted into the utilities layer where it can actually win.
        secondary: [
          "border-ink-900/30 bg-transparent text-ink-900",
          "hover:border-ink-900/55 hover:bg-ink-900/6",
          "[.on-ink_&]:border-cream/40 [.on-ink_&]:text-cream",
          "[.on-ink_&]:hover:border-cream/70 [.on-ink_&]:hover:bg-cream/12",
        ],
      },
      size: {
        // The marketing default: a CTA a thumb can hit and an eye can find.
        default: "px-6 py-3.5 text-body",
        // Denser rows — admin tables, card footers, inline actions.
        sm: "px-4 py-2.5 text-small",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
