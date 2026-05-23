import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Check, ShoppingBag, Gift, Mail, Send, Sparkles, Lightbulb } from 'lucide-react';
import { formatEventDate, daysUntil } from '@/lib/dateUtils';
import PriorityBadge from '@/components/PriorityBadge';

function GiftCheckbox({ checked, onChange, label }) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all border ${
        checked
          ? 'bg-moss/20 text-moss-dark border-moss/30'
          : 'bg-sand-100 text-ink-soft border-sand-300 hover:bg-sand-200'
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${checked ? 'bg-moss border-moss' : 'border-sand-300'}`}>
        {checked && <Check className="w-2.5 h-2.5 text-white" />}
      </div>
      {label}
    </button>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddGift, setShowAddGift] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', price: '', description: '', link: '' });
  const [reflection, setReflection] = useState('');
  const [editingReflection, setEditingReflection] = useState(false);

  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['event', id],
    queryFn: () => base44.entities.Event.filter({ id }),
    select: data => data[0],
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts', id],
    queryFn: () => base44.entities.Gift.filter({ event_id: id }),
  });

  const updateEventMutation = useMutation({
    mutationFn: (data) => base44.entities.Event.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['event', id] }),
  });

  const addGiftMutation = useMutation({
    mutationFn: (data) => base44.entities.Gift.create({ ...data, event_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', id] });
      setShowAddGift(false);
      setNewGift({ name: '', price: '', description: '', link: '' });
      toast.success('Gift added');
    },
  });

  const updateGiftMutation = useMutation({
    mutationFn: ({ giftId, data }) => base44.entities.Gift.update(giftId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts', id] }),
  });

  const deleteGiftMutation = useMutation({
    mutationFn: (giftId) => base44.entities.Gift.delete(giftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts', id] });
      toast.success('Gift removed');
    },
  });

  if (loadingEvent) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-sand-200 rounded-2xl animate-pulse" />)}</div>;
  }
  if (!event) return <div className="text-center py-12 text-ink-soft">Event not found</div>;

  const days = daysUntil(event.event_date);

  const timeline = [
    { label: 'Order online by', date: event.buy_online_by, days: daysUntil(event.buy_online_by) },
    { label: 'Buy locally by', date: event.buy_local_by, days: daysUntil(event.buy_local_by) },
    { label: 'Wrap by', date: event.wrap_by, days: daysUntil(event.wrap_by) },
  ].filter(t => t.date);

  const handleGiftCheck = (gift, field) => {
    updateGiftMutation.mutate({ giftId: gift.id, data: { [field]: !gift[field] } });
  };

  const handleAddGift = (e) => {
    e.preventDefault();
    if (!newGift.name) { toast.error('Gift needs a name'); return; }
    addGiftMutation.mutate({ ...newGift, price: newGift.price ? parseFloat(newGift.price) : 0 });
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="mt-1 p-2 rounded-full hover:bg-sand-200 transition-all">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex-1">
          <p className="font-accent text-ink-soft text-lg">{event.occasion?.replace(/_/g, ' ')}</p>
          <h1 className="font-heading font-bold text-2xl text-ink">{event.recipient_name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <PriorityBadge priority={event.priority} />
            <span className="text-sm text-ink-soft">{formatEventDate(event.event_date)}</span>
            {days !== null && days >= 0 && (
              <span className={`text-sm font-medium ${days <= 7 ? 'text-terracotta' : 'text-ink-soft'}`}>
                {days === 0 ? 'Today!' : `${days} days away`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Buy-by timeline */}
      {timeline.length > 0 && (
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4">
          <p className="font-accent text-ink-soft mb-3">buy-by timeline</p>
          <div className="space-y-2">
            {timeline.map(t => (
              <div key={t.label} className="flex items-center justify-between">
                <span className="text-sm text-ink font-medium">{t.label}</span>
                <span className={`text-sm font-medium ${
                  t.days !== null && t.days <= 3 ? 'text-terracotta' :
                  t.days !== null && t.days <= 7 ? 'text-butter-dark' : 'text-ink-soft'
                }`}>
                  {t.days !== null && t.days < 0 ? 'Passed' : t.days === 0 ? 'Today' : t.days !== null ? `in ${t.days}d` : formatEventDate(t.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gifts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-lg text-ink">Gifts</h2>
          <button
            onClick={() => setShowAddGift(v => !v)}
            className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark font-medium"
          >
            <Plus className="w-4 h-4" /> Add gift
          </button>
        </div>

        {showAddGift && (
          <form onSubmit={handleAddGift} className="bg-sand-100 border border-sand-300 rounded-2xl p-4 mb-3 space-y-3">
            <input
              value={newGift.name}
              onChange={e => setNewGift(g => ({ ...g, name: e.target.value }))}
              placeholder="Gift name *"
              className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={newGift.price}
                onChange={e => setNewGift(g => ({ ...g, price: e.target.value }))}
                placeholder="Price ($)"
                className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
              />
              <input
                value={newGift.link}
                onChange={e => setNewGift(g => ({ ...g, link: e.target.value }))}
                placeholder="Link (optional)"
                className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-terracotta text-white py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all">
                Add
              </button>
              <button type="button" onClick={() => setShowAddGift(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-sand-200 transition-all">
                Cancel
              </button>
            </div>
          </form>
        )}

        {gifts.length === 0 && !showAddGift ? (
          <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 text-center">
            <p className="text-sm text-ink-soft">No gifts yet. Add one above or get ideas below.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {gifts.map(gift => (
              <div key={gift.id} className="bg-white border border-sand-300 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-heading font-semibold text-ink">{gift.name}</p>
                    {gift.price > 0 && <p className="text-sm text-ink-soft">${gift.price}</p>}
                    {gift.link && (
                      <a href={gift.link} target="_blank" rel="noreferrer" className="text-xs text-terracotta hover:underline">View link</a>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGiftMutation.mutate(gift.id)}
                    className="p-1.5 rounded-full hover:bg-sand-100 text-ink-soft hover:text-terracotta transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <GiftCheckbox checked={gift.bought} onChange={() => handleGiftCheck(gift, 'bought')} label="Bought" />
                  <GiftCheckbox checked={gift.wrapped} onChange={() => handleGiftCheck(gift, 'wrapped')} label="Wrapped" />
                  <GiftCheckbox checked={gift.card_written} onChange={() => handleGiftCheck(gift, 'card_written')} label="Card" />
                  <GiftCheckbox checked={gift.sent} onChange={() => handleGiftCheck(gift, 'sent')} label="Sent" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Get ideas buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/ideas?event_id=${event.id}&recipient=${encodeURIComponent(event.recipient_name)}`}
          className="flex items-center justify-center gap-2 bg-ink text-white py-3 rounded-2xl font-heading font-semibold text-sm hover:bg-ink/90 transition-all hover:-translate-y-0.5"
        >
          <Sparkles className="w-4 h-4 text-butter" />
          AI ideas
        </Link>
        <Link
          to={`/ideas?event_id=${event.id}&recipient=${encodeURIComponent(event.recipient_name)}&tab=curated`}
          className="flex items-center justify-center gap-2 bg-sand-100 border border-sand-300 text-ink py-3 rounded-2xl font-heading font-semibold text-sm hover:bg-sand-200 transition-all hover:-translate-y-0.5"
        >
          <Lightbulb className="w-4 h-4 text-moss" />
          Free ideas
        </Link>
      </div>

      {/* Reflection */}
      <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4">
        <p className="font-accent text-ink-soft mb-2">a moment of gratitude</p>
        {editingReflection ? (
          <div className="space-y-2">
            <textarea
              value={reflection || event.reflection || ''}
              onChange={e => setReflection(e.target.value)}
              placeholder="What do you appreciate about this person? (20 seconds is enough)"
              rows={3}
              className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  updateEventMutation.mutate({ reflection: reflection || event.reflection });
                  setEditingReflection(false);
                  toast.success('Saved');
                }}
                className="flex-1 bg-terracotta text-white py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all"
              >
                Save
              </button>
              <button onClick={() => setEditingReflection(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-sand-200 transition-all">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div onClick={() => { setReflection(event.reflection || ''); setEditingReflection(true); }} className="cursor-pointer">
            {event.reflection ? (
              <p className="text-sm text-ink italic">"{event.reflection}"</p>
            ) : (
              <p className="text-sm text-ink-soft">Tap to write a 20-second note about why you're grateful for them.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}