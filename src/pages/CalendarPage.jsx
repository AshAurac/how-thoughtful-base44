import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, parseISO, isValid } from 'date-fns';
import PriorityBadge from '@/components/PriorityBadge';

const PRIORITY_COLORS = {
  high: 'bg-terracotta',
  medium: 'bg-butter',
  low: 'bg-sand-300',
  free: 'bg-moss',
};

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list('event_date'),
  });

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  const eventsOnDay = (day) =>
    events.filter(e => {
      const d = parseISO(e.event_date);
      return isValid(d) && isSameDay(d, day);
    });

  const selectedEvents = selectedDay ? eventsOnDay(selectedDay) : [];

  return (
    <div className="space-y-5">
      <div>
        <p className="font-accent text-ink-soft text-lg">plan ahead</p>
        <h1 className="font-heading font-bold text-2xl text-ink">Calendar</h1>
      </div>

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-2 rounded-full hover:bg-sand-200 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-ink" />
        </button>
        <h2 className="font-heading font-semibold text-ink text-lg">
          {format(current, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-2 rounded-full hover:bg-sand-200 transition-all"
        >
          <ChevronRight className="w-5 h-5 text-ink" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1">
        {['S','M','T','W','T','F','S'].map((d, i) => (
          <div key={i} className="text-center text-xs text-ink-soft font-medium py-1">{d}</div>
        ))}
        {/* Padding */}
        {Array.from({ length: startPad }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map(day => {
          const dayEvents = eventsOnDay(day);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          const isToday = isSameDay(day, new Date());
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(isSameDay(day, selectedDay) ? null : day)}
              className={`flex flex-col items-center py-1.5 rounded-xl transition-all ${
                isSelected ? 'bg-terracotta text-white' :
                isToday ? 'bg-sand-200 text-ink font-semibold' :
                'hover:bg-sand-100 text-ink'
              }`}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {dayEvents.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.slice(0, 3).map((e, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : PRIORITY_COLORS[e.priority] || 'bg-ink-soft'}`}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div>
          <h3 className="font-heading font-semibold text-ink mb-3">
            {format(selectedDay, 'MMMM d')}
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(event => (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="flex items-center gap-3 bg-white border border-sand-300 rounded-2xl p-3 hover:border-terracotta/40 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-ink">{event.recipient_name}</p>
                    <p className="text-sm text-ink-soft capitalize">{event.occasion?.replace(/_/g, ' ')}</p>
                  </div>
                  <PriorityBadge priority={event.priority} />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}