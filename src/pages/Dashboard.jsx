import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Plus, Sparkles, ChevronRight, Package } from 'lucide-react';
import { getUpcomingEvents, daysUntil, urgencyColor, formatEventDate } from '@/lib/dateUtils';
import PriorityBadge from '@/components/PriorityBadge';

export default function Dashboard({ user }) {
  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('-event_date'),
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
  });

  const upcoming = getUpcomingEvents(events);
  const deliveries = gifts.filter(g => g.delivery_status === 'ordered' || g.delivery_status === 'shipped');
  const totalBudget = events.reduce((s, e) => s + (e.budget || 0), 0);
  const totalSpent = gifts.reduce((s, g) => s + (g.price || 0) + (g.shipping_cost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hero greeting */}
      <div>
        <p className="font-accent text-2xl text-ink-soft mb-1">good to see you</p>
        <h1 className="font-heading font-bold text-3xl text-ink">
          {upcoming.length > 0
            ? `${upcoming.length} ${upcoming.length === 1 ? 'occasion' : 'occasions'} coming up`
            : 'Nothing upcoming — enjoy the peace'}
        </h1>
      </div>

      {/* Budget snapshot */}
      {totalBudget > 0 && (
        <Link to="/budget" className="block bg-white border border-sand-300 rounded-2xl p-4 hover:border-terracotta/40 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="font-accent text-ink-soft text-base">this year's giving</span>
            <ChevronRight className="w-4 h-4 text-ink-soft" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-bold text-2xl text-ink">${totalSpent.toFixed(0)}</span>
            <span className="text-ink-soft text-sm">of ${totalBudget.toFixed(0)} planned</span>
          </div>
          <div className="mt-2 h-1.5 bg-sand-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-terracotta rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
            />
          </div>
        </Link>
      )}

      {/* Upcoming events */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-lg text-ink">Coming up</h2>
          <Link to="/events/new" className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark font-medium">
            <Plus className="w-4 h-4" /> Add
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="bg-sand-100 border border-sand-300 rounded-2xl p-6 text-center">
            <p className="font-accent text-xl text-ink-soft mb-2">nothing on the horizon</p>
            <p className="text-sm text-ink-soft mb-4">Add your first occasion and never panic-buy again.</p>
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
                  className="flex items-center gap-3 bg-white border border-sand-300 rounded-2xl p-4 hover:border-terracotta/40 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-heading font-semibold text-ink truncate">{event.recipient_name}</span>
                      <PriorityBadge priority={event.priority} />
                    </div>
                    <span className="text-sm text-ink-soft capitalize">{event.occasion?.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${urgencyColor(days)}`}>
                      {days === 0 ? 'Today!' : days < 0 ? 'Past' : `${days}d`}
                    </span>
                    <div className="text-xs text-ink-soft">{formatEventDate(event.event_date)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Deliveries strip */}
      {deliveries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-lg text-ink">On the way</h2>
            <Link to="/deliveries" className="text-sm text-terracotta hover:text-terracotta-dark font-medium">See all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {deliveries.map(g => (
              <div key={g.id} className="flex-none w-44 bg-white border border-sand-300 rounded-2xl p-3">
                <Package className="w-4 h-4 text-moss mb-2" />
                <p className="font-body font-medium text-sm text-ink truncate">{g.name}</p>
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