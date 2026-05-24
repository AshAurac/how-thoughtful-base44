import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Plus, Sparkles, ChevronRight, Package } from 'lucide-react';
import { getUpcomingEvents, daysUntil, urgencyColor, formatEventDate } from '@/lib/dateUtils';
import PriorityBadge from '@/components/PriorityBadge';
import ProfileNudge from '@/components/ProfileNudge';
import ActionQueue from '@/components/ActionQueue';

export default function Dashboard({ user }) {
  const queryClient = useQueryClient();
  const [showNudge, setShowNudge] = useState(false);
  const [activeTab, setActiveTab] = useState('priority');

  const { onTouchStart, onTouchMove, onTouchEnd, indicatorRef } = usePullToRefresh(async () => {
    await queryClient.invalidateQueries();
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user,
    onSuccess: (data) => {
      if (!data?.profile_completed) setShowNudge(true);
    },
  });

  useEffect(() => {
    if (profile !== undefined && !profile?.profile_completed) {
      setShowNudge(true);
    }
  }, [profile]);

  const { data: events = [] } = useQuery({
    queryKey: ['events', user?.email],
    queryFn: () => base44.entities.Event.filter({ created_by: user?.email }, '-event_date'),
    enabled: !!user?.email,
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts', user?.email],
    queryFn: () => base44.entities.Gift.filter({ created_by: user?.email }),
    enabled: !!user?.email,
  });

  const upcoming = getUpcomingEvents(events);
  const deliveries = gifts.filter(g => g.delivery_status === 'ordered' || g.delivery_status === 'shipped');
  const totalBudget = events.reduce((s, e) => s + (e.budget || 0), 0);
  const totalSpent = gifts.reduce((s, g) => s + (g.price || 0) + (g.shipping_cost || 0), 0);

  return (
    <div
      className="space-y-6"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      <div
        ref={indicatorRef}
        className="flex justify-center pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.2s', marginBottom: '-1.5rem' }}
      >
        <div className="w-6 h-6 border-2 border-terracotta/40 border-t-terracotta rounded-full animate-spin" />
      </div>
      {/* Hero greeting */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="font-accent text-2xl text-muted-foreground mb-1">good to see you</p>
          <h1 className="font-heading font-bold text-3xl text-foreground">
            {upcoming.length > 0
              ? `${upcoming.length} ${upcoming.length === 1 ? 'occasion' : 'occasions'} coming up`
              : 'Nothing upcoming — enjoy the peace'}
          </h1>
        </div>
        <Link
          to="/events/new"
          className="flex items-center gap-2 bg-terracotta text-white px-4 py-2 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> Add
        </Link>
      </div>

      {/* Profile nudge */}
      {showNudge && <ProfileNudge />}

      {/* Budget snapshot */}
      {totalBudget > 0 && (
        <Link to="/budget" className="block bg-card border border-border rounded-2xl p-4 hover:border-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-accent text-muted-foreground text-base">this year's giving</span>
            <ChevronRight className="w-4 h-4 text-ink-soft" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-foreground">${totalSpent.toFixed(0)}</span>
            <span className="text-muted-foreground text-sm">of ${totalBudget.toFixed(0)} planned</span>
          </div>
          <div className="mt-2 h-1.5 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
            />
          </div>
        </Link>
      )}

      {/* Tabbed views: Coming up / Priority */}
      <div>
        <div className="flex bg-sand-200 rounded-full p-1 gap-1 mb-4">
          <button
            onClick={() => setActiveTab('priority')}
            className={`flex-1 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
              activeTab === 'priority' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Priority
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
              activeTab === 'upcoming' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Coming up
          </button>
        </div>

        {activeTab === 'upcoming' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-semibold text-lg text-foreground">Coming up</h2>
              <Link to="/events/new" className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark font-medium">
                <Plus className="w-4 h-4" /> Add
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div className="bg-muted border border-border rounded-2xl p-6 text-center">
                <p className="font-accent text-xl text-muted-foreground mb-2">nothing on the horizon</p>
                <p className="text-sm text-muted-foreground mb-4">Add your first occasion and never panic-buy again.</p>
                <Link
                  to="/events/new"
                  className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" /> Add an occasion
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(event => {
                  const days = daysUntil(event.event_date);
                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4 hover:border-terracotta/40 transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-heading font-semibold text-foreground truncate">{event.recipient_name}</span>
                          <PriorityBadge priority={event.priority} />
                        </div>
                        <span className="text-sm text-muted-foreground capitalize">{event.occasion?.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${urgencyColor(days)}`}>
                          {days === 0 ? 'Today!' : days < 0 ? 'Past' : `${days}d`}
                        </span>
                        <div className="text-xs text-muted-foreground">{formatEventDate(event.event_date)}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'priority' && (
          events.length > 0
            ? <ActionQueue events={events} gifts={gifts} />
            : (
              <div className="bg-muted border border-border rounded-2xl p-6 text-center">
                <p className="font-accent text-xl text-muted-foreground mb-2">nothing to prioritise</p>
                <p className="text-sm text-muted-foreground">Add occasions to see your action queue here.</p>
              </div>
            )
        )}
      </div>

      {/* Deliveries strip */}
      {deliveries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-lg text-foreground">On the way</h2>
            <Link to="/deliveries" className="text-sm text-terracotta hover:text-terracotta-dark font-medium">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {deliveries.map(g => (
              <div key={g.id} className="flex-none w-44 bg-card border border-border rounded-2xl p-3">
                <Package className="w-4 h-4 text-moss mb-2" />
                <p className="font-body font-medium text-sm text-foreground truncate">{g.name}</p>
                <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-full ${
                  g.delivery_status === 'shipped' ? 'bg-butter/30 text-butter-dark' : 'bg-sand-200 text-ink-soft'
                }`}>
                  {g.delivery_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspire me CTA */}
      <Link
        to="/ideas"
        className="flex items-center justify-center gap-2 w-full bg-ink text-white py-4 rounded-2xl font-heading font-semibold hover:bg-ink/90 transition-all hover:-translate-y-0.5"
      >
        <Sparkles className="w-5 h-5 text-butter" />
        Inspire me with gift ideas
      </Link>
    </div>
  );
}