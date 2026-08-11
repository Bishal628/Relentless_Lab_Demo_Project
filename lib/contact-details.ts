// The school's real contact details, in one place. The footer and /privacy both
// render them, and a phone number that is right in one and stale in the other is
// worse than one that is stale in both — so neither hardcodes its own copy.
//
// Phones are DISPLAYED in the local form the school uses on its own signage and
// DIALLED in full international form, so tap-to-call works from a mobile that is
// not on a Nepali network.
export const SCHOOL_CONTACT = {
  address: 'Riverside-7, Lakeview Municipality, fictional district',
  phones: [
    { display: '01-5550100', dial: '+97715550100' },
    { display: '01-5550101', dial: '+97715550101' },
  ],
  emails: [
    'info@relentlesslab.edu.np',
    'admissions@relentlesslab.com.np',
    'demo@relentlesslab.com.np',
  ],
} as const;
