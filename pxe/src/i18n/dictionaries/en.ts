export const en = {
  meta: {
    siteName: 'PXE',
    title: 'PXE — Turn what you know into income',
    description:
      'Create courses, share your knowledge, and reach learners in The Gambia, Senegal, and beyond — all from one platform.',
  },
  nav: {
    explore: 'Explore courses',
    teach: 'Teach on PXE',
    pricing: 'Pricing',
    menu: 'Menu',
    language: 'Language',
    skip: 'Skip to content',
  },
  cta: {
    startTeaching: 'Start teaching',
    exploreCourses: 'Explore courses',
  },
  demo: {
    badge: 'Demo',
    banner: 'Preview mode: the creators, courses and prices shown here are fictional examples, not real listings.',
  },
  home: {
    eyebrow: 'For creators in The Gambia, Senegal & the diaspora',
    title: 'Turn what you know into income.',
    subtitle:
      'Create courses, share your knowledge, and reach learners in The Gambia, Senegal, and beyond — all from one platform. No website or developer needed.',
    previewLabel: 'Example storefront',
    previewCourses: 'courses',
    previewShare: 'Share link',
    featuredTitle: 'Featured courses',
    featuredSub: 'Practical skills taught by people who use them every day.',
    viewAll: 'View all courses',
    categoriesTitle: 'Popular categories',
    categoriesSub: 'From tailoring to web development.',
    instructorsTitle: 'Meet the instructors',
    instructorsSub: 'Each creator gets their own storefront to share on WhatsApp, Instagram, TikTok and Facebook.',
    how: {
      title: 'How it works',
      steps: [
        { title: 'Create your storefront', body: 'Sign up, add your photo and bio, and get a personal link like pxe.app/creator/your-name.' },
        { title: 'Publish your course', body: 'Upload video lessons from your phone or computer, organise them into sections and set your price.' },
        { title: 'Share and get paid', body: 'Share your link with your audience. Students pay with methods they know and start learning right away.' },
      ],
    },
    creators: {
      title: 'For creators',
      items: [
        'A professional storefront without building a website',
        'Prices in dalasi, CFA francs or euros — your choice',
        'Clear sales reports: gross, fees, refunds and net',
        'Your content stays yours',
      ],
    },
    students: {
      title: 'For students',
      items: [
        'Learn on your phone, at your own pace',
        'Courses in English, French and Wolof',
        'Watch free preview lessons before you pay',
        'Pick up exactly where you left off',
      ],
    },
    faq: {
      title: 'Questions',
      items: [
        { q: 'Do I need technical skills to sell a course?', a: 'No. If you can record a video on your phone and send a WhatsApp message, you can publish a course on PXE.' },
        { q: 'Which payment methods will be available?', a: 'We are working on local mobile money and card payments. We will only list a payment method once it has been fully tested — until then, enrollment stays closed.' },
        { q: 'Which currencies are supported?', a: 'Gambian dalasi (GMD), West African CFA francs (XOF) and euros (EUR). Each course shows the currencies its creator chose; we never convert prices automatically.' },
        { q: 'Can people download or copy my videos?', a: 'Paid lessons are only streamed to enrolled students through short-lived, signed links. No website can fully prevent screen recording, but we make casual copying and link-sharing much harder.' },
        { q: 'How much does PXE cost?', a: 'See our pricing page. Plans and fees will be confirmed before creator accounts open.' },
      ],
    },
    finalCta: {
      title: 'Your knowledge is worth sharing.',
      body: 'Be among the first creators on PXE.',
    },
  },
  market: {
    title: 'Explore courses',
    subtitle: 'Search by course, instructor or topic.',
    search: 'Search',
    searchPlaceholder: 'e.g. tailoring, Instagram, gardening',
    category: 'Category',
    allCategories: 'All categories',
    language: 'Language',
    anyLanguage: 'Any language',
    level: 'Level',
    anyLevel: 'Any level',
    price: 'Price',
    anyPrice: 'Any price',
    free: 'Free',
    paid: 'Paid',
    currency: 'Currency',
    anyCurrency: 'Any currency',
    apply: 'Apply filters',
    reset: 'Clear',
    filters: 'Filters',
    results: (n: number) => (n === 1 ? '1 course' : `${n} courses`),
    emptyTitle: 'No courses match your search',
    emptyBody: 'Try fewer filters or a different word.',
    noCatalogTitle: 'Courses are on their way',
    noCatalogBody: 'Our first creators are preparing their courses. Check back soon.',
    loading: 'Loading courses…',
  },
  levels: { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' },
  languages: { en: 'English', fr: 'French', wo: 'Wolof' },
  course: {
    by: 'by',
    free: 'Free',
    outcomes: 'What you’ll learn',
    curriculum: 'Curriculum',
    curriculumSummary: (sections: number, lessons: number, minutes: number) =>
      `${sections} ${sections === 1 ? 'section' : 'sections'} · ${lessons} ${lessons === 1 ? 'lesson' : 'lessons'} · ${formatDuration(minutes)}`,
    minutes: (m: number) => `${m} min`,
    preview: 'Free preview',
    locked: 'Enrolled students only',
    requirements: 'Requirements',
    noRequirements: 'No prior experience needed.',
    about: 'About this course',
    instructor: 'Your instructor',
    viewStorefront: 'View storefront',
    language: 'Language',
    level: 'Level',
    price: 'Price',
    alsoAvailableIn: 'Also available in',
    enrollClosed: 'Enrollment opens soon',
    enrollClosedBody: 'Payments are still being set up and tested. You’ll be able to enroll once a payment method is live.',
    enrollFree: 'Enroll for free',
    enrollFreeSoon: 'Student accounts open soon — free enrollment will be available then.',
    policyTitle: 'Access & refunds',
    policy: [
      'Lifetime access to this version of the course, on any device.',
      'Watch the free preview lessons before you buy.',
      'Refund requests are handled under our refund policy (draft, pending review).',
    ],
    refundLink: 'Read the refund policy',
    related: 'Related courses',
    notFoundTitle: 'Course not found',
    notFoundBody: 'This course may have been unpublished or the link is incorrect.',
  },
  creator: {
    courses: 'Courses',
    noCourses: 'No published courses yet.',
    expertise: 'Expertise',
    teachesIn: 'Teaches in',
    based: 'Based in',
    shareTitle: 'Share this storefront',
    copy: 'Copy link',
    copied: 'Copied!',
    shareHint: 'Copy this link to share on WhatsApp, Instagram, TikTok or Facebook.',
    verified: 'Verified creator',
    notFoundTitle: 'Creator not found',
    notFoundBody: 'This storefront doesn’t exist or is no longer available.',
  },
  pricing: {
    title: 'Simple pricing for creators',
    subtitle: 'Start for free. Upgrade when your courses grow. Final prices and fees will be confirmed before creator accounts open.',
    tbd: 'Price to be announced',
    perMonth: 'per month',
    plans: [
      {
        name: 'Starter',
        price: 'Free',
        blurb: 'Publish your first course and test demand.',
        features: ['Your own creator storefront', 'Publish courses', 'Sell in GMD, XOF or EUR', 'Transaction fee on each sale (to be confirmed)'],
        highlighted: false,
      },
      {
        name: 'Creator',
        price: null,
        blurb: 'For creators building a steady income.',
        features: ['Everything in Starter', 'Lower transaction fee', 'Detailed sales analytics', 'Coupons and promotions (coming later)'],
        highlighted: true,
      },
    ],
    feesTitle: 'How fees work',
    feesBody:
      'On each sale we will show you the gross amount, the platform fee, the payment provider’s fee, any refunds, and what you earn. Nothing hidden.',
    paymentsTitle: 'Payment methods',
    paymentsBody:
      'We are evaluating local mobile money and card payment providers for The Gambia, Senegal and international buyers. Each method will be listed here only after it has been verified and tested.',
    payoutsTitle: 'Payouts',
    payoutsBody: 'At launch, payouts to creators are processed manually by our team, with a full record of each payment. Automated payouts will come later.',
  },
  teach: {
    title: 'Teach on PXE',
    subtitle: 'Turn your skills into a course students can buy and learn from on their phones.',
    whoTitle: 'Who it’s for',
    who: [
      'Tailors, hairdressers, chefs and other skilled professionals',
      'Entrepreneurs, importers and e-commerce sellers',
      'Designers, developers and digital marketers',
      'Teachers, language tutors and trainers',
      'Farmers and agricultural experts',
    ],
    statusTitle: 'Creator accounts open soon',
    statusBody:
      'We are building creator sign-up, the course creation wizard and secure payments. We will open accounts to our first pilot creators once these are tested.',
    contact: 'Want to be a pilot creator? Write to us:',
    policyNote: 'Courses about money or crypto must be educational. Promises of guaranteed profit are not allowed.',
  },
  footer: {
    tagline: 'Turn what you know into income.',
    platform: 'Platform',
    legal: 'Legal',
    support: 'Support',
    terms: 'Terms of use',
    privacy: 'Privacy',
    refunds: 'Refund policy',
    contact: 'Contact us',
    rights: 'All rights reserved.',
    markets: 'Made for The Gambia, Senegal and the diaspora.',
  },
  legal: {
    draft: 'Draft — this policy has not yet been reviewed by a lawyer and will be finalised before launch.',
    docs: {
      terms: {
        title: 'Terms of use',
        sections: [
          { h: 'About PXE', p: 'PXE is an online marketplace where independent creators publish and sell courses to students.' },
          { h: 'Accounts', p: 'You are responsible for keeping your account secure and for the accuracy of the information you provide.' },
          { h: 'Creator content', p: 'Creators keep ownership of their content and grant PXE the rights needed to host, stream and promote it. Creators must have the right to everything they publish.' },
          { h: 'Prohibited content', p: 'No fraud, hate, harassment, or misleading financial claims — including promises of guaranteed returns. We may remove content and suspend accounts that break these rules.' },
          { h: 'Payments', p: 'Prices are set by creators in the currencies they choose. Course access is granted only after a payment is verified with the payment provider.' },
        ],
      },
      privacy: {
        title: 'Privacy policy',
        sections: [
          { h: 'What we collect', p: 'Account details (name, email or phone), your purchases and learning progress, and technical data needed to run the service.' },
          { h: 'What we never store', p: 'We never store card numbers or mobile money PINs. Payments are processed by the payment provider.' },
          { h: 'How we use it', p: 'To provide your courses, process payments, prevent fraud, and send messages about your account.' },
          { h: 'Your choices', p: 'You can update your profile and request deletion of your account and personal data.' },
        ],
      },
      refunds: {
        title: 'Refund policy',
        sections: [
          { h: 'Before you buy', p: 'Most courses offer free preview lessons so you can judge the teaching before paying.' },
          { h: 'Requesting a refund', p: 'The refund window and conditions will be confirmed before launch. Refunds are returned through the original payment method where the provider supports it.' },
          { h: 'After a refund', p: 'Access to the refunded course ends when the refund is processed.' },
        ],
      },
    },
  },
  common: {
    notFoundTitle: 'Page not found',
    notFoundBody: 'The page you’re looking for doesn’t exist.',
    backHome: 'Back to home',
  },
};

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}

type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => infer R
    ? (...args: A) => Widen<R>
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { [K in keyof T]: Widen<T[K]> }
        : T;

export type Dictionary = Widen<typeof en>;
