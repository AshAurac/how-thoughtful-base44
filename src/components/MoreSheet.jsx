import { Link } from 'react-router-dom';
import { Users, PiggyBank, Package, Bookmark, Star, User, Heart, X, Gift } from 'lucide-react';

const items = [
  { path: '/recipients', icon: Users, label: 'People', color: 'text-moss' },
  { path: '/budget', icon: PiggyBank, label: 'Budget', color: 'text-butter-dark' },
  { path: '/deliveries', icon: Package, label: 'Deliveries', color: 'text-terracotta' },
  { path: '/saved', icon: Bookmark, label: 'Saved Ideas', color: 'text-terracotta' },
  { path: '/group-lists', icon: Gift, label: 'Group Lists', color: 'text-moss' },
  { path: '/restock', icon: Star, label: 'Restock', color: 'text-butter-dark' },
  { path: '/wishlist', icon: Heart, label: 'My Wishlist', color: 'text-moss' },
  { path: '/year-in-giving', icon: Star, label: 'Year in Giving', color: 'text-terracotta' },
  { path: '/profile', icon: User, label: 'Profile', color: 'text-ink-soft' },
];

export default function MoreSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
      <div
        className="relative w-full bg-white rounded-t-3xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-heading font-bold text-ink text-lg">More</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-sand-100">
            <X className="w-5 h-5 text-ink-soft" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {items.map(({ path, icon: Icon, label, color }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-sand-100 transition-all"
            >
              <div className="w-12 h-12 rounded-2xl bg-sand-100 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <span className="text-xs text-ink-soft font-body text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}