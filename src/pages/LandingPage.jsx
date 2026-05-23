import { base44 } from '@/api/base44Client';
import { Gift, Calendar, Sparkles, Bell, Heart, Check, Star, ArrowRight, Package, Laugh, Clock, DollarSign } from 'lucide-react';

const PAIN_POINTS = [
  { icon: Clock, text: "Realising it's someone's birthday at 11pm the night before" },
  { icon: DollarSign, text: "Panic-buying something generic because you ran out of time" },
  { icon: Laugh, text: 'Giving the same gift twice and getting called out for it' },
  { icon: Package, text: "Gifts arriving late because you forgot to order in time" },
];

const FREE_FEATURES = [
  'Track unlimited occasions & recipients',
  'AI gift ideas (3 free generations)',
  'Gift checklist & delivery tracker',
  'Personal wishlist with shareable link',
  'Seasonal gift planning calendar',
  'Budget overview',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Unlimited AI gift generations',
  'Smart email reminders (30, 14 & 3 days out)',
  'Year-in-giving reflection & stats',
  'Curated gift catalogs by love language',
  'Gift restock suggestions',
  'Priority support',
];

const TESTIMONIALS = [
  { quote: "I used to be the person who forgot birthdays. Now I'm the person everyone asks for gift advice.", name: 'Sarah M.' },
  { quote: "The 14-day reminder saved me so many times. I actually feel organised about gift-giving now.", name: 'James T.' },
  { quote: "My partner thinks I'm incredibly thoughtful. They don't know about How Thoughtful 😅", name: 'Priya K.' },
];

