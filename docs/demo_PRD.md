# Demo PRD — Relentless Lab School & College Website

**Product Requirements Document & System Logic Map**
Riverside-7, Lakeview Municipality

Prepared as the authoritative build reference for the Relentless Lab demonstration platform. This document describes a **fictional institution**. It is a working engineering spec, not marketing copy — the architecture, data model, and security model it describes are real and implemented.

**Revision 1 (demo).** Derived from a production build for a real institutional client, with all identifying content replaced. This revision reflects the system **as actually built**, not as originally planned: the three-role model, the leadership-messages CMS, programme specializations, and the announcement popup are all written here as specification rather than as deviations from an earlier draft.

---

## How to Read This Document

**Part I (Sections 1–7)** describes what the system is, who may do what, and why each significant decision was made.

**Part II (Sections 8–10)** specifies the data model, the security model, and the shared infrastructure that governs every page.

**Part III (Sections 11–30)** breaks down every page and endpoint using a consistent five-part structure: route and visibility, user experience, frontend behaviour, backend behaviour, and security constraints.

**Section 33** records the demo-specific notes — which values are placeholders, and what a real deployment would need to decide.

Decisions taken once and applied in many places are stated once, in Section 6, and referenced rather than re-argued on each page. The operating rules that govern how the code is built live in `CLAUDE.md` at the repository root; this document is the spec, that file is the working discipline, and the two are deliberately kept separate so they do not drift.

---

# PART I — FOUNDATIONS

## 1. Purpose and Scope

Relentless Lab School & College is a combined secondary, +2, and Bachelor-level institution (founded 2061 B.S. / 2004 A.D., motto "Curiosity, Discipline, Purpose"). This system is its complete web presence, with two jobs:

1. **Present the institution well.** A prospective student or parent should form an accurate, favourable impression — programmes, faculty, facilities, achievements, and student voices — on a site that loads fast and looks current on a phone.

2. **Convert visitors into applicants.** The admission enquiry forms are the site's primary conversion action, and every design decision that touches them is settled in their favour: the institution should never lose a lead to friction or a technical failure. Where that principle conflicts with tidiness — for example, whether to reject a submission that fails an automated check — this document chooses the lead, and says so explicitly.

Unlike a civic accountability system, this site holds no public record that must be protected from its own operators. Its content is promotional, its submissions are private leads reviewed by staff, and nothing a visitor submits ever appears publicly or triggers an automated public action. This materially simplifies the security model (Section 9).

### 1.1 In Scope

Public marketing site with: homepage · programme pages with editable faculty and specialization content · about/leadership/executive-board pages · admission procedure · scholarships · learning process · student's voice (testimonials) · achievements · gallery · news/events/notices · downloads/resources (PDFs) · contact · admission enquiry forms with file upload and a staff-reviewed submission pipeline · a dismissible announcement popup · a complete staff administration area (CMS).

### 1.2 Explicitly Out of Scope

Public user accounts of any kind · applicant login or application-status tracking · online payment · SMS · document issuance · online examination or results lookup · a student/parent portal · a learning-management system · integration with any external registry · a mobile application · multilingual content (the site is English-only, per Decision 3).

Any future interactive service that needs public accounts — programme registration, a student portal, a complaints channel — will be built as a separate application on a subdomain (for example `portal.relentlesslab.edu.np`) and linked from this site with a button. It will not share this codebase (Decision 1). This is a deliberate architectural boundary, not a deferral.

### 1.3 Expected Scale

A single institution. Content volume is in the low hundreds of rows per table. Admission submissions arrive in bursts during admission season and are otherwise light. Concurrent visitors are in the tens, spiking around results and admission announcements. Several decisions here are correct at this scale and would be wrong at a multi-campus or national scale; each is marked with the condition under which it should be revisited.

---

## 2. Roles and Permissions

**Three roles.**

| Role | Who | How Assigned |
|---|---|---|
| Guest | Any visitor, never signed in | Default and only state for the public |
| Admin | Staff managing content, admissions, and settings | Only by an Owner, through the Users page |
| Owner | The account custodian — the only role that may create or deactivate staff accounts | Seeded directly for the first account; transferable by editing a profile row |

There is **no self-signup anywhere in this system**. A Guest has no account and no path to obtain one. Every staff account is created by an Owner. This is the single most important access fact in the build: role assignment is the only door to power, and that door is held by exactly one tier.

### 2.1 Why Three Roles, Not Two

The original architecture for this system specified two roles (Guest, Admin) with every Admin able to create other Admins, and noted that a future tier would be "a new enum value plus a few policy branches, not a rewrite" because `role` was stored as an enum rather than a boolean.

That prediction was tested and held. The third tier was added at the cost of one enum value, one `SECURITY DEFINER` function, and a handful of policy branches — no refactor, no migration of existing rows, no change to any content module.

The reason for adding it: **a door held by everyone who walked through it is not held at all.** Under a flat model, any Admin — including a temporary staff member added for one admission season — can mint further Admins indefinitely, and no one can revoke that capability without revoking their content access too. Separating account creation from content management means the institution can hand out day-to-day CMS access freely while the ability to grant access stays with one accountable person.

Ownership is stored in the same `role` enum, not hardcoded to a user id, so it is transferable: an Owner can promote a successor and step down by editing profile rows.

### 2.2 What Each Role May Do

**Guest** may read all published public content and may submit the public forms — admission enquiries and the contact message. A Guest submits through the server, never directly to the database (Section 9), and holds no credentials of any kind.

**Admin** may do everything a Guest may do, plus: manage all content across every module (news, gallery, programmes, specializations, faculty, achievements, testimonials, scholarships, downloads, leadership messages, homepage statistics, announcement popup), configure admission forms and their toggles, manage the dynamic Management stream list, read and progress admission submissions and contact messages, and edit site settings. An Admin **may not** reach the Users page and cannot create, deactivate, or alter any staff account, including their own role.

