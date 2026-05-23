import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Pages
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import NewEvent from './pages/NewEvent';
import EventDetail from './pages/EventDetail';
import CalendarPage from './pages/CalendarPage';
import IdeasPage from './pages/IdeasPage';
import BudgetPage from './pages/BudgetPage';
import YearInGiving from './pages/YearInGiving';
import UpgradePage from './pages/UpgradePage';
import ProfilePage from './pages/ProfilePage';
import RecipientsPage from './pages/RecipientsPage';
import RecipientDetail from './pages/RecipientDetail';
import DeliveriesPage from './pages/DeliveriesPage';
import SavedIdeasPage from './pages/SavedIdeasPage';
import SeasonPage from './pages/SeasonPage';
import WishlistPage from './pages/WishlistPage';
import PublicWishlist from './pages/PublicWishlist';
import RestockPage from './pages/RestockPage';

// Layout
import AppShell from './components/AppShell';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, user } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-sand-200 border-t-terracotta rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Public wishlist — no shell */}
      <Route path="/w/:token" element={<PublicWishlist />} />

      {/* All authenticated pages wrapped in AppShell */}
      <Route path="/" element={<AppShell user={user}><Dashboard user={user} /></AppShell>} />
      <Route path="/events" element={<AppShell user={user}><EventsList /></AppShell>} />
      <Route path="/events/new" element={<AppShell user={user}><NewEvent /></AppShell>} />
      <Route path="/events/:id" element={<AppShell user={user}><EventDetail user={user} /></AppShell>} />
      <Route path="/calendar" element={<AppShell user={user}><CalendarPage /></AppShell>} />
      <Route path="/ideas" element={<AppShell user={user}><IdeasPage user={user} /></AppShell>} />
      <Route path="/budget" element={<AppShell user={user}><BudgetPage /></AppShell>} />
      <Route path="/year-in-giving" element={<AppShell user={user}><YearInGiving user={user} /></AppShell>} />
      <Route path="/upgrade" element={<AppShell user={user}><UpgradePage user={user} /></AppShell>} />
      <Route path="/profile" element={<AppShell user={user}><ProfilePage user={user} /></AppShell>} />
      <Route path="/recipients" element={<AppShell user={user}><RecipientsPage /></AppShell>} />
      <Route path="/recipients/:id" element={<AppShell user={user}><RecipientDetail /></AppShell>} />
      <Route path="/deliveries" element={<AppShell user={user}><DeliveriesPage /></AppShell>} />
      <Route path="/saved" element={<AppShell user={user}><SavedIdeasPage /></AppShell>} />
      <Route path="/season" element={<AppShell user={user}><SeasonPage /></AppShell>} />
      <Route path="/wishlist" element={<AppShell user={user}><WishlistPage user={user} /></AppShell>} />
      <Route path="/restock" element={<AppShell user={user}><RestockPage /></AppShell>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;