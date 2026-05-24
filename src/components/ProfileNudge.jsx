import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const STORAGE_KEY = 'profileNudgeSnoozedUntil';

export default function ProfileNudge() {
  const [dismissed, setDismissed] = useState(false);

  const handleSnooze = () => {
    // Come back in 4 days
    const snoozeUntil = Date.now() + 4 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(snoozeUntil));
    setDismissed(true);
  };

  // Check if currently snoozed
  const snoozedUntil = Number(localStorage.getItem(STORAGE_KEY) || 0);
  if (dismissed || Date.now() < snoozedUntil) return null;

  return (
    <div className="bg-terracotta/10 border border-terracotta/30 rounded-2xl p-5 dark:bg-terracotta/15 dark:border-terracotta/40">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-terracotta/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-terracotta" />
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground text-sm">Let's make this feel personal ✨</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Add a few things about yourself — your skills, what you love, how you like to give — and your AI gift ideas will feel like they were made just for you.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 pl-12">
        <Link
          to="/profile"
          onClick={() => setDismissed(true)}
          className="text-xs font-heading font-semibold bg-terracotta text-white px-4 py-2 rounded-full hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 min-h-[36px] flex items-center"
        >
          Tell me about yourself →
        </Link>
        <button
          onClick={handleSnooze}
          className="text-xs text-foreground/70 hover:text-foreground transition-colors dark:text-foreground/80"
        >
          maybe later 🙂
        </button>
      </div>
    </div>
  );
}