**Owner** may do everything an Admin may do, plus create staff accounts, deactivate and reactivate them, and change roles. An Owner cannot deactivate their own account or remove their own owner status — the system will not let the institution lock itself out of its own administration.

Because enforcement reads the role live from the database (Section 9.2), any role change or deactivation takes effect on the account's very next action.

### 2.3 Deactivation, Not Deletion, of Accounts

A staff account may be deactivated by an Owner. A deactivated account cannot sign in and cannot write. It is not destroyed, and deactivation is reversible.

---

## 3. The Enforcement Model

This is the most important technical concept in the document, and it is stated once here rather than repeated on every page.

**The public can read the database, but can never write to it directly. Every public write goes through the server.**

Because Guests have no account, no session, and no database credentials, the only key their browser could ever hold is the public (anonymous) key — and in this system that key is granted read access to published content and nothing else. It cannot insert, update, or delete any row in any table.

Every public submission — an admission enquiry, a contact message — is therefore sent to a Next.js Server Action / route handler that runs on the server, holds the privileged service key (which never reaches the browser), performs the bot-protection checks (Section 10.4), and only then writes the row. **There is exactly one write path into public-submitted data, and it is on the server, behind the checks.**

Three layers exist, and the meaning of "authoritative" is precise:

- **Layer 1 — Middleware.** Runs before admin pages load. Confirms a valid, active staff session exists and redirects anyone without one to `/login`. It gates exactly `/admin/:path*` and `/account/:path*` and nothing else; public pages are open to all. Middleware checks session only, not role (Section 9.2).

- **Layer 2 — Admin layout & live role check.** The `/admin` layout confirms the session belongs to an active Admin **or** Owner, reading the role live from the `profiles` table, and redirects otherwise. The Users route additionally confirms Owner. The public site never shows admin controls to a Guest.

- **Layer 3 — Row Level Security (RLS) in PostgreSQL.** Every table carries policies. The public role may `SELECT` only published rows of public content tables, and may write nothing, anywhere. Staff writes are permitted by policy, scoped by role. These policies run inside the database, beneath the website, and cannot be bypassed by inspecting the site in a browser.

The practical consequence that governs the whole build: **hiding a control is never a security measure.** A restriction exists only if a database policy enforces it. And the reason the public submission forms are safe is not that the browser is polite — it is that the anonymous key cannot write, so the server route is the only door, and the bot checks sit in that doorway.

> **Contrast worth recording for maintainers.** In an account-based system, signed-in users hold tokens and can hit the database directly, so a website-side bot check is worthless and RLS must do everything. Here the opposite holds: there are no public accounts, the anonymous key is read-only, and so a server-side bot check is genuine, un-bypassable protection. Do not "simplify" this later by letting the browser insert submissions with the anon key — that would reintroduce a direct write path and render every bot check decorative.

---

## 4. Language and Dates

The site is English-only (Decision 3). There is no language toggle, no parallel-field storage, and no machine translation anywhere. Content is authored once, in English.

All timestamps are stored timezone-aware and rendered in Nepal Standard Time (UTC+05:45). The 45-minute offset is not cosmetic: naive handling shows the wrong day for anything recorded between 18:15 and midnight local time. All displayed dates use the Gregorian calendar (Decision 3) — there is no Bikram Sambat rendering in this build.

### 4.1 Typeface

The site specifies a clean, modern typeface with a well-defined display/body pairing chosen during design. Because content is English-only, full Devanagari coverage is not a hard requirement — but the institution's name and occasional proper nouns may appear in Nepali script within images or copy, so a fallback with Devanagari coverage (for example Noto Sans Devanagari) is included to avoid empty boxes where such text appears.

---

## 5. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Application framework | Next.js 16 (App Router) + TypeScript | Server-rendered; public writes via Server Actions / route handlers |
| UI | React 19 + Tailwind CSS v4 | Current major versions |
| Database & authentication | Supabase (PostgreSQL) | RLS enforces the read-only-public rule; auth is for staff only |
| Media storage & delivery | Cloudinary | Two delivery modes — see Decision 6 |
| Transactional email | Resend | From-address held in `RESEND_FROM`, never hardcoded |
| Bot protection | Honeypot + timing trap + per-IP rate limiting | No third-party challenge widget — see Decision 7 |
| Maps | Static Google Maps embed | Find-us only; low stakes |
| Hosting | Vercel | |
| Source control | GitHub, private repository | Handles applicant PII |

---

## 6. Decisions and Rationale

Every decision below is applied throughout the document and not re-argued on the pages it affects.

**Decision 1 — No public accounts.** Any future interactive portal is a separate subdomain application. This build has three roles (Guest, Admin, Owner) and no self-signup. The entire account subsystem a resident-facing service would need — signup, email verification, public session handling — is absent, because nothing a visitor does here requires an identity. Keeping the two apart prevents a marketing site and an account-holding service from sharing a codebase and a blast radius.

**Decision 2 — Email is sent through Resend.** Supabase's default sender is capped and delivers only to pre-authorised addresses; relying on it would let staff password resets and office notifications fail silently. Resend's free tier (3,000/month, 100/day) is comfortably sufficient. The from-address lives in the `RESEND_FROM` environment variable and the office recipient in `OFFICE_NOTIFICATION_EMAIL`, so neither is a code change.

**Decision 3 — The site is English-only, Gregorian dates.** Parallel bilingual storage doubles authoring effort for content that changes constantly; it is not justified here. Every text field is single, not paired.

**Decision 4 — Three admission forms, modelled as rows; fields fixed in code; per-form open/close.** The institution admits at two levels (+2 and Bachelor) across programmes whose fields differ. Each admission form is a row in an `admission_forms` table carrying its own publish toggle, upload-enabled toggle, editable heading/description, and optional (informational) deadline. The form's actual fields are fixed in code, keyed by the form's id — there is no dynamic form-builder, which would be high-effort, high-risk flexibility the institution does not need.

