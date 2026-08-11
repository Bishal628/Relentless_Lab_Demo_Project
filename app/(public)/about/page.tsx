import type { Metadata } from 'next';
import { cloudinaryImage } from '@/lib/cloudinary-url';
import { createClient } from '@/lib/supabase/server';
import { Band } from '@/components/band';
import { Reveal } from '@/components/reveal';
import { LeadershipMessages } from '@/components/home/leadership-messages';

// About Us (PRD 12). History and vision, the leadership messages, and the
// Executive Board — with the anchor links PRD 12 asks for.
//
// The prose and the board are STATIC-IN-CODE (Decision 10): they are the
// institution's stable record, not something the office edits monthly. The
// leadership messages are the exception and are deliberately NOT rewritten here
// — see the section below.

const TITLE = 'About';
const DESCRIPTION =
  'Relentless Lab School & College, Lakeview — established in 2061 B.S. (2004 A.D.) under the motto "Curiosity, Discipline, Purpose". Our history, vision, and Executive Board.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    images: cloudinaryImage(
      process.env.CLOUDINARY_CLOUD_NAME ?? '',
      'relentlesslab/logo1',
      'c_pad,b_white,w_1200,h_630',
    ),
  },
};

// The Executive Board, grouped rather than run out as one 19-row table (which is
// what the old site did, and it reads as a spreadsheet someone pasted in). Four
// groups, each a card, each row a role and the people holding it.
//
// `role` is optional: the Advisors group would otherwise print the word
// "Advisors" as both its heading and its only row label.
type BoardGroup = {
  id: string;
  group: string;
  members: { role?: string; names: string[] }[];
};

const EXECUTIVE_BOARD: BoardGroup[] = [
  {
    id: 'leadership',
    group: 'Leadership',
    members: [
      { role: 'Chairperson', names: ['Padam Bahadur Rai'] },
      { role: 'Principals', names: ['Suresh Basnyat', 'Deepak Manandhar'] },
      { role: 'Vice Principal', names: ['Nabin Tiwari'] },
      { role: 'Coordinator', names: ['Sunita Adhikari'] },
    ],
  },
  {
    id: 'advisors',
    group: 'Advisors',
    members: [{ names: ['Krishna Prasad Ghimire', 'Bishnu Acharya'] }],
  },
  {
    id: 'academic',
    group: 'Academic & administration',
    members: [
      { role: 'Incharge / DI', names: ['Suraj Karki'] },
      { role: 'Class Incharge', names: ['Manisha Poudel'] },
      { role: 'Incharge', names: ['Kabita Bhattarai'] },
      { role: 'Librarian / Exam Incharge', names: ['Hari Prasad Neupane'] },
      { role: 'Librarian', names: ['Radha Sapkota'] },
    ],
  },
  {
    id: 'operations',
    group: 'Operations & support',
    members: [
      {
        role: 'Accountants',
        names: ['Prakash Chapagain', 'Anita Rimal', 'Sandip Regmi'],
      },
      { role: 'Front Desk Officer', names: ['Sabina Thapaliya'] },
      { role: 'Store / Adm. Incharge', names: ['Bikash Bista'] },
      {
        role: 'Supporting Staff',
        names: ['Laxmi Devkota', 'Gopal Bohara'],
      },
    ],
  },
];

