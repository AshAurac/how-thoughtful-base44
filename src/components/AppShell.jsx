import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Sparkles, Leaf, MoreHorizontal, Heart } from 'lucide-react';
import { useState } from 'react';
import MoreSheet from './MoreSheet';
import PageTransition from './PageTransition';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/ideas', icon: Sparkles, label: 'Ideas' },
  { path: '/season', icon: Leaf, label: 'Season' },
];

export default function AppShell({ children, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  const handleNavClick = (path, e) => {
    // Reset to root: if already on this tab, scroll to top; if navigating, go there
    if (location.pathname === path) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen bg-background"
      style={{ paddingBottom: 'calc(5rem + var(--safe-bottom))' }}
    >
      {/* Top bar — safe area top */}
      <header
        className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border select-none"
        style={{ paddingTop: 'var(--safe-top)', paddingLeft: 'var(--safe-left)', paddingRight: 'var(--safe-right)' }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity min-h-[44px]"
            onClick={e => handleNavClick('/', e)}
          >
            <div className="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-foreground text-sm">How Thoughtful</span>
          </Link>
          <Link
            to="/profile"
            className="font-accent text-lg text-muted-foreground hover:text-foreground transition-colors min-h-[44px] flex items-center"
          >
            hi, {firstName}
          </Link>
        </div>
      </header>

      {/* Main content — overscroll none */}
      <main
        className="max-w-3xl mx-auto px-4 py-6 overscroll-none"
        style={{ paddingLeft: 'calc(1rem + var(--safe-left))', paddingRight: 'calc(1rem + var(--safe-right))' }}
      >
        <PageTransition>
          {children}
        </PageTransition>
      </main>

      {/* Bottom nav — safe area bottom */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 select-none"
        style={{ paddingBottom: 'var(--safe-bottom)', paddingLeft: 'var(--safe-left)', paddingRight: 'var(--safe-right)' }}
      >
        <div className="flex justify-center pb-3 pt-1">
          <div className="bg-card/90 backdrop-blur-xl border border-border rounded-full px-3 py-1.5 shadow-lg flex items-center gap-0.5">
            {navItems.map(({ path, icon: Icon, label }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={e => handleNavClick(path, e)}
                  className={`flex flex-col items-center px-3 min-w-[56px] min-h-[44px] justify-center rounded-full transition-all select-none ${
                    active
                      ? 'bg-terracotta text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-0.5 font-body">{label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => setShowMore(true)}
              className="flex flex-col items-center px-3 min-w-[56px] min-h-[44px] justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-all select-none"
            >
              <MoreHorizontal className="w-5 h-5" />
              <span className="text-xs mt-0.5 font-body">More</span>
            </button>
          </div>
        </div>
      </nav>

      <MoreSheet open={showMore} onClose={() => setShowMore(false)} />
    </div>
  );
}