The three seeded forms are **+2 Management**, **+2 Law**, and **BBS**. Law is a separate form from Management even though the two open in the same admission season — because Law's fields differ (its Lakeview Institute of Legal Studies partnership, its distinct course structure) and because separating them lets Law close early when its limited seats fill without disturbing Management. A one-click "open/close +2 admissions" convenience toggles Management and Law together while each remains independently reachable.

**Decision 5 — Management streams are an admin-managed list; retire, never delete.** The +2 Management form asks the applicant which stream they want (Business Studies, Computer Science, Hotel Management, Travel & Tourism, and so on), and this list changes year to year. The field ("which stream?") is fixed in code; its options are data the Admin edits.

Removing a stream means **retiring** it, not deleting it: an `is_available` flag hides it from the applicant picker immediately, while every past submission keeps its stream label intact (stored as text) and remains filterable by it. Hard-deleting a stream would silently rewrite the meaning of applications already made under it.

The Management stream list ships empty. The system guards against a published-but-empty Management form (Section 21.1): rather than render a broken empty picker, it shows an "admissions opening soon" state and warns the Admin.

**Decision 6 — All uploads are signed; delivery type (public or private) is decided by the server, per purpose.** Signing an upload controls who may put a file into the account; delivery type controls who may look at it once there. These are independent. Every upload is signed. The server maps each upload purpose to a fixed configuration (folder, formats, size limit, delivery type) — the browser cannot influence it.

| Content | Delivery | Why |
|---|---|---|
| Gallery photos, news images, achievement images, testimonial photos, faculty and specialization images, leadership photos, popup banner | Public | Intended for public view |
| Admission submission documents (marksheets, citizenship, photos) | **Private** | Personally identifying material; admin-only |
| Downloads (results, routines, forms as PDFs) | Public | Intended for public download |

Public images are served through a resizing transformation, not as originals — which strips embedded GPS metadata from phone photos and protects the media quota. Private documents are viewable only through a short-lived signed link generated at the moment of viewing, issued only to signed-in staff (Section 10.3).

**Decision 7 — Bot protection is a lightweight, invisible stack: honeypot + timing trap + per-IP rate limiting.** No challenge widget. The entire cost of a bot getting through is one junk row in an admin-reviewed pipeline — nothing a visitor submits ever appears publicly or triggers an automated action. The bar is therefore "keep the inbox usable without ever risking a real lead," not "stop every bot."

- **Honeypot** — a decoy field hidden from people, filled by naive bots; a filled honeypot is rejected silently. Named and marked `autocomplete="off"` so password managers and autofill don't populate it and flag a real person.
- **Timing trap** — submissions arriving implausibly fast (under a couple of seconds from render) are rejected. The threshold is set generously — the institution's explicit priority is never to lose a lead, so this trap catches only the obviously automated.
- **Per-IP rate limiting** — caps how much any single source can push through, and is the only one of the three that also protects the anonymous upload endpoint (Section 10.3) from being used to burn the Cloudinary quota. This one is load-bearing; the other two are cheap force-multipliers on top of it.

**Decision 7a — Fail-open with a flag.** If a check is ambiguous, the submission is accepted and tagged `unverified_review` rather than dropped, so the worst case for a real applicant is a two-second dismissal by staff, never a silently lost lead.

**Decision 8 — Admission submissions are a staff-reviewed pipeline with a triage status and an office email on arrival.** Each submission carries a status advancing **New → Reviewed → Contacted → Enrolled → Archived** (with Archived reachable at any point), so the admin list is a working pipeline rather than an undifferentiated inbox. Every new submission emails the office via Resend. Each submission is given a readable reference number of the form `{FORM}-{YEAR}-{sequence}` (for example `MGMT-2026-00042`) generated by a database counter that never reissues a number, so an applicant can be told a reference that means something over the phone.

**Decision 9 — Programme structure is three levels deep: programme → specialization → faculty.** A programme (for example +2 Management) may carry specializations (Business Studies, Computer Science) each with its own public detail page, description, cover image, and faculty roster. Faculty turns over constantly, so both programme-level and specialization-level rosters are modelled as editable rows an Admin manages without a developer. Subject/curriculum tables are set by the examination board and change rarely; they live as structured content within the programme body and are edited when the syllabus actually changes.

Specialization faculty is a **separate table** with the same shape as programme faculty, rather than one table with a nullable parent foreign key. The duplication is deliberate: it keeps each roster's RLS policy simple and independently reasoned, at the cost of one extra table. At this scale that trade is correct; at a scale where a third roster level appeared, it would not be.

**Decision 10 — Static-in-code pages for stable prose; CMS for everything that updates. The dividing line is rate of change, not importance.**

The About page is split across that line rather than sitting on one side of it:

- **Static in code:** institutional history and vision, the Executive Board roster, the Learning Process, the Admission Procedure prose, Contact details, and the Privacy page. These change on the order of years.
- **CMS-managed:** the leadership messages (Principal's and Chairman's messages). These are signed, personal, and rewritten whenever leadership changes or a new session opens — and they appear in two places (homepage preview and About page). Two hand-written copies would drift the first time a principal revises their message.

This is the correct application of the rule, not an exception to it: the Executive Board is a list of names that turns over slowly; a principal's message is authored prose that turns over often.

**Decision 11 — A backup strategy is required before any real deployment.** The free database tier includes no automated backups and pauses a project after roughly a week of inactivity. For a site holding real admission leads during season, neither is acceptable. See Section 33 for the demo's position on this.

**Decision 12 — The announcement popup is a single image, not a builder.** The institution needs to announce admission openings, result publications, and events with more prominence than a news post. The temptation is a rich popup builder with text, layout, and styling controls. This build deliberately refuses that: the popup is **one image** the Admin uploads, with an optional click-through link and alt text.

The reasoning is that an institution already produces its announcements as designed graphics — the notice exists as an image before it reaches the website. A builder would ask staff to rebuild that graphic in an inferior editor. Uploading the finished artwork is both less work and a better result.

