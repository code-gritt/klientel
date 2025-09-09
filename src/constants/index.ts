import { Icons } from '@/components';

export const perks = [
  {
    icon: Icons.auth,
    title: 'Sign Up',
    info: 'Create your free Klientel account and instantly receive 100 credits to get started.',
  },
  {
    icon: Icons.customize,
    title: 'Organize',
    info: 'Import leads via CSV or add them manually. Categorize and customize pipelines to fit your sales process.',
  },
  {
    icon: Icons.launch,
    title: 'Close Deals',
    info: 'Track, nurture, and convert prospects into loyal customers using Klientel’s streamlined CRM tools.',
  },
];

export const features = [
  {
    icon: Icons.bolt,
    title: 'Quick Lead Management',
    info: 'Add, search, and update leads with ease. Import bulk data via CSV and stay organized with categories and notes.',
  },
  {
    icon: Icons.palette,
    title: 'Custom Sales Pipelines',
    info: 'Visualize your process with drag-and-drop Kanban boards. Move deals across stages like New, Contacted, and Closed.',
  },
  {
    icon: Icons.seo,
    title: 'Actionable Analytics',
    info: 'Track conversion rates, deal values, and forecasted revenue with interactive charts and simple exports.',
  },
  {
    icon: Icons.monitor,
    title: 'Responsive Dashboard',
    info: 'Work seamlessly on desktop, tablet, or mobile—your CRM adapts to your workflow wherever you are.',
  },
  {
    icon: Icons.shop,
    title: 'Credits-Based Access',
    info: 'Start free with 100 credits. Deduct small amounts for lead imports or premium exports and top up via PayPal anytime.',
  },
  {
    icon: Icons.server,
    title: 'Secure & Reliable',
    info: 'Protected with JWT authentication and backed by modern infrastructure to keep your data safe and accessible.',
  },
];

export const pricingCards = [
  {
    title: 'Starter',
    description: 'Perfect for freelancers and solopreneurs',
    price: 'Free',
    duration: '',
    highlight: 'Includes',
    buttonText: 'Start for free',
    features: [
      '100 credits included',
      'Lead management',
      'Basic pipeline',
      'Full-text search',
    ],
    priceId: '',
  },
  {
    title: 'Growth',
    description: 'For growing sales teams',
    price: '$29',
    duration: 'month',
    highlight: 'Includes everything in Starter, plus',
    buttonText: 'Upgrade to Growth',
    features: [
      '1,000 credits per month',
      'Multiple pipelines',
      'Analytics dashboard',
      'CSV export',
    ],
    priceId: 'price_1OYxkqFj9oKEERu1KfJGWxgN',
  },
  {
    title: 'Enterprise',
    description: 'For established businesses scaling sales',
    price: '$99',
    duration: 'month',
    highlight: 'Includes everything in Growth, plus',
    buttonText: 'Upgrade to Enterprise',
    features: [
      'Unlimited credits',
      'Team collaboration',
      'Custom branding',
      'Priority support (24/7)',
    ],
    priceId: 'price_1OYxkqFj9oKEERu1NbKUxXxN',
  },
];

export const bentoCards = [
  {
    title: 'Capture & Organize Leads',
    info: 'Add leads manually or via bulk upload, complete with notes, categories, and statuses.',
    imgSrc: '/assets/bento-1.svg',
    alt: 'Lead management system',
  },
  {
    title: 'Visual Sales Pipelines',
    info: 'Manage your deals with drag-and-drop Kanban boards for every stage of the sales journey.',
    imgSrc: '/assets/bento1.svg',
    alt: 'Sales pipeline visualization',
  },
  {
    title: 'Search & Navigate Fast',
    info: 'Use Command-K or full-text search to instantly find leads, deals, or pipeline stages.',
    imgSrc: '/assets/bento1.svg',
    alt: 'CRM quick search navigation',
  },
  {
    title: 'Analyze & Scale',
    info: 'Get insights into conversions, revenue forecasts, and lead sources. Export reports anytime.',
    imgSrc: '/assets/bento1.svg',
    alt: 'Analytics and reporting in CRM',
  },
];

export const reviews = [
  {
    name: 'Lena',
    username: '@lena_sales',
    body: 'Klientel keeps my freelance projects organized. The pipeline view is simple but powerful.',
  },
  {
    name: 'Marc',
    username: '@marc_b2b',
    body: 'Finally a CRM without the fluff. Easy to use, credits system is fair, and PayPal top-ups are smooth.',
  },
  {
    name: 'Sofia',
    username: '@sofia_team',
    body: 'Our small team closed more deals after moving to Klientel. The analytics tab is a game changer.',
  },
  {
    name: 'Jonas',
    username: '@jonas_startup',
    body: 'We imported 2,000 leads in minutes and were up and running instantly. Klientel makes scaling painless.',
  },
  {
    name: 'Katrin',
    username: '@katrin_agency',
    body: 'Managing multiple client pipelines is finally simple. Exports are quick and clients love the reports.',
  },
  {
    name: 'Felix',
    username: '@felix_growth',
    body: 'The Command-K search saves me hours each week. Everything is just a few keystrokes away.',
  },
];
