import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Go-live guard: the development sender must never reach production.
// ---------------------------------------------------------------------------
// onboarding@resend.dev delivers ONLY to the Resend account owner's verified
// address. Shipped to production it looks perfectly healthy — Resend accepts
// every send, nothing errors, no alert fires — while the office silently stops
// receiving admission enquiries and contact messages. PRD 31.3 calls a silent
// notification failure the costliest failure in the system, so the deploy dies
// here rather than at the first lost lead.
//
// This lives in next.config.ts because it is the only place guaranteed to be
// evaluated during `next build`, and it is the ONLY copy of the check on
// purpose. The obvious alternative — the same guard at the top of the two send
// paths — was tried and removed: those are lazily-loaded Server Action modules,
// so the throw lands on first invocation, BEFORE the submission is written to
// Postgres. That turns a broken notification into a lost lead, which is the one
// outcome PRD 34 forbids. The deploy gate catches the case that actually
// happens (shipping the wrong sender) without ever putting a submission at
// risk; the send paths stay fail-open, logging and returning when RESEND_FROM
// is missing.
//
// Residual gap, accepted knowingly: editing RESEND_FROM to the dev sender in
// the Vercel dashboard WITHOUT a rebuild is not caught here. Verify the value
// after any change to it.
//
// VERCEL_ENV, not NODE_ENV: `next build` runs with NODE_ENV=production locally
// and on preview deploys too, and both are SUPPOSED to use the dev sender.
// Substring match, not equality, so the display-name form
// ("Relentless Lab School & College <onboarding@resend.dev>") cannot slip past.
if (
  process.env.VERCEL_ENV === "production" &&
  (process.env.RESEND_FROM ?? "").trim().toLowerCase().includes("onboarding@resend.dev")
) {
  throw new Error(
    "RESEND_FROM is still the development sender (onboarding@resend.dev) in production. " +
      "Set it to an address on the verified Resend sending domain before deploying.",
  );
}

const nextConfig: NextConfig = {
  /* config options here */

  // ---------------------------------------------------------------------------
  // Legacy WordPress URL map.
  // ---------------------------------------------------------------------------
  // These paths are live in Google's index and in inbound links from the old
  // site, so they must land on the new equivalent rather than a 404. Every
  // destination below is a real route in app/(public)/, and no source collides
  // with one — checked against the route tree, not assumed.
  //
  // statusCode: 301, not `permanent: true` — Next's `permanent` flag emits 308,
  // not 301. Both are permanent signals and Google treats them alike; 301 is
  // what was specified, and it is the code the SEO tooling around a WordPress
  // migration expects to see. Swap the whole block to `permanent: true` if you
  // would rather have the framework default. The two keys are mutually
  // exclusive — setting both on one rule is a build error.
  async redirects() {
    return [
      { source: '/category/notices', destination: '/news', statusCode: 301 },
      { source: '/academics', destination: '/programmes', statusCode: 301 },
      { source: '/students', destination: '/students-voice', statusCode: 301 },
      { source: '/about-us', destination: '/about', statusCode: 301 },
      { source: '/our-programmes', destination: '/programmes', statusCode: 301 },
      { source: '/admission-procedure', destination: '/admissions', statusCode: 301 },
      { source: '/footer', destination: '/', statusCode: 301 },
    ];
  },
};

export default nextConfig;