The popup ships inactive, is dismissible by button, backdrop click, or Escape, and stays dismissed for three days. **Dismissal is keyed to the specific banner's Cloudinary public ID, not to a bare timestamp** — so when the institution uploads a new announcement, visitors who dismissed the previous one see the new one immediately, rather than waiting out a timer set by unrelated content.

---

## 7. What This System Deliberately Does Not Do

- It does not create public accounts, log applicants in, or let them track an application. A future portal does that, separately (Decision 1).
- It does not take payment.
- It does not issue documents, admit letters, or results. An applicant applies here and is contacted by the office.
- It does not send SMS. Email only.
- It does not verify that a submitted document is genuine.
- It does not publish anything a visitor submits. All submissions are private, staff-reviewed leads.
- It does not guarantee that every automated bot is stopped (Decision 7) — it guarantees that a real applicant is never turned away, and that bot noise is bounded and reviewed.

---

# PART II — SYSTEM ARCHITECTURE

## 8. Data Model

Twenty tables and a small settings store. Every table has `created_at`; editable tables also have `updated_at`, refreshed by the database, not the application.

### 8.1 Accounts

**`profiles`** — one row per staff account. There is no signup trigger on `auth.users`, because there is no public signup. The first row is seeded by hand (Section 9.2); every later row is created from the Users page by an Owner.

| Field | Notes |
|---|---|
| `id` | uuid, references `auth.users(id)` on delete cascade |
| `email` | For staff-page display and login identity |
| `full_name` | Editable by the account holder |
| `role` | Enum: `admin` \| `owner`. Default `admin` |
| `is_active` | Defaults true. False blocks sign-in and all writes |
| `created_at`, `updated_at` | `updated_at` maintained by a database trigger |

### 8.2 Public Content

**`news_categories`** — `name`, `display_order`.

**`posts`** — `title`, `slug`, `type` (news / event / notice), `excerpt`, `body`, `cover_image`, `category_id`, `is_published`, `published_at`, `created_by`. One table serves news, events, and notices, distinguished by `type` and filterable. `slug` stored explicitly for the web address.

**`gallery_albums`** — `slug`, `title`, `cover_photo`, `display_order`, optional `event_date`.

**`gallery_photos`** — `album_id`, `photo_file`, `caption`, `display_order`.

**`achievements`** — `title`, `description`, `image`, `achieved_on`, `display_order`, `is_published`.

**`testimonials`** — `student_name`, `programme`, `quote`, `photo`, `display_order`, `is_published`.

**`scholarships`** — `title`, `description`, `criteria`, `display_order`, `is_published`.

**`downloads`** — `title`, `description`, `file`, `category` (Result / Routine / Form / Notice), `display_order`, `is_published`, `published_at`. Public delivery.

**`leadership_messages`** — `name`, `title`, `photo`, `excerpt`, `full_message` (markdown), `display_order`, `is_published`, `created_by`. Drives both the homepage leadership block and the About page's leadership section (Decision 10).

**`programmes`** — `slug`, `title`, `level` (Secondary / +2 / Bachelor), `intro`, `body`, `is_published`, `display_order`.

**`programme_faculty`** — `programme_id`, `name`, `qualification`, `photo` (optional), `display_order`.

**`programme_specializations`** — `programme_id`, `title`, `slug` (unique within parent), `description`, `image`, `display_order`, `is_published`. Sub-programmes with their own public detail page (Decision 9).

**`specialization_faculty`** — `specialization_id`, `name`, `qualification`, `photo` (optional), `display_order`. Parallel roster to `programme_faculty` (Decision 9).

### 8.3 Admissions

**`admission_forms`** — `id` (fixed text key: `plus_two_management`, `plus_two_law`, `bbs`), `title`, `description`, `is_published`, `upload_enabled`, `deadline` (nullable, informational), `display_order`. Toggles and presentation only; fields fixed in code per id (Decision 4). All three ship unpublished.

**`management_streams`** — `id`, `name`, `display_order`, `is_available`. Admin-managed, ships empty (Decision 5). `is_available = false` retires a stream without deleting it. Only the +2 Management form reads this table.

**`admission_reference_counters`** — backs the never-reissued reference number of Decision 8. One counter row per form per year; incremented inside the same transaction that writes the submission, so a number is never handed out twice even under concurrent submissions.

**`admission_submissions`** —

| Field | Notes |
|---|---|
| `reference` | Readable reference, database counter, never reissued (Decision 8) |
| `form_id` | Which admission form |
| `full_name`, `email`, `phone` | Promoted to columns for a readable admin pipeline |
| `stream` | Chosen Management stream **as text**, so it survives that stream being retired. Null for Law/BBS |
| `payload` | The remaining form answers, shape fixed per form in code |
| `document_file` | Optional; private delivery |
| `status` | New / Reviewed / Contacted / Enrolled / Archived (Decision 8) |
| `verification` | `verified` or `unverified_review` — the fail-open flag (Decision 7a) |
| `created_at` | Submission time (NPT) |

**`contact_messages`** — `name`, `email`, `message`, `status` (New / Read / Archived), `created_at`. Same public-write path and bot protection as admissions.

### 8.4 Settings

**`settings`** — a small key/value store with a **fixed key set defined by migration**. `INSERT` and `DELETE` are forbidden by policy; adding a key requires a migration. This is deliberate — a free-form settings table becomes an undocumented second data model within a year.

The eight keys:

| Key | Purpose |
|---|---|
| `stat_teachers`, `stat_students`, `stat_years` | Homepage animated statistics |
| `office_notification_email` | Recipient for new-submission alerts. **Withheld from the anonymous SELECT allowlist** |
| `popup_image` | Cloudinary public ID of the announcement banner |
| `popup_is_active` | Ships `false` |
| `popup_link_url` | Optional click-through target |
| `popup_alt_text` | Accessibility text for the banner |

### 8.5 What There Is No Table For

