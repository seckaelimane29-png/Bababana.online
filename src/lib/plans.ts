export type PlanId = "free" | "yearly" | "monthly" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  renews: string;
  badge?: string;
  stripePriceId?: string;
  accent: "gray" | "blue" | "gold" | "green" | "dark";
  perks: string[];
  /** crossed-out reference price */
  strikePrice?: string;
  /** small weekly breakdown line */
  weekly?: string;
  cta?: string;
  /** local currency amounts for the Africa flow */
  local?: { cfa: number; dalasi: number };
  durationDays?: number;
};

/** Days of free trial on the yearly plan (card required, charged after). */
export const TRIAL_DAYS = 2;
export const YEARLY_PRICE = "€49.99";

export const PLANS: Plan[] = [
  {
    id: "yearly",
    name: "YEARLY — 12 Months",
    price: "€49.99",
    cadence: "/year",
    renews: "Start with 2 days free — then €49.99/year",
    badge: "MOST POPULAR ⭐",
    strikePrice: "€99.99",
    weekly: "€0.96 / week",
    cta: "Start Yearly Plan",
    accent: "gold",
    stripePriceId: "price_1TUAJgQux9d9GHZdwY3xnmbD",
    perks: [
      "All 5 insights of every book",
      "All 31 books, 61 proverbs, every quote",
      "All themes and all languages",
      "Cancel anytime",
    ],
    local: { cfa: 5000, dalasi: 500 },
    durationDays: 365,
  },
  {
    id: "monthly",
    name: "MONTHLY",
    price: "€6.99",
    cadence: "/month",
    renews: "Billed monthly — cancel anytime",
    weekly: "€1.75 / week",
    cta: "Start Monthly Plan",
    accent: "blue",
    stripePriceId: "price_1TU4jMQux9d9GHZdaRGcYmVz",
    perks: ["All 5 insights of every book", "All 31 books and 61 proverbs", "All themes and languages"],
    local: { cfa: 500, dalasi: 50 },
    durationDays: 30,
  },
  {
    id: "lifetime",
    name: "FOUNDING MEMBER",
    price: "€29.99",
    cadence: "one time",
    renews: "Lifetime access — never expires",
    badge: "LIMITED OFFER 🌍",
    cta: "Get Lifetime Access",
    accent: "dark",
    stripePriceId: "price_1TU4cmQux9d9GHZdQuT50aOy",
    perks: ["Lifetime access to everything", "Founding Member badge", "Limited spots remaining"],
  },
];

export function planById(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export const AFRICA = {
  gm: { label: "Gambia 🇬🇲", currency: "Dalasi", wave: "+220 2107505", key: "dalasi" as const },
  sn: { label: "Senegal 🇸🇳", currency: "CFA", wave: "+220 2107505", key: "cfa" as const },
};

export type CountryCode = keyof typeof AFRICA;

export function localAmount(plan: Plan, country: CountryCode): number | null {
  if (!plan.local) return null;
  return AFRICA[country].key === "cfa" ? plan.local.cfa : plan.local.dalasi;
}
