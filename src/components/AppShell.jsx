import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Sparkles, Leaf, MoreHorizontal, Gift } from 'lucide-react';
import { useState } from 'react';
import MoreSheet from './MoreSheet';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/ideas', icon: Sparkles, label: 'Ideas' },
  { path: '/season', icon: Leaf, label: 'Season' },
];

export default function AppShell({ children, user }) {
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-sand-50 pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-sand-50/90 backdrop-blur-xl border-b border-sand-300 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-ink text-sm">How Thoughtful</span>
          </div>
          <span className="font-accent text-lg text-ink-soft">hi, {firstName}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/85 backdrop-blur-xl border border-sand-300 rounded-full px-4 py-2 shadow-lg flex items-center gap-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center px-3 py-1.5 rounded-full transition-all ${
                  active
                    ? 'bg-terracotta text-white'
                    : 'text-ink-soft hover:text-ink hover:bg-sand-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-0.5 font-body">{label}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setShowMore(true)}
            className="flex flex-col items-center px-3 py-1.5 rounded-full text-ink-soft hover:text-ink hover:bg-sand-100 transition-all"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs mt-0.5 font-body">More</span>
          </button>
        </div>
      </nav>

      <MoreSheet open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}