There is no public-facing counter, dashboard, tracker, or aggregate view — this is a marketing site, not an accountability system. There is no status-history table for submissions: a lead pipeline is adequately served by `status` plus `updated_at`. A full append-only history is a clean later addition if the office ever wants an audit trail; it is not required now.

---

## 9. Security Model

The model is deliberately simple because the risk surface is small: read-only public, server-mediated writes, staff-only everything else.

### 9.1 The Role Functions

Every "may this staff member do this?" check routes through one of two dedicated `SECURITY DEFINER` functions, both declared `stable` with `set search_path = ''`:

- **`current_user_is_active_admin()`** — reads the current user's row from `profiles` and returns true if `is_active = true` and `role` is **either** `admin` or `owner`. Every content, admissions, and settings policy calls this.
- **`current_user_is_owner()`** — returns true only if `is_active = true` and `role = 'owner'`. Only the `profiles` management policies call this.

They run with elevated rights so they are not themselves subject to the policies they inform — which is what prevents an infinite-recursion loop when a policy on `profiles` needs to ask `profiles` about the current user's role. Written once, used everywhere. Both read live from the table, never from the sign-in token.

### 9.2 Staff Authentication & the Live Role Check

- **No signup, anywhere.** There is no signup route and no trigger creating `profiles` from `auth.users`. The `profiles` table has no `INSERT` policy for anon or authenticated users and no `DELETE` policy for anyone.

- **The first account is seeded by hand.** One `auth.users` record is created in the Supabase dashboard, and a matching `profiles` row is inserted by SQL with `role = 'owner'`, `is_active = true`. This is done manually because no existing Owner exists to authorise it. All later accounts are added from the Users page.

- **The live role check is load-bearing.** Middleware confirms only that a session exists (gating `/admin/:path*` and `/account/:path*`). The `/admin` layout then confirms `current_user_is_active_admin()` by reading `profiles` live on every request, never trusting the role embedded in the session/JWT. The `/admin/users` route additionally confirms `current_user_is_owner()`. This is what makes a deactivation or demotion take effect on the account's next action rather than up to an hour later when the token would refresh.

- **`profiles` policies.** SELECT: a user may read their own row; an active admin or owner may read all. UPDATE: a user may change only their own `full_name` — never their own `role`, `is_active`, `email`, or `id`. The edit-anyone policy (roles and active status) is written against `current_user_is_owner()`.

### 9.3 The Read-Only-Public Rule

The anonymous role is granted `SELECT` on published rows of public content tables and nothing else — no `INSERT`, `UPDATE`, or `DELETE` on any table, ever. Unpublished drafts are excluded by policy, not hidden by the page. On the `settings` table, the anonymous grant is an explicit key allowlist that withholds `office_notification_email`. This single rule is what makes the server the only write door for the public.

### 9.4 Server-Mediated Submissions

Admission enquiries and contact messages are written by a server route holding the service key, which: runs the bot-protection checks (Section 10.4); on an ambiguous check accepts the row with `verification = unverified_review` rather than dropping it; validates the answers against the form's code-defined schema; sets `reference`, `status`, `verification`, and timestamps itself, never accepting them from the browser; and records the chosen stream as **text** (not a foreign key), so a later stream retirement cannot orphan the row. The browser never writes directly.

### 9.5 Staff Writes

Admin and Owner policies permit full management of content, specializations, faculty rosters, leadership messages, admissions configuration, streams, submissions, and settings. Content rows may be deleted. Admission submissions and contact messages should be archived rather than deleted as an office practice — a workflow convention, not a database-enforced prohibition.

The one hard database rule in the admissions area is **retire-not-delete on streams** (Decision 5): the delete path on `management_streams` is not exposed, and retirement is a flag flip, so a stream's past applications are never silently rewritten.

### 9.6 The Service-Role Key

The privileged service-role key lives only in `lib/supabase/service.ts` — which begins with `import 'server-only'`, so any attempt to import it into client code becomes a **build error** rather than a silent browser leak — and in server routes. It bypasses all RLS and is used only after bot and permission checks. It is never exposed to the browser, never logged, and never committed (it exists only in environment variables).

### 9.7 Media Authorisation

Upload signing maps a stated purpose to a fixed server-side configuration — the browser cannot request that a private admission document be stored as public. The admission-document upload purpose is the one purpose open to anonymous callers and is rate-limited per IP; every public-content upload purpose additionally requires an active staff session. Private-file viewing names a **submission**, not a file, and is restricted to staff.

---

## 10. Shared Infrastructure

### 10.1 Session Handling

Middleware runs before every `/admin/:path*` and `/account/:path*` request, refreshes an expiring staff session, and redirects an unauthenticated or deactivated visitor to `/login`. It does not gate public pages and does not check role.

### 10.2 Email Link Handling

A route at `/auth/confirm` receives the links the system emails — staff password reset and staff invite/confirmation — validates the single-use token, establishes a session, and forwards onward. The email templates must point here rather than at their defaults. There is no signup-confirmation flow, because there is no public signup.

### 10.3 Media Handling

**Upload authorisation — `/api/media/sign-upload`.** The browser states a **purpose** (gallery photo, news image, achievement image, testimonial photo, faculty photo, specialization image, leadership photo, popup banner, download file, admission document) and nothing else. The server confirms the caller may use that purpose — public-content purposes require an active staff session; the admission-document purpose is the one purpose open to anonymous callers and is rate-limited per IP — then maps the purpose to a fixed folder, format allow-list, size limit, and delivery type, signs that, and returns it. The browser never names the folder, filename, or delivery type.

**Viewing authorisation — `/api/media/sign-view`.** Staff-only. The request names a **submission**; the server reads that submission under the normal rules and, if it exists, returns a short-lived link for the document recorded on it. The browser never names a file directly.

Uploads go browser-to-Cloudinary directly, not through the application server. Accepted document types are PDF and JPEG/PNG only, capped at 8 MB in the browser. Orphaned files (uploaded, then the form abandoned) are swept by a periodic reconciliation.

