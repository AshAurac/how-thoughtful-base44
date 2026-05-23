import { Sparkles, Bell, Heart, Zap, Star } from 'lucide-react';

const PACKAGES = [
  {
    id: 'lifetime',
    label: 'Thoughtful+',
    price: '$24.99',
    period: 'once, forever',
    description: 'Unlimited AI ideas, smart reminders, and the full Year in Giving experience.',
    perks: [
      { icon: Sparkles, text: 'Unlimited AI gift ideas' },
      { icon: Bell, text: 'Reminders 4 weeks before every occasion' },
      { icon: Heart, text: 'Full Year in Giving recap' },
      { icon: Star, text: '100 AI credits included' },
    ],
    recommended: true,
    gradient: true,
  },
];

const CREDIT_PACKS = [
  { id: 'credits_50', credits: 50, price: '$4.99', label: '50 credits' },
  { id: 'credits_120', credits: 120, price: '$9.99', label: '120 credits', best: true },
  { id: 'credits_300', credits: 300, price: '$19.99', label: '300 credits' },
];

export default function UpgradePage() {
  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="text-center">
        <p className="font-accent text-2xl text-ink-soft mb-1">upgrade</p>
        <h1 className="font-heading font-bold text-3xl text-ink">Give better, for life</h1>
        <p className="text-ink-soft mt-2">One payment. No subscription. No pressure.</p>
      </div>

      {/* Lifetime card */}
      <div className="bg-gradient-to-br from-terracotta to-terracotta-dark rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-heading font-semibold">
          Recommended
        </div>
        <p className="font-accent text-white/80 text-lg mb-1">thoughtful+</p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="font-heading font-bold text-5xl">$24.99</span>
          <span className="text-white/70">once, forever</span>
        </div>
        <div className="space-y-2.5 mb-6">
          {[
            { icon: Sparkles, text: 'Unlimited AI gift ideas' },
            { icon: Bell, text: 'Reminders 4 weeks ahead' },
            { icon: Heart, text: 'Full Year in Giving recap' },
            { icon: Zap, text: '100 AI credits to start' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => alert('Stripe checkout coming soon — connect Stripe to enable payments')}
          className="w-full bg-white text-terracotta py-4 rounded-full font-heading font-bold text-lg hover:bg-sand-50 transition-all hover:-translate-y-0.5 shadow-lg"
        >
          Get Thoughtful+ — $24.99
        </button>
        <p className="text-center text-xs text-white/60 mt-3">Secure payment · One time · No subscription</p>
      </div>

      {/* Credit packs */}
      <div>
        <h2 className="font-heading font-semibold text-ink mb-3">AI credit top-ups</h2>
        <p className="text-sm text-ink-soft mb-4">Already have Thoughtful+? Top up your AI credits any time.</p>
        <div className="grid grid-cols-3 gap-3">
          {CREDIT_PACKS.map(pack => (
            <button
              key={pack.id}
              onClick={() => alert('Stripe checkout coming soon')}
              className={`relative bg-white border rounded-2xl p-4 text-center hover:border-terracotta/50 transition-all hover:-translate-y-0.5 ${
                pack.best ? 'border-terracotta' : 'border-sand-300'
              }`}
            >
              {pack.best && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                  Best value
                </div>
              )}
              <p className="font-heading font-bold text-lg text-ink">{pack.price}</p>
              <p className="text-xs text-ink-soft mt-1">{pack.credits} credits</p>
            </button>
          ))}
        </div>
      </div>

      <div className="text-center text-sm text-ink-soft pb-4">
        Not sure? The free tier never goes away.
        <br />
        Curated ideas are always free — no AI needed.
      </div>
    </div>
  );
}