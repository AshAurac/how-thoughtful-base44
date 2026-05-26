/**
 * Horizontal progress timeline for a gift occasion.
 * Milestones (from furthest to closest):
 *   30d — Plan gift
 *   20d — Order online
 *    7d — Buy in store
 *    3d — Wrap & write card
 *    1d — Final summary / celebrate
 *    0d — Day of!
 */

const MILESTONES = [
  { days: 30, label: 'Plan', emoji: '📋' },
  { days: 20, label: 'Order online', emoji: '🛒' },
  { days: 7,  label: 'Buy in store', emoji: '🏪' },
  { days: 3,  label: 'Wrap & card', emoji: '🎁' },
  { days: 1,  label: 'Final touch', emoji: '✨' },
  { days: 0,  label: 'Give!', emoji: '🎉' },
];

function getCurrentStep(daysLeft) {
  if (daysLeft <= 0) return 5;
  if (daysLeft <= 1) return 4;
  if (daysLeft <= 3) return 3;
  if (daysLeft <= 7) return 2;
  if (daysLeft <= 20) return 1;
  if (daysLeft <= 30) return 0;
  return -1; // before planning window
}

export default function GiftTimeline({ daysLeft }) {
  const currentStep = getCurrentStep(daysLeft);
  const isBeforeWindow = daysLeft > 30;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-heading font-semibold text-sm text-foreground">Gift journey</p>
        <span className="text-xs text-muted-foreground">
          {daysLeft <= 0 ? "Today's the day! 🎉" : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-moss to-terracotta"
            style={{
              width: isBeforeWindow
                ? '0%'
                : currentStep >= 5
                  ? '100%'
                  : `${(currentStep / (MILESTONES.length - 1)) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Milestone dots */}
      <div className="flex items-start justify-between">
        {MILESTONES.map((m, i) => {
          const done = currentStep > i;
          const active = currentStep === i;
          return (
            <div key={m.days} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                done
                  ? 'bg-moss text-white'
                  : active
                    ? 'bg-terracotta text-white ring-2 ring-terracotta/30'
                    : 'bg-muted text-muted-foreground'
              }`}>
                {done ? '✓' : m.emoji}
              </div>
              <span className={`text-center leading-tight font-body ${active ? 'text-terracotta font-semibold' : 'text-muted-foreground'}`}
                style={{ fontSize: '9px' }}>
                {m.label}
              </span>
              <span className="text-muted-foreground" style={{ fontSize: '8px' }}>
                {m.days === 0 ? 'Day' : `${m.days}d`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contextual tip */}
      {currentStep === 4 && (
        <div className="mt-3 bg-terracotta/10 rounded-xl px-3 py-2">
          <p className="text-xs text-terracotta font-heading font-semibold">Tomorrow's the day!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Think about what they'd most appreciate hearing from you. A heartfelt note goes a long way.</p>
        </div>
      )}
      {currentStep === 5 && (
        <div className="mt-3 bg-moss/10 rounded-xl px-3 py-2">
          <p className="text-xs text-moss font-heading font-semibold">🎉 It's the big day!</p>
          <p className="text-xs text-muted-foreground mt-0.5">Be fully present. Put your phone away. They'll remember how you made them feel.</p>
        </div>
      )}
    </div>
  );
}