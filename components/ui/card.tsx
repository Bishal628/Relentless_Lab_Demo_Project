import * as React from "react"

import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Card — ONE treatment, reused everywhere (demo_design_system.md §6): warm
// surface, a single hairline border, --radius-md corners, and a uniform 24px
// internal padding rhythm. Faculty, news, gallery, achievements and
// testimonials all get this same object, so moving between sections of the site
// feels like one product.
//
// NO SHADOW at rest. §3 is explicit — "shadows should be soft and rare; reach
// for a border or a background-color shift before reaching for a drop shadow" —
// so separation is carried by the border and by the surface sitting a step
// warmer than the cream ground. Hover shifts the border toward the accent and
// lifts by 2px; that is the entire elevation vocabulary.
//
// `interactive` is a boolean, not a variant: a card that is a link gets the
// hover response, a card that is a container does not. Everything else about
// the two is identical, which is what keeps this one treatment rather than two.
//
// Pairs with `.content-card` in app/globals.css, which is the subgrid-aligned
// version used by the shared card grids. Same border, same radius, same
// surface, same hover — that file owns the row-alignment mechanics, this owns
// the plain case.
// ---------------------------------------------------------------------------
function Card({
  className,
  interactive = false,
  ...props
}: React.ComponentProps<"div"> & { interactive?: boolean }) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-md border border-line bg-surface text-ink",
        interactive && [
          "transition-[transform,border-color] duration-200 ease-[var(--ease-soft)]",
          "hover:-translate-y-0.5 hover:border-signature/45",
          "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        ],
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2 p-6", className)}
      {...props}
    />
  )
}

// The card title is display serif (§2) — the same voice as the section heading
// above it, one step down the scale.
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-display text-h3 text-ink-950", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-small text-ink-muted", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 pb-6 [&:not(:first-child)]:pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center gap-3 px-6 pb-6", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
