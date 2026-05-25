import { Lock, Sparkles, X } from 'lucide-react';
import { FEATURES } from '@/hooks/useFeatureFlags';

/**
 * Sheet shown when a user taps a locked feature.
 * Props: featureKey, onUnlock, onClose
 */
export default function FeatureUnlockSheet({ featureKey, onUnlock, onClose }) {
  if (!featureKey) return null;
  const feature = FEATURES[featureKey];
  if (!feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full bg-card rounded-t-3xl shadow-2xl px-6 py-6 space-y-4"
        style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center -mt-2 mb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-all"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-foreground text-lg">{feature.label}</h3>
            <p className="text-xs text-muted-foreground">Not yet unlocked</p>
          </div>
        </div>

        <p className="text-sm text-foreground leading-relaxed">{feature.description}</p>

        <div className="bg-muted rounded-2xl px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">How to unlock naturally: </span>
            {feature.unlock}
          </p>
        </div>

        <button
          onClick={() => { onUnlock(featureKey); onClose(); }}
          className="w-full flex items-center justify-center gap-2 bg-terracotta text-white py-4 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Enable now anyway
        </button>

        <button
          onClick={onClose}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          I'll unlock it the natural way
        </button>
      </div>
    </div>
  );
}