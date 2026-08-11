# CLAUDE.md — Relentless Lab Demo (Relentless Lab School & College)

Operating instructions for Claude Code on this project. Read this and the specs before making changes.

## The specs
Two documents govern this project:
- `/docs/demo_PRD.md` — the product & system spec. Read it before proposing or changing any database schema, security policy, route, or data flow.
- `/docs/demo_design_system.md` — the visual direction. Read it before building or restyling any UI. It is a direction, not a checklist — good judgment on a specific page can override a specific guideline, but the overall system (ink/cream/accent palette, serif display + sans body, restrained motion) should hold everywhere.

If a request seems to conflict with either, stop and flag the conflict rather than guessing. The specs win unless I explicitly override them in the prompt.

## What this project is
A **demonstration** platform — a staff-managed marketing + admissions website built to pitch real school/college prospects, not a live institution. Stack: Next.js (App Router, TypeScript) + Tailwind + Supabase (Postgres/Auth) + Cloudinary (media) + Resend (email), deployed on Vercel. It is NOT an accountability system and has none of that machinery.

**This is a fictional institution.** Relentless Lab School & College, its people, and its history do not exist. Never introduce a reference to the real institution this demo was derived from, its real domain, its real address, or any real person who was ever named in that project's content. If you encounter one while working (a stray string a rewrite pass missed), stop and flag it rather than silently fixing or silently leaving it.

## Isolation from the real project
This demo runs on its own Supabase project, its own Cloudinary account, and its own repository — nothing is shared with the live institutional site this was derived from.
- Never point any env var, connection string, or API call at the real project's infrastructure.
- Never copy `.env.local` values from the real project into this one.
- If you ever need a credential you don't have, ask — never fall back to a value you've seen elsewhere.

## Non-negotiable security rules
1. **Three roles: Guest (public, no account), Admin, and Owner.** There is NO public signup anywhere. Never add a signup route, a signup trigger on `auth.users`, or any path by which a visitor obtains an account. Admin accounts are created only by an Owner (or seeded by hand for the first Owner). Only an Owner may reach `/admin/users` or change anyone's role/active status — this is enforced at both the route and the database layer, not just hidden in the UI.

2. **The public can READ but never WRITE directly.** The Supabase anon key is read-only on published content. Every public submission (admission enquiry, contact message) goes through a server route/Server Action that holds the service-role key, runs bot checks FIRST, then writes. Never let the browser insert with the anon key.

3. **The service-role key is server-only, always.** It lives only in `lib/supabase/service.ts` (which starts with `import 'server-only'`) and in server routes. Never import it into a client component, never expose it to the browser, never log it. It bypasses all RLS.

4. **Enforcement reads the role LIVE from the database, never from the JWT/session.** A deactivated or demoted staff member must lose access on their next action, not up to an hour later. Middleware checks session only; the admin layout checks active-staff status by reading `profiles` fresh; the Users route additionally checks Owner.

5. **RLS is the real enforcement. Hiding a UI control is never a security measure.** Every restriction must have a matching database policy. If you hide a button, also state which policy makes the underlying attempt fail.

6. **Never weaken these to make something work.** If a feature seems to need a direct client write, an exposed service key, or a JWT role read, stop and ask — there is almost always a correct pattern instead.

## Data-integrity rules
- **Retire, never delete, Management streams.** Removing a stream flips an `is_available` flag; past submissions keep their stream label as text. No hard-delete path on that table. Same spirit: submissions/messages are archived, not deleted.
- **The server sets `reference`, `status`, `verification`, and all timestamps.** Never accept these from the browser.
- **Management stream list ships EMPTY, same as a real deployment.** Streams are added through `/admin/admissions` after login, which both keeps the migration set identical to a real client build and demonstrates Decision 5 working. A published Management form with no available streams must show an "opening soon" state, never a broken empty picker.

## Bot protection (per PRD Decision 7)
Invisible stack only: honeypot + timing trap + per-IP rate limiting. No visible CAPTCHA/challenge widget. **Fail open with a flag** — if a check is ambiguous, accept the submission tagged `unverified_review`, never drop it. Tune the timing trap generously; never risk losing a real submission, even in a demo. Rate-limit the anonymous media upload endpoint (Cloudinary quota protection).

## Media rules
- All uploads are signed; the SERVER decides delivery type by purpose, never the browser. Public: gallery, news, achievements, testimonials, faculty, specialization images, leadership photos, popup banner, downloads. Private (staff-only, short-lived signed view links): admission documents.
- Public images are served through a resizing transformation (strips GPS metadata, protects quota).
- Docs: PDF/JPEG/PNG only, 8 MB browser cap.
- All Cloudinary folders are namespaced `relentlesslab/*`. Never introduce a folder path that doesn't carry this prefix.

## Visual work — how design decisions get judged
- **Never run browser automation to iterate toward a visual outcome.** No screenshot-diffing loops, no "keep adjusting until it looks right" automated cycles, no self-judging of visual output.
- **I judge all visual results myself.** If you want feedback on a layout, color choice, or component before continuing, ask — don't guess-and-check against your own rendering.
- Screenshots for *my* review are fine when useful; automated visual iteration against your own judgment is not.
- Build to `demo_design_system.md`'s direction once, present it, and wait for feedback rather than repeatedly refining unprompted.

## Config that must stay as env vars (never hardcode)
- `RESEND_FROM` — points at the Resend onboarding domain for this demo (no verified sending domain exists; there is no real domain to verify). Never hardcode a from-address regardless.
- `OFFICE_NOTIFICATION_EMAIL` — points at a demo address, never a real institutional one.
- All Supabase/Cloudinary/Resend keys live in env, never in the repo.

## Working style
- Build only what the current prompt asks. Do not scaffold ahead or add "nice to have" features unprompted.
- For schema/policy changes, output the full SQL migration in your reply (not just a file) so I can review and run it myself.
- Prefer showing me actual output/policies over summarizing what you did.
- End substantial changes by confirming `npm run build` passes.
- Before considering a task done, re-run a grep for the real institution's name/place/people if the change touched any content file — see the isolation rule above.

## Dates & language
English-only. Gregorian dates. No bilingual fields, no Bikram Sambat. Timestamps stored timezone-aware, displayed in Nepal time (UTC+05:45).