All Cloudinary folders are namespaced under `relentlesslab/*`.

### 10.4 Bot Protection

Applied on every public write path — admission submissions, the contact form, and the anonymous upload endpoint — as the invisible stack of Decision 7: honeypot, timing trap (generously tuned), and per-IP rate limiting. Fail-open with a flag (Decision 7a). No visible challenge to a real person.

### 10.5 Content Freshness

Public pages are pre-rendered and cached for speed. Every staff action that changes public content must explicitly refresh the affected pages — publishing a news post refreshes the news list and the homepage; adding a gallery album refreshes the gallery and homepage; editing a leadership message refreshes both the homepage and About. Admin pages render fresh per request and need no such handling.

### 10.6 Link Previews & Machine Readability

Every public page carries Open Graph tags (title, description, image) generated from its own content, falling back to the institution's logo and a standard description — so a shared link renders as an official-looking card rather than a bare URL.

The site also serves an **`/llms.txt`** route: a structured, plain-text summary of the institution and its key pages, built from `NEXT_PUBLIC_SITE_URL`, intended for language models and AI-driven search that increasingly mediate how prospective students find institutions.

### 10.7 Data Export

Every staff content list page carries an export-to-spreadsheet (CSV) action producing a file from what is on screen. Since these pages already load their rows into the browser, export is a client-side operation with no new endpoint. Wired into: news, gallery, programmes, achievements, leadership messages, testimonials, scholarships, downloads, and admission submissions.

### 10.8 Email Sending Configuration

The from-address is the environment variable `RESEND_FROM`; the office notification recipient is `OFFICE_NOTIFICATION_EMAIL`. Neither is hardcoded, so changing either is a configuration change rather than a deployment of new code.

### 10.9 Environments & Configuration

- Secrets live only in environment variables — `.env.local` locally (git-ignored) and the host's environment settings at deploy time. `.env.example` (committed) lists the keys with empty values. Nothing sensitive is ever committed.
- The repository is private, because the system handles applicant PII. This is defence in depth, not a substitute for the security model.
- The spec and operating rules live in the repo: this document at `/docs/demo_PRD.md`, the design system at `/docs/demo_design_system.md`, and the build discipline at `/CLAUDE.md`.

---

# PART III — PAGES AND ENDPOINTS

Each entry follows the same five-part structure. Rules established in Parts I and II are not repeated.

## 11. Homepage — `/`

1. **Route & Visibility.** Public.
2. **Experience.** Institutional hero and welcome; a leadership block presenting the published leadership messages as an editor-ordered set of cards, each expanding to the full message in a dialog; a "Features" block (Computer Lab, Cafeteria, Sports, Scholarships, Classrooms, Library, Transportation); animated statistics (teachers, students, years) drawn from `settings`; a programmes overview; a "News & Events" feed; a "Student's Voice" preview; a prominent Apply Now call-to-action plus a persistent sticky apply CTA; find-us map and contact block. If an announcement popup is active, it appears over the page on arrival (Decision 12).
3. **Frontend.** Navigation and CTAs; stats animate on scroll; leadership cards open a dialog rather than navigating away; the popup manages its own three-day, per-banner dismissal state in `localStorage`. No forms except the CTA link.
4. **Backend.** Reads: latest published posts; active programmes; published testimonials (a few); published leadership messages; the three statistics and the four popup keys from `settings`.
5. **Security.** All reads public, published rows only. `office_notification_email` is outside the anonymous settings allowlist and is never read here.

## 12. About Us — `/about`

1. **Route & Visibility.** Public.
2. **Experience.** History and vision (static prose), the leadership messages section (CMS-driven, expandable), and the Executive Board roster (static in code), with anchor links between them.
3. **Frontend.** Anchor navigation; leadership messages expand in place.
4. **Backend.** One count query against `leadership_messages` to decide whether the Leadership anchor link is shown at all, then one read of published leadership messages in display order. The Executive Board is a static array in the page component. This split is Decision 10 applied precisely: authored prose that changes often is CMS-managed; a name roster that changes rarely is not.
5. **Security.** Published rows only.

## 13. Programmes Index — `/programmes`

Public. Published programmes as cards (Secondary, +2 Management, +2 Law, BBS), each linking to detail. One read of published programmes in display order.

## 14. Programme Detail — `/programmes/[slug]`

1. **Route & Visibility.** Public. Published programmes only; anything else is not found.
2. **Experience.** Full programme page: introduction, curriculum/subject tables, activities, pedagogy, the programme-level faculty roster, and — where the programme has them — cards linking to its specializations. Where admissions for this programme are open, a contextual Apply link.
3. **Frontend.** Static rendering; specialization cards navigate to 14.1.
4. **Backend.** One read of the programme, one of its faculty rows, one of its published specializations, all in display order.
5. **Security.** Published rows only, at both programme and specialization level.

### 14.1 Specialization Detail — `/programmes/[slug]/[specialization]`

1. **Route & Visibility.** Public. The specialization must be published **and** belong to the programme named in the parent segment; a mismatch is not found.
2. **Experience.** The specialization's cover image, description body, and its own faculty roster. Breadcrumb back to the parent programme.
3. **Frontend.** Static rendering. Own Open Graph metadata generated from the specialization's title and image.
4. **Backend.** One read of the specialization scoped by parent programme slug, one of its faculty rows.
5. **Security.** Published rows only. The parent-scoping is enforced in the query, not merely in the URL.

## 15. Admission Procedure — `/admissions`

Public. The stable prose describing how admission works, alongside cards for each currently published admission form. If none is published, a clear "admissions are not currently open" state. One read of published `admission_forms`; the procedure prose is static.

### 15.1 Apply Index — `/apply`

1. **Route & Visibility.** Public.
2. **Experience.** A focused "which intake is open" landing page listing every currently published admission form with its heading, description, and deadline if set. This is where the site-wide Apply Now button and the sticky CTA point — separating "how admission works" (Section 15, prose-led) from "apply now" (this page, action-led), so a visitor who has already decided is not made to read the procedure again.
3. **Frontend.** Cards linking to each form.
4. **Backend.** One read of published `admission_forms` in display order.
5. **Security.** Published rows only.

