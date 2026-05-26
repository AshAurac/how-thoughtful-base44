import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Plus, Sparkles, Package, Mail, ChevronDown, ChevronRight } from 'lucide-react';
import { getUpcomingEvents, daysUntil, urgencyColor, formatEventDate } from '@/lib/dateUtils';
import PriorityBadge from '@/components/PriorityBadge';
import ProfileNudge from '@/components/ProfileNudge';
import ActionQueue from '@/components/ActionQueue';

function groupByMonth(events) {
  const groups = {};
  events.forEach(event => {
    const d = new Date(event.event_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!groups[key]) groups[key] = { label, events: [] };
    groups[key].events.push(event);
  });
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}

function UpcomingByMonth({ upcoming }) {
  const groups = groupByMonth(upcoming);
  // Auto-open the first group (soonest month)
  const [openGroups, setOpenGroups] = useState(() => groups.length > 0 ? { [groups[0][0]]: true } : {});

  const toggle = (key) => setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));

  if (upcoming.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-2">
      {groups.map(([key, { label, events }]) => {
        const isOpen = !!openGroups[key];
        return (
          <div key={key} className="border border-border rounded-2xl overflow-hidden">
            <button
              onClick={() => toggle(key)}
              className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-muted transition-all"
            >
              <div className="flex items-center gap-2">
                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <span className="font-heading font-semibold text-foreground">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground">{events.length} {events.length === 1 ? 'occasion' : 'occasions'}</span>
            </button>
            {isOpen && (
              <div className="divide-y divide-border">
                {events.map(event => {
                  const days = daysUntil(event.event_date);
                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="flex items-center gap-3 bg-card px-4 py-3 hover:bg-muted transition-all"
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
          </div>
        );
      })}
    </div>
  );
}

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

  const { data: ownEvents = [] } = useQuery({
    queryKey: ['events', user?.email],
    queryFn: () => base44.entities.Event.filter({ created_by: user?.email }, '-event_date'),
    enabled: !!user?.email,
  });

  const { data: sharedEvents = [] } = useQuery({
    queryKey: ['sharedEvents', user?.email],
    queryFn: () => base44.entities.Event.filter({ collaborator_emails: user?.email }, '-event_date'),
    enabled: !!user?.email,
  });

  const ownIds = new Set(ownEvents.map(e => e.id));
  const events = [...ownEvents, ...sharedEvents.filter(e => !ownIds.has(e.id))];

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



      {/* Tabbed views: Coming up / Priority */}
      <div>
        <div className="flex bg-sand-200 dark:bg-muted rounded-full p-1 gap-1 mb-4">
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
          <UpcomingByMonth upcoming={upcoming} />
        )}

        {activeTab === 'priority' && (
          <>
            {/* Email verification nudge */}
            {!localStorage.getItem('email_verified') && (
              <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-terracotta" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-heading font-semibold text-foreground">Verify your email</p>
                  <p className="text-xs text-muted-foreground">Make sure reminders reach you</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => localStorage.setItem('email_verified', '1')}
                  className="shrink-0 text-xs font-heading font-semibold text-terracotta border border-terracotta/40 px-3 py-1.5 rounded-full hover:bg-terracotta hover:text-white transition-all"
                >
                  Go →
                </Link>
              </div>
            )}
            {events.length > 0
              ? <ActionQueue events={events} gifts={gifts} />
              : (
                <div className="bg-muted border border-border rounded-2xl p-6 text-center">
                  <p className="font-accent text-xl text-muted-foreground mb-2">nothing to prioritise</p>
                  <p className="text-sm text-muted-foreground">Add occasions to see your action queue here.</p>
                </div>
              )
            }
          </>
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