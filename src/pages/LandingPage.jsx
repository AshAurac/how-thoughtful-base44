import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Gift, Calendar, Sparkles, Bell, Heart, Check, Star, ArrowRight, Package, Clock, DollarSign, Smile, BookOpen } from 'lucide-react';

const PAIN_POINTS = [
  { icon: Clock, text: "You remember someone's birthday at 11pm the night before and panic." },
  { icon: DollarSign, text: "You grab something generic because you ran out of time to think." },
  { icon: Smile, text: "You care deeply — but remembering every occasion is just a lot to hold." },
  { icon: Package, text: "Gifts arrive late, or not at all, because life got in the way." },
];

const FREE_FEATURES = [
  'Keep track of the people and moments that matter most',
  'Curated gift ideas — always free, always thoughtful',
  'Gift checklist & delivery tracker',
  'Your personal wishlist with a shareable link',
  'Plan birthdays, anniversaries and special moments ahead of time',
  'Stay generous without overspending',
  '3 AI gift ideas each month',
];

const MONTHLY_FEATURES = [
  'Everything in Free',
  'Unlimited AI gift inspiration',
  'Smart reminders — 30, 14 & 3 days before every occasion',
  'Gift inspiration based on love languages',
  'Budget & delivery tracking',
  'Group gifting & wishlists',
  'Saved ideas library',
];

const ANNUAL_FEATURES = [
  'Everything in Monthly',
  'Year in Giving — your annual gifting story',
  'Founding member rate, locked in forever',
  'All future features included',
  'Just $2.08/month when split across the year',
];

const TESTIMONIALS = [
  { quote: "I used to be the person who forgot birthdays. Now I'm the person everyone asks for gift advice.", name: 'Sarah M.' },
  { quote: "The 14-day reminder saved me so many times. I actually feel organised about the people I love now.", name: 'James T.' },
  { quote: "My partner thinks I'm incredibly thoughtful. They don't know about How Thoughtful 😅", name: 'Priya K.' },
];

