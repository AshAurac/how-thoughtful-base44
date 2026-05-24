import { useState } from 'react';
import { Users, X, Send, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function ShareEventButton({ eventId, collaboratorEmails = [] }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await base44.functions.invoke('sendEventInvite', { event_id: eventId, invite_email: email });
      setSent(true);
      setEmail('');
      toast.success('Invite sent!');
      setTimeout(() => setSent(false), 3000);
    } catch (err) {
      toast.error('Failed to send invite. Please try again.');
    }
    setSending(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-2 rounded-full transition-all hover:bg-muted"
      >
        <Users className="w-4 h-4" />
        {collaboratorEmails.length > 0 ? `${collaboratorEmails.length + 1} collaborating` : 'Invite'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full bg-card rounded-t-3xl shadow-2xl p-6 space-y-4"
            style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-foreground text-lg">Invite a collaborator</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-muted transition-all">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              They'll receive an email invite. Once accepted, they can view and add gifts to this event.
            </p>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="their@email.com"
                required
                className="flex-1 border border-border rounded-xl px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-terracotta/50"
              />
              <button
                type="submit"
                disabled={sending || !email}
                className="flex items-center gap-1.5 bg-terracotta text-white px-4 py-2.5 rounded-xl text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all disabled:opacity-60"
              >
                {sent ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                {sending ? 'Sending…' : sent ? 'Sent!' : 'Send'}
              </button>
            </form>

            {collaboratorEmails.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Already collaborating</p>
                <div className="space-y-1">
                  {collaboratorEmails.map(em => (
                    <div key={em} className="flex items-center gap-2 text-sm text-foreground bg-muted rounded-xl px-3 py-2">
                      <div className="w-6 h-6 rounded-full bg-moss/30 flex items-center justify-center text-xs font-bold text-moss-dark">
                        {em[0].toUpperCase()}
                      </div>
                      {em}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}