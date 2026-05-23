import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X } from 'lucide-react';

export default function ProfileNudge() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-sand-100 to-white border border-sand-300 rounded-2xl p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Sparkles className="w-4 h-4 text-terracotta" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-semibold text-ink text-sm">Make ideas more personal</p>
        <p className="text-xs text-ink-soft mt-0.5 mb-2">Add a few things about yourself so AI gift ideas feel hand-picked.</p>
        <Link
          to="/profile"
          onClick={() => setDismissed(true)}
          className="inline-block text-xs font-heading font-semibold text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Fill in my profile →
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-full hover:bg-sand-200 text-ink-soft transition-all flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}