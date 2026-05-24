import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Gift } from 'lucide-react';
import { formatEventDate } from '@/lib/dateUtils';

export default function RecipientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: recipient } = useQuery({
    queryKey: ['recipient', id],
    queryFn: async () => {
      const list = await base44.entities.Recipient.filter({ id });
      return list[0];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
  });

  const recipientEvents = events.filter(e => e.recipient_id === id || e.recipient_name === recipient?.name);
  const eventIds = new Set(recipientEvents.map(e => e.id));
  const recipientGifts = gifts.filter(g => eventIds.has(g.event_id));
  const totalSpent = recipientGifts.reduce((s, g) => s + (g.price || 0), 0);

  if (!recipient) return <div className="h-32 bg-sand-200 rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="mt-1 p-2 rounded-full hover:bg-sand-200 transition-all">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-12 rounded-full bg-terracotta/10 flex items-center justify-center text-terracotta font-heading font-bold text-xl">
              {recipient.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="font-heading font-bold text-2xl text-foreground">{recipient.name}</h1>
              {recipient.relationship && (
                <p className="text-sm text-muted-foreground capitalize">{recipient.relationship}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-sand-300 rounded-2xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-foreground">{recipientEvents.length}</p>
          <p className="text-xs text-muted-foreground">occasions</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-foreground">{recipientGifts.filter(g => g.bought).length}</p>
          <p className="text-xs text-muted-foreground">gifts given</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-3 text-center">
          <p className="font-heading font-bold text-xl text-terracotta">${Math.round(totalSpent)}</p>
          <p className="text-xs text-muted-foreground">total spent</p>
        </div>
      </div>

      {/* Love language + interests */}
      {(recipient.love_language || (recipient.interests || []).length > 0) && (
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 space-y-2">
          {recipient.love_language && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Love language:</span>
              <span className="text-xs bg-card border border-border px-2.5 py-1 rounded-full text-foreground capitalize">
                {recipient.love_language.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {recipient.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipient.interests.map(i => (
                <span key={i} className="text-xs bg-card border border-border px-2.5 py-1 rounded-full text-foreground">
                  {i}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Events */}
      <div>
        <h2 className="font-heading font-semibold text-lg text-foreground mb-3">Occasions</h2>
        {recipientEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events yet for {recipient.name}.</p>
        ) : (
          <div className="space-y-2">
            {recipientEvents.map(event => (
              <a
                key={event.id}
                href={`/events/${event.id}`}
                className="flex items-center gap-3 bg-white border border-sand-300 rounded-2xl p-3 hover:border-terracotta/40 transition-all"
              >
                <Gift className="w-4 h-4 text-terracotta" />
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm capitalize">{event.occasion?.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{formatEventDate(event.event_date)}</p>
                </div>
                {event.budget > 0 && <span className="text-xs text-muted-foreground">${event.budget}</span>}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}