import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { NavHeroProvider } from '@/components/nav-hero-context';

// Shared public chrome (nav + footer). Every public page inherits this shell.
// NavHeroProvider lets a page with a hero tell the nav to start transparent;
// pages without one keep the nav solid from the top. The /admin layout is
// separate and intentionally untouched.
//
// No logo URLs are built here any more. The nav and footer both render the
// typographic <Wordmark/> (components/wordmark.tsx), so there is no image to
// fetch and nothing for this layout to pass down — the two Cloudinary public
// IDs it used to resolve (relentlesslab/logo1 and logo2) do not exist in this
// demo's media account and rendered as broken images.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavHeroProvider>
      <SiteNav />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </NavHeroProvider>
  );
}
