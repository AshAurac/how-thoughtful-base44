import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Check, Home, Star } from 'lucide-react';
import { toast } from 'sonner';

const PRODUCTS = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    sublabel: 'Flexible, cancel any time',
    price: '$3.99 AUD',
    period: '/ month',
    description: 'Access all premium features month to month.',
    perks: [
      'Smart reminders — 30, 14 & 3 days out',
      'Gift inspiration based on love languages',
      'Budget & delivery tracking',
      'Group gifting & wishlists',
      'Saved ideas library',
    ],
    highlight: false,
    recommended: false,
  },
  annual: {
    id: 'annual',
    label: 'Annual',
    sublabel: 'Best value — save $23.89',
    price: '$24.99 AUD',
    period: '/ year',
    coffeeLine: 'Just $2.08/month ☕',
    savingsLine: 'Save 48% vs monthly',
    description: 'Founding member pricing — locked in for life.',
    perks: [
      'Everything in Monthly',
      'Year in Giving — your annual gifting story',
      'AI-powered gift idea generation',
      'Priority support',
      'All future features included',
      'Founding member rate, locked in forever',
    ],
    highlight: true,
    recommended: true,
  },
};

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
  const premiumType = profile?.premium_type;

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
        <h1 className="font-heading font-bold text-3xl text-foreground">Be more thoughtful</h1>
        <p className="text-muted-foreground mt-2">Simple, fair pricing. Cancel any time.</p>
      </div>

      {isPremium && (
        <div className="bg-sand-100 dark:bg-muted border border-sand-300 dark:border-border rounded-2xl p-4 text-center">
          <p className="font-heading font-semibold text-foreground">
            ✨ You have {premiumType === 'annual' ? 'an Annual' : 'a Monthly'} subscription
          </p>
        </div>
      )}

      {/* Plan cards */}
      <div className="space-y-4">
        {Object.values(PRODUCTS).map(plan => (
          <div
            key={plan.id}
            className={`rounded-3xl p-6 relative mt-3 ${
              plan.recommended
                ? 'bg-white dark:bg-card border-2 border-terracotta'
                : 'bg-white dark:bg-card border-2 border-sand-300 dark:border-border'
            }`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs font-heading font-bold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1">
                <Star className="w-3 h-3" /> Recommended
              </div>
            )}
            <p className="font-heading font-bold text-lg text-ink dark:text-foreground mb-0.5">{plan.label}</p>
            <p className="text-xs text-ink-soft dark:text-muted-foreground mb-2">{plan.sublabel}</p>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-heading font-bold text-3xl text-ink dark:text-foreground">{plan.price}</span>
              <span className="text-ink-soft dark:text-muted-foreground text-sm">{plan.period}</span>
            </div>
            {plan.coffeeLine && (
              <p className="text-xs text-terracotta font-medium">{plan.coffeeLine}</p>
            )}
            {plan.savingsLine && (
              <p className="text-xs font-heading font-semibold text-moss mb-1">{plan.savingsLine}</p>
            )}
            <p className="text-sm mb-4 text-ink-soft dark:text-muted-foreground mt-1">{plan.description}</p>
            <ul className="space-y-2 mb-5">
              {plan.perks.map(perk => (
                <li key={perk} className="flex items-center gap-2 text-sm text-ink dark:text-foreground">
                  <Check className="w-4 h-4 flex-shrink-0 text-moss" />
                  {perk}
                </li>
              ))}
            </ul>
            {isPremium ? (
              <div className="w-full text-center py-3 rounded-full text-sm font-medium bg-sand-100 dark:bg-muted text-ink-soft dark:text-muted-foreground">
                {premiumType === plan.id ? 'Active ✓' : 'Switch plan via billing portal'}
              </div>
            ) : (
              <>
                <CheckoutButton
                  product={plan.id}
                  user={user}
                  label={plan.id === 'annual' ? 'Get Annual — best value' : 'Start Monthly'}
                  className={`w-full py-3.5 rounded-full font-heading font-semibold transition-all hover:-translate-y-0.5 ${
                    plan.recommended
                      ? 'bg-terracotta text-white hover:bg-terracotta-dark'
                      : 'border-2 border-border text-foreground hover:bg-muted'
                  }`}
                />
                {plan.id === 'annual' && (
                  <p className="text-center text-xs text-ink-soft dark:text-muted-foreground mt-2">Cancel any time. No questions asked.</p>
                )}
              </>
            )}
          </div>
        ))}
      </div>

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