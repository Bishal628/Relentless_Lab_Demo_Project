import { SCHOOL_CONTACT } from '@/lib/contact-details';

// /llms.txt — a plain-text map of the site for language models, following the
// llms.txt convention (H1, blockquote summary, H2 sections of links).
//
// This is a route handler rather than a file in public/ so the links can be
// built from NEXT_PUBLIC_SITE_URL. A static file would have to hardcode a
// domain, which would be wrong on localhost and on preview deployments, and
// stale the moment the DNS cutover happens.
//
// Only top-level routes are listed. Individual programme and specialization
// slugs are editor-owned and can be renamed at any time, so enumerating them
// here would rot — the same reasoning the footer's programme links follow.

// No trailing slash: every path below starts with one, and '//about' would 404.
const BASE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

type PageLink = {
  title: string;
  path: string;
  description: string;
};

const KEY_PAGES: PageLink[] = [
  {
    title: 'Home',
    path: '/',
    description: 'overview of the institution and current admissions',
  },
  {
    title: 'About',
    path: '/about',
    description: 'history, vision, leadership, and the executive board',
  },
  {
    title: 'Programmes',
    path: '/programmes',
    description: 'Secondary, +2 Management, +2 Law, and BBS',
  },
  {
    title: 'Admissions',
    path: '/admissions',
    description: 'how the admission process works',
  },
  {
    title: 'Apply now',
    path: '/apply',
    description: 'currently open admission forms',
  },
  {
    title: 'Learning process',
    path: '/learning-process',
    description: 'field visits, clubs, publications',
  },
  {
    title: 'Scholarships',
    path: '/scholarships',
    description: 'available scholarships and eligibility',
  },
  {
    title: 'Achievements',
    path: '/achievements',
    description: 'student and institutional achievements',
  },
  {
    title: "Student's voice",
    path: '/students-voice',
    description: 'testimonials from current students',
  },
  {
    title: 'News & events',
    path: '/news',
    description: 'notices, news, and events',
  },
  {
    title: 'Gallery',
    path: '/gallery',
    description: 'photos from campus life and events',
  },
  {
    title: 'Contact',
    path: '/contact',
    description: 'address, phone, email, and a contact form',
  },
];

const OPTIONAL_PAGES: PageLink[] = [
  {
    title: 'Downloads',
    path: '/downloads',
    description: 'results, routines, and forms',
  },
  {
    title: 'Privacy',
    path: '/privacy',
    description: 'what the site stores and how to request changes',
  },
];

function renderLinks(pages: PageLink[]): string {
  return pages
    .map(
      ({ title, path, description }) =>
        `- [${title}](${BASE_URL}${path}): ${description}`,
    )
    .join('\n');
}

const BODY = `# Relentless Lab School & College

> Relentless Lab School & College is a Secondary, +2, and Bachelor's-level
> educational institution in Lakeview, Nepal, established in 2004 (2061 B.S.)
> under the motto "Curiosity, Discipline, Purpose". It offers Secondary
> education, +2 Management, +2 Law (in partnership with Lakeview Institute of
> Legal Studies), and BBS (Bachelor of Business Studies, affiliated to Lakeview
> National University).

Located in ${SCHOOL_CONTACT.address}.

## Key pages
${renderLinks(KEY_PAGES)}

## Optional
${renderLinks(OPTIONAL_PAGES)}
`;

// The content only changes when this file or the site URL does, so it is baked
// at build time and served from the CDN rather than invoking a function per
// crawl.
export const dynamic = 'force-static';

export function GET() {
  return new Response(BODY, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
