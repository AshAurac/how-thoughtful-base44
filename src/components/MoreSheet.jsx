import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, PiggyBank, Package, Bookmark, Star, User, Heart, X, Gift, Lock } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import FeatureUnlockSheet from './FeatureUnlockSheet';

// Always-visible items (no lock)
const FREE_ITEMS = [
  { path: '/recipients', icon: Users, label: 'People', color: 'text-moss' },
  { path: '/profile', icon: User, label: 'Profile', color: 'text-muted-foreground' },
];

// Feature-gated items
const GATED_ITEMS = [
  { path: '/budget',         icon: PiggyBank, label: 'Budget',         color: 'text-butter-dark', featureKey: 'feature_budget' },
  { path: '/deliveries',     icon: Package,   label: 'Deliveries',     color: 'text-terracotta',  featureKey: 'feature_deliveries' },
  { path: '/saved',          icon: Bookmark,  label: 'Saved Ideas',    color: 'text-terracotta',  featureKey: 'feature_saved' },
  { path: '/group-lists',    icon: Gift,      label: 'Group Gifting',  color: 'text-moss',        featureKey: 'feature_group_lists' },
  { path: '/restock',        icon: Star,      label: 'Restock',        color: 'text-butter-dark', featureKey: 'feature_restock' },
  { path: '/wishlist',       icon: Heart,     label: 'My Wishlist',    color: 'text-moss',        featureKey: 'feature_wishlist' },
  { path: '/year-in-giving', icon: Star,      label: 'Year in Giving', color: 'text-terracotta',  featureKey: 'feature_year_in_giving' },
];

export default function MoreSheet({ open, onClose }) {
  const { user } = useAuth();
  const { isUnlocked, unlock } = useFeatureFlags(user);
  const [lockedFeature, setLockedFeature] = useState(null);
  const navigate = useNavigate();

  if (!open) return null;

  const unlockedGated = GATED_ITEMS.filter(i => isUnlocked(i.featureKey));
  const lockedGated = GATED_ITEMS.filter(i => !isUnlocked(i.featureKey));

  const handleLockedClick = (e, featureKey) => {
    e.preventDefault();
    setLockedFeature(featureKey);
  };

  const handleUnlock = (key) => {
    unlock(key);
    // Navigate after a brief moment to let the sheet close
    const item = GATED_ITEMS.find(i => i.featureKey === key);
    if (item) setTimeout(() => { onClose(); navigate(item.path); }, 150);
  };

  const allItems = [...FREE_ITEMS, ...unlockedGated];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end select-none" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div
          className="relative w-full bg-card rounded-t-3xl shadow-2xl"
          style={{ paddingBottom: 'var(--safe-bottom)', paddingLeft: 'var(--safe-left)', paddingRight: 'var(--safe-right)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-bold text-foreground text-lg">More</h3>
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-muted transition-all"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Unlocked items */}
            <div className="grid grid-cols-4 gap-4">
              {allItems.map(({ path, icon: Icon, label, color }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={onClose}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted transition-all min-h-[72px] justify-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs text-muted-foreground font-body text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>

            {/* Locked items hint */}
            {lockedGated.length > 0 && (
              <div className="mt-5 pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground font-heading font-semibold mb-3 flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  More to unlock as you explore
                </p>
                <div className="grid grid-cols-4 gap-4">
                  {lockedGated.map(({ path, icon: Icon, label, featureKey }) => (
                    <button
                      key={path}
                      onClick={e => handleLockedClick(e, featureKey)}
                      className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all min-h-[72px] justify-center opacity-40 hover:opacity-60"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center relative">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background border border-border flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-body text-center leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {lockedFeature && (
        <FeatureUnlockSheet
          featureKey={lockedFeature}
          onUnlock={handleUnlock}
          onClose={() => setLockedFeature(null)}
        />
      )}
    </>
  );
}