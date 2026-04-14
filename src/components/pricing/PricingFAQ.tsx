'use client';

const FAQ = [
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Cancel from your profile page at any time. Your access continues until the end of your billing period.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'MTN Mobile Money, Vodafone Cash, AirtelTigo Money, and bank cards (Visa/Mastercard) where Paystack supports them. All payments are processed securely.',
  },
  {
    q: 'Does my plan cover all universities?',
    a: 'Yes. One plan covers all content across universities on Edulamad. Your personalised view shows your university by default, but you can access content broadly where your courses allow.',
  },
  {
    q: 'How many devices can I use?',
    a: 'Use Edulamad on any device — your progress syncs when you are signed in.',
  },
  {
    q: 'Is there a student discount?',
    a: 'The semester plan is priced for students — you save versus paying four separate monthly renewals. Promo codes can add extra discounts.',
  },
  {
    q: 'What happens to my free 3 questions when I upgrade?',
    a: 'They stay in your history. Upgrading adds unlimited access on top — you keep everything you already have.',
  },
];

export function PricingFAQ() {
  return (
    <div className="mt-14 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/30">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        FAQ
      </h3>
      <ul className="mt-4 space-y-4">
        {FAQ.map((item) => (
          <li key={item.q}>
            <p className="font-medium text-slate-900 dark:text-white">{item.q}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {item.a}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