export default function LandingPage() {
  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-sand-50 font-body">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-sand-50/90 backdrop-blur-xl border-b border-sand-300 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-ink">How Thoughtful</span>
          </div>
          <button
            onClick={handleSignup}
            className="bg-terracotta text-white px-5 py-2 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-terracotta/10 text-terracotta px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Never panic-buy a gift again
        </div>
        <h1 className="font-heading font-bold text-5xl md:text-6xl text-ink leading-tight mb-6">
          Be the person who{' '}
          <span className="relative">
            <span className="text-terracotta">always</span>
          </span>{' '}
          gets the gift right
        </h1>
        <p className="text-xl text-ink-soft leading-relaxed mb-10 max-w-xl mx-auto">
          How Thoughtful helps you remember every occasion, plan ahead with intention, and give gifts people actually love — without the last-minute stress.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSignup}
            className="flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-full font-heading font-bold text-lg hover:bg-terracotta-dark transition-all hover:-translate-y-1 shadow-lg shadow-terracotta/20"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-ink-soft">No credit card required</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="px-6 py-12 bg-white border-y border-sand-300">
        <div className="max-w-3xl mx-auto">
          <p className="font-accent text-xl text-center text-ink-soft mb-8">sound familiar?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAIN_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-sand-50 border border-sand-300 rounded-2xl p-4">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-terracotta" />
                </div>
                <p className="text-ink text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-ink-soft mt-8 text-base">
            You're not a bad gift-giver. You're just <span className="font-semibold text-ink">disorganised</span>. There's a fix for that.
          </p>
        </div>
      </section>

      {/* Features showcase */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-accent text-xl text-ink-soft mb-2">how it works</p>
          <h2 className="font-heading font-bold text-3xl text-ink">Everything you need to give thoughtfully</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Calendar,
              color: 'bg-terracotta/10 text-terracotta',
              title: 'Never miss an occasion',
              desc: 'Add birthdays, anniversaries, graduations — and get reminders at exactly the right time to order online, buy locally, or wrap the gift.',
            },
            {
              icon: Sparkles,
              color: 'bg-moss/20 text-moss-dark',
              title: 'AI ideas tailored to them',
              desc: 'Tell us about the person, their interests, and your budget. Get personalised gift ideas in seconds — not generic Amazon lists.',
            },
            {
              icon: Heart,
              color: 'bg-butter/40 text-butter-dark',
              title: 'Give with intention',
              desc: 'Track love languages, set a giving intention for the year, and reflect on what made people feel truly seen. Thoughtfulness is a skill.',
            },
            {
              icon: Bell,
              color: 'bg-terracotta/10 text-terracotta',
              title: 'Smart reminders',
              desc: 'Get an email 30 days out (order online), 14 days out (buy locally), and 3 days out (time to wrap). Never scramble again.',
            },
            {
              icon: Package,
              color: 'bg-moss/20 text-moss-dark',
              title: 'Delivery tracker',
              desc: 'Track every order from purchased → shipped → delivered. Know exactly where every gift is at any time.',
            },
            {
              icon: Gift,
              color: 'bg-butter/40 text-butter-dark',
              title: 'Shareable wishlist',
              desc: 'Create your own wishlist and share a link with family. No more guessing what you want — and no more duplicates under the tree.',
            },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white border border-sand-300 rounded-2xl p-6 hover:border-terracotta/30 hover:-translate-y-1 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
              <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-16 bg-white border-y border-sand-300">
        <div className="max-w-4xl mx-auto">
          <p className="font-accent text-xl text-center text-ink-soft mb-10">what people are saying</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name }) => (
              <div key={name} className="bg-sand-50 border border-sand-300 rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-butter text-butter" />
                  ))}
                </div>
                <p className="text-ink text-sm leading-relaxed mb-4">"{quote}"</p>
                <p className="font-heading font-semibold text-ink-soft text-sm">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-4xl mx-auto" id="pricing">
        <div className="text-center mb-12">
          <p className="font-accent text-xl text-ink-soft mb-2">simple pricing</p>
          <h2 className="font-heading font-bold text-3xl text-ink">Start free. Upgrade when you're ready.</h2>
          <p className="text-ink-soft mt-3">No surprises. No paywalls on the essentials.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free */}
          <div className="bg-white border-2 border-sand-300 rounded-3xl p-8">
            <div className="mb-6">
              <p className="font-heading font-bold text-xl text-ink mb-1">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-4xl text-ink">$0</span>
                <span className="text-ink-soft">forever</span>
              </div>
              <p className="text-sm text-ink-soft mt-2">Perfect for getting organised and staying on top of the people you love.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink">
                  <Check className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSignup}
              className="w-full border-2 border-terracotta text-terracotta py-3.5 rounded-full font-heading font-semibold hover:bg-terracotta hover:text-white transition-all"
            >
              Get started free
            </button>
          </div>

          {/* Premium */}
          <div className="bg-ink border-2 border-ink rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-butter text-ink text-xs font-heading font-bold px-3 py-1 rounded-full">
              Most popular
            </div>
            <div className="mb-6">
              <p className="font-heading font-bold text-xl text-white mb-1">Premium</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-4xl text-white">$6</span>
                <span className="text-white/60">/ month</span>
              </div>
              <p className="text-sm text-white/60 mt-2">For people who take thoughtful giving seriously — and want to be remembered for it.</p>
            </div>
            <ul className="space-y-3 mb-8">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 text-sm text-white">
                  <Check className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={handleSignup}
              className="w-full bg-terracotta text-white py-3.5 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
            >
              Start free, upgrade anytime
            </button>
            <p className="text-center text-white/40 text-xs mt-3">Less than a coffee a month to never stress about gifts again</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 bg-terracotta">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-accent text-2xl text-white/80 mb-3">ready to become that person?</p>
          <h2 className="font-heading font-bold text-4xl text-white mb-6">
            The one who always gets it right
          </h2>
          <p className="text-white/80 text-lg mb-10">
            Join thousands of people who've stopped stressing about gifts and started giving with genuine thought.
          </p>
          <button
            onClick={handleSignup}
            className="flex items-center gap-2 bg-white text-terracotta px-10 py-4 rounded-full font-heading font-bold text-lg hover:bg-sand-100 transition-all hover:-translate-y-1 shadow-xl mx-auto"
          >
            Create your free account <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-white/60 text-sm mt-4">Free forever. No credit card needed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-ink text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-terracotta flex items-center justify-center">
            <Gift className="w-3 h-3 text-white" />
          </div>
          <span className="font-heading font-bold text-white text-sm">How Thoughtful</span>
        </div>
        <p className="text-white/40 text-xs">Made for people who care about the people they love.</p>
      </footer>

    </div>
  );
}