export default function LandingPage() {
  const handleSignup = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  const handleLogin = () => {
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <div className="min-h-screen bg-sand-50 font-body">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-sand-50/90 backdrop-blur-xl border-b border-sand-300 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/6a1188b0e669a81e5b3530ea/5247e49c3_RealLogo.png" alt="How Thoughtful" className="w-8 h-8" />
            <span className="font-heading font-bold text-ink">How Thoughtful</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="text-ink-soft font-heading font-semibold text-sm hover:text-ink transition-all hidden sm:block">About</Link>
            <Link to="/contact" className="text-ink-soft font-heading font-semibold text-sm hover:text-ink transition-all hidden sm:block">Contact</Link>
            <button
              onClick={handleLogin}
              className="text-ink-soft font-heading font-semibold text-sm hover:text-ink transition-all"
            >
              Log in
            </button>
            <button
              onClick={handleSignup}
              className="bg-terracotta text-white px-5 py-2 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
            >
              Start for free
            </button>
          </div>
        </div>
      </nav>

      {/* Emotional Hero */}
      <section className="px-6 pt-20 pb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-moss/15 text-moss-dark px-4 py-1.5 rounded-full text-sm font-medium mb-8">
          <Heart className="w-3.5 h-3.5" />
          A calm system for thoughtful living
        </div>
        <h1 className="font-heading font-bold text-5xl md:text-6xl text-ink leading-tight mb-6">
          Remember the little things<br />
          <span className="text-terracotta">that matter most</span>
        </h1>
        <p className="text-xl text-ink-soft leading-relaxed mb-4 max-w-xl mx-auto">
          How Thoughtful helps you remember the people and occasions you care about — so you can show up for them with warmth, not panic.
        </p>
        <p className="text-base text-ink-soft/70 italic font-accent mb-10">
          Because caring shouldn't rely on memory alone.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleSignup}
            className="flex items-center gap-2 bg-terracotta text-white px-8 py-4 rounded-full font-heading font-bold text-lg hover:bg-terracotta-dark transition-all hover:-translate-y-1 shadow-lg shadow-terracotta/20"
          >
            Start being more thoughtful <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-sm text-ink-soft">Free forever. No credit card needed.</p>
        </div>
      </section>

      {/* Emotional pain points */}
      <section className="px-6 py-14 bg-white border-y border-sand-300">
        <div className="max-w-3xl mx-auto">
          <p className="font-accent text-xl text-center text-ink-soft mb-8">you're not alone in this</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PAIN_POINTS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-sand-50 border border-sand-300 rounded-2xl p-5">
                <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-terracotta" />
                </div>
                <p className="text-ink text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-ink-soft mt-8 text-base">
            You're a caring person. You just need a <span className="font-semibold text-ink">gentle system</span> to hold it all.
          </p>
        </div>
      </section>

      {/* How it relieves mental load */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <p className="font-accent text-xl text-ink-soft mb-3">how it helps</p>
        <h2 className="font-heading font-bold text-3xl text-ink mb-4">Less mental load. More genuine connection.</h2>
        <p className="text-ink-soft leading-relaxed max-w-xl mx-auto text-base">
          How Thoughtful quietly holds the details — dates, preferences, budgets, love languages — so when a special moment arrives, you're ready. Not scrambling.
        </p>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
          {[
            { icon: BookOpen, title: 'Remember everything', desc: 'Store meaningful details about the people you love — interests, love languages, notes from last year.' },
            { icon: Bell, title: 'Be reminded gently', desc: 'Get a nudge 30, 14, and 3 days before every occasion. Never scramble at the last minute again.' },
            { icon: Heart, title: 'Give with intention', desc: 'Know what to give, why it matters, and how to make someone feel truly seen.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-sand-300 rounded-2xl p-5">
              <div className="w-9 h-9 rounded-xl bg-moss/15 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-moss-dark" />
              </div>
              <h3 className="font-heading font-semibold text-ink mb-2 text-sm">{title}</h3>
              <p className="text-xs text-ink-soft leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature showcase */}
      <section className="px-6 py-16 bg-white border-y border-sand-300">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-accent text-xl text-ink-soft mb-2">everything you need</p>
            <h2 className="font-heading font-bold text-3xl text-ink">A thoughtful companion for every occasion</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Calendar,
                color: 'bg-terracotta/10 text-terracotta',
                title: 'Never miss a moment',
                desc: 'Add birthdays, anniversaries, graduations and more. Get reminders at exactly the right time to be ready — not rushed.',
              },
              {
                icon: Sparkles,
                color: 'bg-moss/15 text-moss-dark',
                title: 'Thoughtful gift inspiration',
                desc: 'Personalised ideas based on who they are, what they love, and how they feel cared for. Not generic lists.',
              },
              {
                icon: Heart,
                color: 'bg-butter/40 text-butter-dark',
                title: 'Give with intention',
                desc: 'Track love languages, set a giving intention for the year, and reflect on the moments you created.',
              },
              {
                icon: Bell,
                color: 'bg-terracotta/10 text-terracotta',
                title: 'Gentle reminders',
                desc: "30 days to order online. 14 days to buy locally. 3 days to wrap. You'll always feel prepared, not behind.",
              },
              {
                icon: Package,
                color: 'bg-moss/15 text-moss-dark',
                title: 'Track every gift',
                desc: 'From the idea to delivered. Know exactly where everything is, and never lose track of an order.',
              },
              {
                icon: Gift,
                color: 'bg-butter/40 text-butter-dark',
                title: 'Your own wishlist',
                desc: 'Create a wishlist and share a link with people who love you. No more guessing, no more duplicates.',
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-sand-50 border border-sand-300 rounded-2xl p-6 hover:border-terracotta/30 hover:-translate-y-1 transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-ink mb-2">{title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20 max-w-4xl mx-auto" id="pricing">
        <div className="text-center mb-12">
          <p className="font-accent text-xl text-ink-soft mb-2">simple, fair pricing</p>
          <h2 className="font-heading font-bold text-3xl text-ink">Start for free. Stay as long as you like.</h2>
          <p className="text-ink-soft mt-3 max-w-md mx-auto">No pressure. The free plan is genuinely useful. Upgrade when it feels right.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Free */}
          <div className="bg-white border-2 border-sand-300 rounded-3xl p-7">
            <div className="mb-5">
              <p className="font-heading font-bold text-lg text-ink mb-1">Free</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-ink">$0</span>
                <span className="text-ink-soft text-sm">forever</span>
              </div>
              <p className="text-xs text-ink-soft mt-2">Start being more thoughtful today — no commitment needed.</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={handleSignup} className="w-full border-2 border-terracotta text-terracotta py-3 rounded-full font-heading font-semibold hover:bg-terracotta hover:text-white transition-all text-sm">
              Start for free
            </button>
          </div>

          {/* Monthly */}
          <div className="bg-white border-2 border-sand-300 rounded-3xl p-7">
            <div className="mb-5">
              <p className="font-heading font-bold text-lg text-ink mb-1">Monthly</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-ink">$3.99</span>
                <span className="text-ink-soft text-sm">AUD / month</span>
              </div>
              <p className="text-xs text-ink-soft mt-2">Flexible, cancel any time.</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {MONTHLY_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={handleSignup} className="w-full border-2 border-terracotta text-terracotta py-3 rounded-full font-heading font-semibold hover:bg-terracotta hover:text-white transition-all text-sm">
              Start Monthly
            </button>
          </div>

          {/* Annual */}
          <div className="bg-white border-2 border-terracotta rounded-3xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-terracotta text-white text-xs font-heading font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Recommended
            </div>
            <div className="mb-5">
              <p className="font-heading font-bold text-lg text-ink mb-1">Annual</p>
              <div className="flex items-baseline gap-1">
                <span className="font-heading font-bold text-3xl text-ink">$24.99</span>
                <span className="text-ink-soft text-sm">AUD / year</span>
              </div>
              <p className="text-xs text-moss font-medium mt-1">Save 48% vs monthly ✓</p>
              <p className="text-xs text-terracotta font-medium">Just $2.08/month ☕</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {ANNUAL_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-ink">
                  <Check className="w-4 h-4 text-moss mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={handleSignup} className="w-full bg-terracotta text-white py-3 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 text-sm">
              Get Annual — Best Value
            </button>
            <p className="text-center text-xs text-ink-soft mt-3">Cancel any time. No questions asked.</p>
          </div>
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

      {/* Soft CTA */}
      <section className="px-6 py-20 bg-sand-100">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-accent text-2xl text-ink-soft mb-3">ready to show up for the people you love?</p>
          <h2 className="font-heading font-bold text-4xl text-ink mb-5">
            Thoughtfulness, remembered.
          </h2>
          <p className="text-ink-soft text-lg mb-10 leading-relaxed">
            Join people who've stopped stressing about gifts and started giving with genuine care — one occasion at a time.
          </p>
          <button
            onClick={handleSignup}
            className="flex items-center gap-2 bg-terracotta text-white px-10 py-4 rounded-full font-heading font-bold text-lg hover:bg-terracotta-dark transition-all hover:-translate-y-1 shadow-lg shadow-terracotta/20 mx-auto"
          >
            Create your free account <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-ink-soft/60 text-sm mt-4">Free forever. No credit card needed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-ink text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="https://media.base44.com/images/public/6a1188b0e669a81e5b3530ea/5247e49c3_RealLogo.png" alt="How Thoughtful" className="w-6 h-6" />
          <span className="font-heading font-bold text-white text-sm">How Thoughtful</span>
        </div>
        <div className="flex items-center justify-center gap-4 mt-3 mb-2">
          <Link to="/about" className="text-white/60 text-xs hover:text-white transition-all">About</Link>
          <Link to="/contact" className="text-white/60 text-xs hover:text-white transition-all">Contact</Link>
        </div>
        <p className="text-white/40 text-xs">Made for people who care about the people they love.</p>
      </footer>

    </div>
  );
}