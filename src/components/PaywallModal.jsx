import { Link } from 'react-router-dom';
import { Sparkles, X, Zap, Heart, Bell } from 'lucide-react';

export default function PaywallModal({ reason, onClose }) {
  const isOutOfCredits = reason === 'out_of_credits';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-sand-100">
          <X className="w-5 h-5 text-ink-soft" />
        </button>

        {isOutOfCredits ? (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-butter/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-butter-dark" />
              </div>
              <p className="font-accent text-lg text-ink-soft mb-1">out of credits</p>
              <h3 className="font-heading font-bold text-2xl text-ink">Top up to keep dreaming</h3>
            </div>
            <Link
              to="/upgrade"
              onClick={onClose}
              className="block w-full text-center bg-terracotta text-white py-3 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
            >
              Get more credits
            </Link>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-terracotta/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-terracotta" />
              </div>
              <p className="font-accent text-lg text-ink-soft mb-1">that was your free taste</p>
              <h3 className="font-heading font-bold text-2xl text-ink">Unlock unlimited AI</h3>
            </div>

            <div className="bg-gradient-to-br from-terracotta to-terracotta-dark rounded-2xl p-4 text-white mb-4">
              <div className="flex items-baseline gap-1 mb-3">
                <span className="font-heading font-bold text-3xl">$24.99</span>
                <span className="text-white/80 text-sm">once, forever</span>
              </div>
              <div className="space-y-2">
                {[
                  { icon: Sparkles, text: 'Unlimited AI gift ideas' },
                  { icon: Bell, text: 'Smart reminders 4 weeks ahead' },
                  { icon: Heart, text: 'Full Year in Giving recap' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-white/80" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/upgrade"
              onClick={onClose}
              className="block w-full text-center bg-terracotta text-white py-3 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 mb-3"
            >
              Upgrade for $24.99
            </Link>
            <button
              onClick={onClose}
              className="block w-full text-center text-ink-soft text-sm py-2 hover:text-ink transition-colors"
            >
              Maybe later — keep using Curated
            </button>
          </>
        )}
      </div>
    </div>
  );
}