export default async function AboutPage() {
  // ONE count, not a fetch: it decides only whether the "Leadership" anchor link
  // is offered. LeadershipMessages renders NOTHING when no row is published, and
  // an anchor link pointing at a section that is not on the page is worse than
  // no link. head:true returns the count with no row data.
  const supabase = await createClient();
  const { count } = await supabase
    .from('leadership_messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true);

  const hasLeadership = (count ?? 0) > 0;

  return (
    <>
      <Band tone="paper">
        <Reveal>
          <p className="text-eyebrow uppercase tracking-wide text-green-brand">
            Know us
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-h1 text-green-ink">
            {TITLE}
          </h1>
          <p className="measure mt-4 text-lead text-ink-muted">
            A college in Lakeview that has been teaching under one motto since
            2004 — curiosity, discipline, purpose.
          </p>

          {/* Anchor links (PRD 12). Pills rather than a list — three of them
              read as a control, not as more prose under the lead. */}
          <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2">
            {[
              { href: '#history', label: 'History & vision', show: true },
              { href: '#leadership', label: 'Leadership', show: hasLeadership },
              { href: '#board', label: 'Executive Board', show: true },
            ]
              .filter((link) => link.show)
              .map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-line bg-surface px-4 py-1.5 text-small font-medium text-green-brand transition-colors hover:border-green-pale hover:bg-green-mist"
                >
                  {link.label}
                </a>
              ))}
          </nav>
        </Reveal>

        {/* The anchor target is the wrapper, not the Reveal: scroll-mt clears
            the sticky nav so a jump does not land with the heading tucked under
            the bar, and Reveal takes no id of its own. */}
        <section id="history" className="scroll-mt-24">
          <Reveal className="rich-text measure mt-14">
            <h2>Our history</h2>
          <p>
            Relentless Lab School &amp; College was established in{' '}
            <strong>2061 B.S. (2004 A.D.)</strong> under the motto{' '}
            <em>&ldquo;Curiosity, Discipline, Purpose&rdquo;</em> — a line
            that has outlasted every other thing about the institution and still
            describes what we are for.
          </p>
          <p>
            In <strong>2076 B.S.</strong> we opened the first +2 Management
            college in Lakeview district. In <strong>2085 B.S.</strong> we added
            +2 Law, in partnership with Lakeview Institute of Legal Studies. Today we also
            offer BBS, affiliated with Lakeview National University, through Relentless Lab
            School & College at Riverside-7, Lakeview.
          </p>
          <p>
            We aspire to introduce the Science stream at +2, and to expand into
            BBA, BCA, BIM, BBM, BSc CSIT, and BHM, alongside further
            Bachelor&rsquo;s and Master&rsquo;s programmes.
          </p>

          <h2>Our vision</h2>
          <p>
            To be a leading yet affordable institution, focused on quality
            learning, character development, and holistic growth — nurturing
            responsible, compassionate, disciplined, and intelligent students who
            are prepared to contribute to the nation and to the wider world.
          </p>

          <h2>What we are committed to</h2>
          <ul>
            <li>
              Student-centred, practical learning that produces competent,
              productive graduates.
            </li>
            <li>
              Bringing both local and global perspectives into the curriculum.
            </li>
            <li>
              Nurturing individual talent through extracurricular and
              co-curricular activities and clubs.
            </li>
            <li>
              Encouraging innovation, research, and field-based learning — for
              students and faculty alike.
            </li>
            </ul>
          </Reveal>
        </section>
      </Band>

      {/* THE SAME COMPONENT THE HOMEPAGE USES, not a second write-up.
          PRD 12 asks this page for the Principal's and Chairman's messages, and
          the obvious build is static prose — but those messages already exist as
          a CMS module the school edits at /admin/leadership. Two hand-written
          copies would drift the first time a principal changes, and the stale
          one would be the one nobody remembered to open. So this renders the
          module: one source, two pages.

          The component is self-contained — it opens its own Supabase client,
          reads its own published rows, brings its own Band, heading, and dialog,
          and returns null at zero rows. Nothing about it is positional. The
          wrapper div carries the anchor id only, since the component owns its
          Band and cannot take one. */}
      <div id="leadership" className="scroll-mt-24">
        <LeadershipMessages />
      </div>

      <Band tone="paper">
        <div id="board" className="scroll-mt-24">
          <Reveal>
            <p className="text-eyebrow uppercase tracking-wide text-green-brand">
              Who runs the college
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-h2 text-green-ink">
              Executive Board
            </h2>
            <p className="measure mt-4 text-ink-muted">
              The people responsible for teaching, administration, and the
              day-to-day running of the college.
            </p>
          </Reveal>
        </div>

        <Reveal className="mt-10 grid gap-6 md:grid-cols-2">
          {EXECUTIVE_BOARD.map((group) => (
            <section
              key={group.id}
              aria-labelledby={`board-${group.id}`}
              className="rounded-md border border-line bg-surface p-6"
            >
              <h3
                id={`board-${group.id}`}
                className="font-display text-h3 text-green-ink"
              >
                {group.group}
              </h3>
              {/* A description list, because that is exactly what this is: a
                  role, and the people who hold it. A screen reader announces the
                  pairing; a table would announce cells. */}
              <dl className="mt-4 space-y-3">
                {group.members.map((member, i) => (
                  <div
                    key={member.role ?? `member-${i}`}
                    className="border-l-2 border-green-pale pl-4"
                  >
                    {member.role && (
                      <dt className="text-small text-green-brand">
                        {member.role}
                      </dt>
                    )}
                    <dd className="text-ink">{member.names.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </Reveal>
      </Band>
    </>
  );
}
