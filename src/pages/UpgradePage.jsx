import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, Home } from 'lucide-react';
import { toast } from 'sonner';

const PRODUCTS = {
  annual: {
    id: 'annual',
    label: 'Founding Member',
    sublabel: 'Annual',
    price: '$24.99 AUD',
    period: '/ year',
    coffeeLine: 'Less than a coffee a month ☕',
    description: 'Early supporter pricing — locked in for life. Cancel any time.',
    perks: [
      'Unlimited thoughtful gift inspiration',
      'Smart reminders — 30, 14 & 3 days before every occasion',
      'Look back on the meaningful moments you created',
      'Gift inspiration based on how people feel loved',
      'Everything in Free',
    ],
    highlight: true,
    recommended: true,
  },
  lifetime: {
    id: 'lifetime',
    label: 'Lifetime',
    sublabel: 'For our earliest believers',
    price: '$99 AUD',
    period: 'once, forever',
    description: 'Support the mission and never pay again.',
    perks: [
      '200 AI credits included',
      'Smart reminders forever',
      'Look back on the meaningful moments you created',
      'Cheap credit top-ups when needed',
      'Priority support',
    ],
    highlight: false,
  },
};

const CREDIT_PACKS = [
  { id: 'credits_50', credits: 50, price: '$2.99', label: '50 credits' },
  { id: 'credits_150', credits: 150, price: '$6.99', label: '150 credits', best: true },
  { id: 'credits_400', credits: 400, price: '$14.99', label: '400 credits' },
];

function CheckoutButton({ product, label, className, user }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const isIframe = window.self !== window.top;
    if (isIframe) {
      alert('Checkout only works from the published app — please open it directly in your browser.');
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('createCheckout', {
        product,
        user_email: user?.email || '',
        success_url: `${window.location.origin}/upgrade?success=true&product=${product}`,
        cancel_url: `${window.location.origin}/upgrade`,
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        toast.error('Could not start checkout. Please try again.');
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? 'Loading...' : label}
    </button>
  );
}

export default function UpgradePage({ user }) {
  const urlParams = new URLSearchParams(window.location.search);
  const successProduct = urlParams.get('success') === 'true' ? urlParams.get('product') : null;

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  const isPremium = profile?.is_premium;
  const isLifetime = profile?.premium_type === 'lifetime';
  const aiCredits = profile?.ai_credits || 0;

  return (
    <div className="space-y-8 max-w-lg mx-auto">

      {successProduct && (
        <div className="bg-moss/20 border border-moss rounded-2xl p-4 text-center">
          <p className="font-heading font-semibold text-foreground">🎉 Payment successful! Your account has been upgraded.</p>
          <p className="text-sm text-muted-foreground mt-1">It may take a moment to reflect — refresh if needed.</p>
        </div>
      )}

      <div className="text-center">
        <p className="font-accent text-2xl text-ink-soft mb-1">upgrade</p>
        <h1 className="font-heading font-bold text-3xl text-foreground">Be more thoughtful, for life</h1>
        <p className="text-muted-foreground mt-2">Simple, fair pricing. No surprises.</p>
      </div>

      {isPremium && (
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 text-center">
          <p className="font-heading font-semibold text-ink">
            {isLifetime ? '✨ You have Lifetime access' : '✨ You have an Annual subscription'}
          </p>
          {isLifetime && <p className="text-sm text-ink-soft mt-1">{aiCredits} AI credits remaining</p>}
        </div>
      )}

      {/* Plan cards */}
      <div className="space-y-4">
        {Object.values(PRODUCTS).map(plan => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 relative mt-3 ${
              plan.recommended
                ? 'bg-white border-2 border-terracotta'
                : 'bg-white border-2 border-sand-300'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs font-heading font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Recommended
              </div>
            )}
            <p className="font-heading font-bold text-lg text-ink mb-0.5">{plan.label}</p>
            <p className="text-xs text-ink-soft mb-2">{plan.sublabel}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-heading font-bold text-3xl text-ink">{plan.price}</span>
              <span className="text-ink-soft text-sm">{plan.period}</span>
            </div>
            {plan.coffeeLine && (
              <p className="text-xs text-terracotta font-medium mb-1">{plan.coffeeLine}</p>
            )}
            <p className="text-sm mb-4 text-ink-soft">{plan.description}</p>
            <ul className="space-y-2 mb-5">
              {plan.perks.map(perk => (
                <li key={perk} className="flex items-center gap-2 text-sm text-ink">
                  <Check className="w-4 h-4 flex-shrink-0 text-moss" />
                  {perk}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="w-full text-center py-3 rounded-full text-sm font-medium bg-sand-100 text-ink-soft">
                {isLifetime ? 'Already owned ✓' : (plan.id === 'annual' ? 'Active ✓' : 'Upgrade to Lifetime')}
              </div>
            ) : (
              <>
                <CheckoutButton
                  product={plan.id}
                  user={user}
                  label={plan.id === 'annual' ? 'Become a Founding Member' : `Get Lifetime — ${plan.price}`}
                  className={`w-full py-3.5 rounded-full font-heading font-semibold transition-all hover:-translate-y-0.5 ${
                    plan.recommended
                      ? 'bg-terracotta text-white hover:bg-terracotta-dark'
                      : 'border-2 border-terracotta text-terracotta hover:bg-terracotta hover:text-white'
                  }`}
                />
                {plan.id === 'annual' && (
                  <p className="text-center text-xs text-ink-soft mt-2">Cancel any time. No questions asked.</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Credit packs — only for lifetime users */}
      {isLifetime && (
        <div>
          <h2 className="font-heading font-semibold text-ink mb-1">AI credit top-ups</h2>
          <p className="text-sm text-ink-soft mb-4">You have {aiCredits} credits left. Top up any time.</p>
          <div className="grid grid-cols-3 gap-3">
            {CREDIT_PACKS.map(pack => (
              <div key={pack.id} className="relative">
                {pack.best && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap z-10">
                    Best value
                  </div>
                )}
                <CheckoutButton
                  product={pack.id}
                  user={user}
                  label={<><span className="block font-heading font-bold text-lg text-ink">{pack.price}</span><span className="block text-xs text-ink-soft mt-0.5">{pack.credits} credits</span></>}
                  className={`w-full bg-white border rounded-2xl p-4 text-center hover:border-terracotta/50 transition-all hover:-translate-y-0.5 ${
                    pack.best ? 'border-terracotta' : 'border-sand-300'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center text-sm text-muted-foreground pb-2">
        Free tier never goes away — curated ideas are always free.
      </div>

      <Link
        to="/"
        className="flex items-center justify-center gap-2 w-full border border-border text-foreground py-3.5 rounded-full font-heading font-semibold hover:bg-muted transition-all"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}