import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { computeBuyDates } from '@/lib/dateUtils';
import { LOVE_LANGUAGES } from '@/lib/catalogs';
import NativePicker from '@/components/NativePicker';

const OCCASIONS = ['birthday','anniversary','holiday','graduation','baby_shower','wedding','housewarming','thank_you','just_because','other'];
const PRIORITIES = ['free','low','medium','high'];

export default function NewEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    recipient_name: '', occasion: 'birthday', event_date: '',
    budget: '', priority: 'medium', recurring: false,
    notes: '', reflection: '', love_language: '', age_or_years: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const mutation = useMutation({
    mutationFn: async (data) => {
      const buyDates = data.event_date ? computeBuyDates(data.event_date) : {};
      return base44.entities.Event.create({ ...data, ...buyDates, reminders_sent: [] });
    },
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Occasion added');
      navigate(`/events/${event.id}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.recipient_name || !form.event_date) {
      toast.error('Please fill in the required fields');
      return;
    }
    mutation.mutate({
      ...form,
      budget: form.budget ? parseFloat(form.budget) : 0,
      age_or_years: form.age_or_years ? parseInt(form.age_or_years) : null,
    });
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-sand-200 transition-all">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div>
          <p className="font-accent text-ink-soft">new</p>
          <h1 className="font-heading font-bold text-2xl text-ink">Add Occasion</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Who is this for? *</label>
          <input
            value={form.recipient_name}
            onChange={e => set('recipient_name', e.target.value)}
            placeholder="e.g. Mom, Alex, Sarah"
            className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Occasion *</label>
            <NativePicker
              label="Occasion"
              value={form.occasion}
              onChange={v => set('occasion', v)}
              options={OCCASIONS.map(o => ({ value: o, label: o.replace(/_/g, ' ') }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Priority</label>
            <NativePicker
              label="Priority"
              value={form.priority}
              onChange={v => set('priority', v)}
              options={PRIORITIES.map(p => ({ value: p, label: p }))}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Date *</label>
          <input
            type="date"
            value={form.event_date}
            onChange={e => set('event_date', e.target.value)}
            className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Budget ($)</label>
            <input
              type="number"
              value={form.budget}
              onChange={e => set('budget', e.target.value)}
              placeholder="0"
              className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Age / Years</label>
            <input
              type="number"
              value={form.age_or_years}
              onChange={e => set('age_or_years', e.target.value)}
              placeholder="Optional"
              className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Their love language</label>
          <NativePicker
            label="Love language"
            value={form.love_language}
            onChange={v => set('love_language', v)}
            options={[{ value: '', label: 'Not sure' }, ...LOVE_LANGUAGES.map(l => ({ value: l.value, label: l.label }))]}
            placeholder="Not sure"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Ideas, context, anything..."
            rows={3}
            className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="recurring"
            checked={form.recurring}
            onChange={e => set('recurring', e.target.checked)}
            className="w-4 h-4 accent-terracotta"
          />
          <label htmlFor="recurring" className="text-sm text-ink font-body">Repeats every year</label>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-terracotta text-white py-4 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Add occasion'}
        </button>
      </form>
    </div>
  );
}