## 16. Scholarships — `/scholarships`

Public. Published scholarship entries — title, description, criteria. One read in display order.

## 17. Learning Process — `/learning-process`

Public, static prose (Decision 10). No data access.

## 18. Student's Voice — `/students-voice`

Public. Published testimonials — student name, programme, quote, optional photo. One read in display order.

## 19. Achievements — `/achievements`

Public. Published achievements — title, description, image, date. One read.

## 20. Gallery — `/gallery` and Album — `/gallery/[slug]`

Public. Index: albums with cover, title, photo count. Album: a grid of photographs with optional captions, opening full-screen. Below-the-fold images lazy-load. Photographs served through a resizing transformation, stripping location metadata and protecting the quota (Decision 6).

## 21. News / Events / Notices — `/news` and Detail — `/news/[slug]`

Public. Published posts newest first, filterable by type and category, each with title, date, excerpt, cover image. Detail shows full body, optional cover, date, and a share action whose Open Graph tags make the shared link render as a card. Published rows only.

### 21.1 Admission Form — `/apply/[form]`

1. **Route & Visibility.** Public. Limited to the three fixed form ids; anything else is not found. An unpublished form shows a closed state rather than the fields.
2. **Experience.** The form's editable heading and description, then its code-fixed fields. For +2 Management, a stream picker rendered from `management_streams` showing only available streams. If upload is enabled, one document upload (PDF/JPEG/PNG, ≤8 MB); if disabled, no upload appears. On success, a reference number and confirmation the office will be in touch.

   **Guard for an empty Management stream list.** If the Management form is published but has no available streams, the form does not render an empty picker — it shows an "admissions opening soon" message, and the admin dashboard flags the condition (Decision 5).

3. **Frontend.** The invisible bot-protection stack is present (honeypot, render timestamp). If upload is enabled and a file is attached, the browser requests permission (Section 10.3) and uploads directly to Cloudinary, then submits the answers plus the file reference. Client-side validation is friendly and permissive — never block a real applicant over a formatting quibble.
4. **Backend.** The server route runs the bot checks (fail-open with flag), validates against the form's schema, records the chosen stream as text, draws a reference from the counter inside the same transaction as the insert, sets status/verification/timestamps, writes one submission row, and emails the office (Decision 8).
5. **Security.** No account required and none created. The browser cannot write directly; the document uses private delivery; the endpoint is rate-limited per IP.

## 22. Contact — `/contact`

Public. Address, phone numbers (tap-to-call), emails, social links, a find-us map, and a "Tell us what you think" message form. Same invisible bot-protection stack as admissions. The server route runs the checks, writes one `contact_messages` row, and emails the office. Browser cannot write directly; rate-limited per IP.

## 23. Downloads — `/downloads`

Public. Published downloadable resources (results, routines, forms, notices) grouped or filtered by category, each a titled link to the file. One read in display order. Public delivery.

## 24. Privacy — `/privacy`

Public, static prose (Decision 10). States what the site stores (admission enquiries and contact messages), that these are visible only to staff, that nothing submitted is published, that uploaded documents are stored privately, and how a person may request correction or removal.

## 25. Login — `/login`

1. **Route & Visibility.** Public; a signed-in staff member is redirected to `/admin`.
2. **Experience.** Email, password, submit; a password-reset link. A failed attempt shows an inline generic message ("Invalid email or password") without reloading — it does not reveal whether an email is registered.
3. **Frontend.** Submits to the server (a Server Action).
4. **Backend.** Signs the staff member in and redirects to `/admin`.
5. **Security.** There are no non-staff accounts to sign in. No profile is created here. Rate-limited.

## 26. Password Reset — `/reset-password` and `/reset-password/update`

Staff password recovery via Supabase's built-in flow; the emailed link lands at `/auth/confirm` (Section 10.2), which validates the single-use token, establishes a session, and forwards to the change page. Security rests on the single-use, time-limited token.

## 27. Admin Landing — `/admin`

1. **Route & Visibility.** Admin or Owner.
2. **Experience.** Links into every module: News, Gallery, Programmes, Leadership, Achievements, Testimonials, Scholarships, Downloads, Admissions, Submissions, Contact Messages, Settings, and — for an Owner only — Users. An attention summary: new submissions, unread contact messages, and any warning (for example, a published Management form with no available streams).
3. **Frontend.** No data changes here. The Users link is absent from the sidebar for a non-Owner.
4. **Backend.** Counts for the summary.
5. **Security.** The admin layout's live role check (Section 9.2) redirects any non-active staff member before the page renders. Every module below independently enforces its own database policies. Hiding the Users link is a convenience, not the enforcement — the route and the policies both check Owner independently.

## 28. Admin — Content Modules

News, Gallery, Programmes (with specializations and both faculty rosters), Leadership, Achievements, Testimonials, Scholarships, and Downloads share a structure and are described together. All are Admin-manageable.

- **News — `/admin/news`.** Create, edit, delete, publish/unpublish posts (type, category, excerpt, body, cover image, public delivery). Manage the category list. Every change refreshes the news list and homepage.
- **Gallery — `/admin/gallery`.** Albums with covers. Photos upload as a **multi-file sequential batch** with per-file progress and skip/continue on failure, so a partial failure never loses the whole batch. Captions and display order per photo.
- **Programmes — `/admin/programmes`.** Edit each programme's intro, body (curriculum/activity tables), and its faculty rows (add/edit/remove/reorder). Manage its specializations at `/admin/programmes/[id]/specializations` — each with its own title, slug, description, image, publish state, and its own faculty roster. Publish/unpublish and reorder at both levels.
- **Leadership — `/admin/leadership`.** Create, edit, delete, publish/unpublish leadership messages (name, title, photo, excerpt, full markdown message, display order). Every change refreshes both the homepage and About.
- **Achievements / Testimonials / Scholarships — `/admin/{...}`.** Standard create/edit/delete/publish with images where relevant (public delivery), and display order.
- **Downloads — `/admin/downloads`.** Upload files (public delivery), set title/description/category, publish/unpublish, reorder.

