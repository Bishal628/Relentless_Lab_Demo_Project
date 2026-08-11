import type { MetadataRoute } from 'next';

// /robots.txt — disallow everything, for every crawler.
//
// This is a DEMONSTRATION platform for a fictional institution (PRD 33). It
// must never appear in a search result: a prospective student searching for a
// real school should not land on an invented one, and the demo must never
// compete for the terms a real client's site would want.
//
// Paired with `robots: { index: false, follow: false }` in the root layout
// metadata (app/layout.tsx). The two do different jobs and are both needed:
// robots.txt asks a crawler not to FETCH, the meta tag tells a crawler that did
// fetch (via an inbound link, a shared URL, or a bot that ignores robots.txt)
// not to INDEX. A disallowed-but-linked URL can still be indexed URL-only, so
// the meta tag is the one that actually keeps it out of the index.
//
// No `sitemap` key: this demo deliberately ships no sitemap route (PRD 10.6 —
// link previews and /llms.txt only). A real deployment would permit indexing
// and generate a sitemap from published content (PRD 33.1).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
