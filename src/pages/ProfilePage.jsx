import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { LOVE_LANGUAGES } from '@/lib/catalogs';
import NativePicker from '@/components/NativePicker';

const SKILLS = ['cooking','writing','photography','music','art','gardening','knitting','coding','fitness','yoga','sewing','language','carpentry'];

export default function ProfilePage({ user }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    skills: [], love_languages_give: [], love_languages_receive: [],
    personality: '', work: '', free_text: '', intention: '',
    intention_year: new Date().getFullYear(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [profileId, setProfileId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setProfileId(profile.id);
      setForm({
        skills: profile.skills || [],
        love_languages_give: profile.love_languages_give || [],
        love_languages_receive: profile.love_languages_receive || [],
        personality: profile.personality || '',
        work: profile.work || '',
        free_text: profile.free_text || '',
        intention: profile.intention || '',
        intention_year: profile.intention_year || new Date().getFullYear(),
        timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    }
  }, [profile]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleArray = (key, val) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (profileId) {
        return base44.entities.UserProfile.update(profileId, { ...data, profile_completed: true });
      } else {
        return base44.entities.UserProfile.create({ ...data, profile_completed: true });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile saved');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-sand-200 rounded-2xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <div>
        <p className="font-accent text-ink-soft text-lg">about you</p>
        <h1 className="font-heading font-bold text-2xl text-ink">Your Profile</h1>
        <p className="text-sm text-ink-soft mt-1">This helps generate more personal gift ideas for your style.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Skills */}
        <div>
          <label className="block font-heading font-semibold text-ink mb-2">Your skills & interests</label>
          <div className="flex flex-wrap gap-2">
            {SKILLS.map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleArray('skills', skill)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all capitalize ${
                  form.skills.includes(skill)
                    ? 'bg-terracotta text-white'
                    : 'bg-sand-200 text-ink hover:bg-sand-300'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Love languages — give */}
        <div>
          <label className="block font-heading font-semibold text-ink mb-2">How you love to give</label>
          <div className="flex flex-wrap gap-2">
            {LOVE_LANGUAGES.map(l => (
              <button
                key={l.value}
                type="button"
                onClick={() => toggleArray('love_languages_give', l.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  form.love_languages_give.includes(l.value)
                    ? 'bg-moss text-white'
                    : 'bg-sand-200 text-ink hover:bg-sand-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">What I do for work</label>
          <input
            value={form.work}
            onChange={e => set('work', e.target.value)}
            placeholder="Teacher, designer, parent..."
            className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1">A bit about you</label>
          <textarea
            value={form.free_text}
            onChange={e => set('free_text', e.target.value)}
            placeholder="What makes you you? Helps AI understand your style."
            rows={3}
            className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body resize-none"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Your timezone</label>
          <NativePicker
            label="Your timezone"
            value={form.timezone}
            onChange={v => set('timezone', v)}
            options={Intl.supportedValuesOf('timeZone').map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }))}
            placeholder="Select timezone..."
          />
          <p className="text-xs text-ink-soft mt-1">Used to send reminders at the right time for you.</p>
        </div>

        {/* Yearly intention */}
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4">
          <p className="font-accent text-ink-soft mb-2">this year I want to give more...</p>
          <textarea
            value={form.intention}
            onChange={e => set('intention', e.target.value)}
            placeholder="e.g. handmade gifts, experiences, my time..."
            rows={2}
            className="w-full border border-sand-300 rounded-xl px-3 py-2.5 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body resize-none text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="w-full bg-terracotta text-white py-4 rounded-full font-heading font-semibold hover:bg-terracotta-dark transition-all hover:-translate-y-0.5 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <button
        onClick={() => base44.auth.logout('/')}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full border border-sand-300 text-ink-soft hover:text-ink hover:bg-sand-100 transition-all font-body text-sm select-none min-h-[44px]"
      >
        <LogOut className="w-4 h-4" />
        Log out
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-full border border-destructive/30 text-destructive/70 hover:text-destructive hover:bg-destructive/5 transition-all font-body text-sm select-none min-h-[44px]"
      >
        <Trash2 className="w-4 h-4" />
        Delete account
      </button>

      {/* Delete account confirmation sheet */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-card rounded-t-3xl shadow-2xl px-6 py-6"
            style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <h3 className="font-heading font-bold text-foreground text-xl text-center mb-2">Delete your account?</h3>
            <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
              This will permanently delete all your events, recipients, gifts, and profile data. This cannot be undone.
            </p>
            <div className="space-y-3">
              <button
                onClick={async () => {
                  try {
                    if (profileId) await base44.entities.UserProfile.delete(profileId);
                    await base44.auth.logout('/welcome');
                  } catch {
                    toast.error('Could not delete account. Please contact support.');
                  }
                }}
                className="w-full bg-destructive text-destructive-foreground py-4 rounded-full font-heading font-semibold transition-all hover:opacity-90 select-none min-h-[44px]"
              >
                Yes, delete my account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full border border-border text-foreground py-4 rounded-full font-heading font-semibold hover:bg-muted transition-all select-none min-h-[44px]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}