Each write records the acting user and refreshes affected public pages.

## 29. Admin — Admissions — `/admin/admissions`

1. **Route & Visibility.** Admin or Owner.
2. **Experience.** The three admission forms as manageable rows. For each: publish/unpublish, enable/disable upload, edit heading and description, set an optional (informational) deadline. A one-click **open/close +2 admissions** convenience toggles Management and Law together, while each stays independently reachable (so Law can close early — Decision 4). A Management streams panel: add a stream, reorder, and retire a stream (flag off — it leaves the picker but past submissions keep their label; no hard delete — Decision 5). The panel ships empty; a warning shows if the Management form is published with no available streams.
3. **Frontend.** Toggles and inline edits; retire is a visible, reversible flag.
4. **Backend.** Writes to `admission_forms` and `management_streams`; publishing refreshes the relevant public pages.
5. **Security.** Staff-only. The stream table exposes no delete path.

## 30. Admin — Submissions & Contact — `/admin/submissions`, `/admin/contact-messages`

1. **Route & Visibility.** Admin or Owner.
2. **Experience.** *Submissions:* every admission enquiry across the three forms, filterable by form, status, and stream, searchable by reference, exportable to CSV. Each shows applicant name/phone/email, the answers, the chosen stream, the private document link if present, the verification flag (an `unverified_review` row is obvious and dismissable in seconds — Decision 7a), and the triage status, which staff advance (New → Reviewed → Contacted → Enrolled → Archived). *Contact messages:* name, email, message, and status (New → Read → Archived), advanced inline.
3. **Frontend.** Document viewing follows Section 10.3 — name the submission, receive a short-lived link. Status changes are inline. The submissions stream filter is sourced from the **submission rows themselves**, not from `management_streams`, so a retired stream stays filterable in history (Decision 5).
4. **Backend.** One read of all submissions/messages (no ownership — these are staff-only leads). Status changes write `status` and `updated_at`.
5. **Security.** Staff-only. Private documents are reachable only through the staff-only sign-view path. Archiving rather than deleting is the office convention.

### 30.1 Admin — Settings & Users — `/admin/settings`, `/admin/users`

**Settings.** Admin or Owner. Edit homepage statistics (teachers, students, years), the office notification email address(es), and the four announcement-popup keys — banner image, active toggle, click-through URL, alt text (Decision 12). The key set is fixed by migration; the page edits values, never adds keys.

**Users.** **Owner only**, at both the route and the database layer. All staff accounts with name, email, role, active status, and creation date. Add a staff account (sending an invite/confirmation via Resend, landing at `/auth/confirm`), set its role, and deactivate/reactivate accounts. An Owner cannot deactivate their own account or remove their own owner status. This is the sole mechanism by which staff access is granted, and a role/active change takes effect on the affected account's next action.

### 30.2 My Account — `/account`

Any signed-in staff member edits their own name and changes their password (email is shown but not edited here). The database rule restricts every account to its own profile row and never to the `role` or `is_active` fields, which are reachable only through Users.

---

# PART IV — DEMO NOTES

## 33. Fictional-Institution Notes

**This is a demonstration platform.** Relentless Lab School & College does not exist. Every institutional detail — the name, the address, the founding year, the motto, the Executive Board roster, the leadership messages, the affiliating bodies (Lakeview National University, Lakeview Institute of Legal Studies), the phone numbers, the email addresses, and the map location — is invented for demonstration purposes.

The **architecture, data model, security model, and every page behaviour described in Parts I–III are real** and implemented as specified. This document describes a system that works; only the institution wearing it is fictional.

### 33.1 Demo Configuration

| Item | Demo value | A real deployment would |
|---|---|---|
| Indexing | `robots.txt` disallows all; `noindex` at the root layout | Permit indexing and generate a sitemap from published content |
| Seeded accounts | Owner: Bishal Basnet. Admin: Akriti Kafle | Seed one Owner by hand; the institution adds its own staff |
| Management streams | Ship empty, exactly as a real deployment does; the demo's streams are added through `/admin/admissions` after migrating, which keeps the migration set identical to a client build and demonstrates Decision 5 | Ship empty; the admission in-charge fills the list (Decision 5) |
| Homepage statistics | Filled with representative figures | Use the institution's actual counts |
| Admission forms | Field sets are representative | Confirm each form's exact fields with the admission office |
| Media | All imagery is stock, on an isolated Cloudinary account | Use the institution's own photography |
| Email | `RESEND_FROM` on the Resend onboarding domain; `OFFICE_NOTIFICATION_EMAIL` points to the developer | Verify a sending subdomain and point notifications at the real office |
| Backups | Not configured — the demo holds no data worth preserving | **Required before launch** (Decision 11): fund the paid tier for daily backups, or commit to a scheduled, tested export with a stated acceptable-loss window. An untested backup is not a backup |

### 33.2 Closing Note

This system is simpler than an accountability platform, and deliberately so — it holds no public record that must be defended against its own operators, so it carries none of that machinery. But it has one promise it must keep without exception: **the institution must never lose a real applicant to friction or to a technical failure.**

Every decision that touched a form was settled in that promise's favour — the invisible bot stack over a visible challenge, fail-open over fail-closed, a generous timing trap, permissive client validation, and a monitored notification path. A prospective student who fills the form should reach the office every time; a bot that slips through costs a staff member two seconds. That asymmetry is the whole design, and it is the right way round.

The second thing worth defending: the deliberate boundary that keeps this a marketing site and pushes any future account-holding service onto its own subdomain. It costs a little ambition now — no portal, no logins — and buys a great deal of safety and simplicity.