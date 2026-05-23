import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus } from 'lucide-react';
import { daysUntil, urgencyColor, formatEventDate } from '@/lib/dateUtils';
import PriorityBadge from '@/components/PriorityBadge';

export default function EventsList() {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('event_date'),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-accent text-ink-soft text-lg">your occasions</p>
          <h1 className="font-heading font-bold text-2xl text-ink">All Events</h1>
        </div>
        <Link
          to="/events/new"
          className="flex items-center gap-2 bg-terracotta text-white px-4 py-2 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" /> Add
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-sand-200 rounded-2xl animate-pulse" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="font-accent text-2xl text-ink-soft mb-2">nothing yet</p>
          <p className="text-ink-soft mb-4">Add your first occasion to get started.</p>
          <Link to="/events/new" className="inline-flex items-center gap-2 bg-terracotta text-white px-5 py-2.5 rounded-full font-heading font-semibold text-sm hover:bg-terracotta-dark transition-all hover:-translate-y-0.5">
            <Plus className="w-4 h-4" /> Add occasion
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => {
            const days = daysUntil(event.event_date);
            return (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center gap-3 bg-white border border-sand-300 rounded-2xl p-4 hover:border-terracotta/40 transition-all hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-heading font-semibold text-ink">{event.recipient_name}</span>
                    <PriorityBadge priority={event.priority} />
                  </div>
                  <span className="text-sm text-ink-soft capitalize">{event.occasion?.replace(/_/g, ' ')} · {formatEventDate(event.event_date)}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${urgencyColor(days)}`}>
                    {days === null ? '' : days < 0 ? 'Past' : days === 0 ? 'Today' : `${days}d`}
                  </span>
                  {event.budget > 0 && (
                    <div className="text-xs text-ink-soft">${event.budget}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}