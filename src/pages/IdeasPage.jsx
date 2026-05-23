import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Sparkles, Lightbulb, Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react';
import { getCuratedIdeas } from '@/lib/catalogs';
import PaywallModal from '@/components/PaywallModal';

const AFFILIATE_TAG = 'howthoughtful-20';

function IdeaCard({ idea, onSave, saved }) {
  const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(idea.name)}&tag=${AFFILIATE_TAG}`;
  const isFree = idea.estimated_price === '$0' || idea.is_free;

  return (
    <div className="bg-white border border-sand-300 rounded-2xl p-4 hover:border-terracotta/40 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-semibold text-ink text-sm">{idea.name}</h3>
            {isFree && (
              <span className="px-2 py-0.5 bg-moss/20 text-moss-dark text-xs rounded-full font-medium">free</span>
            )}
          </div>
          {idea.estimated_price && !isFree && (
            <span className="text-xs text-ink-soft">{idea.estimated_price}</span>
          )}
        </div>
        <button
          onClick={() => onSave(idea)}
          className="p-1.5 rounded-full hover:bg-sand-100 transition-all"
        >
          {saved ? (
            <BookmarkCheck className="w-4 h-4 text-terracotta" />
          ) : (
            <Bookmark className="w-4 h-4 text-ink-soft" />
          )}
        </button>
      </div>
      {idea.description && <p className="text-sm text-ink-soft mb-2">{idea.description}</p>}
      {idea.why_it_works && (
        <p className="text-xs text-moss-dark italic mb-2">{idea.why_it_works}</p>
      )}
      {!isFree && (
        <a
          href={amazonUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark"
        >
          Find on Amazon <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export default function IdeasPage({ user }) {
  const urlParams = new URLSearchParams(window.location.search);
  const defaultTab = urlParams.get('tab') === 'curated' ? 'curated' : 'ai';

  const [tab, setTab] = useState(defaultTab);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paywallReason, setPaywallReason] = useState(null);
  const [recipient, setRecipient] = useState(urlParams.get('recipient') || '');
  const [occasion, setOccasion] = useState('birthday');
  const [budget, setBudget] = useState('50');
  const [savedIds, setSavedIds] = useState(new Set());

  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  const { data: savedIdeas = [] } = useQuery({
    queryKey: ['savedIdeas'],
    queryFn: () => base44.entities.SavedIdea.list(),
  });

  useEffect(() => {
    setSavedIds(new Set(savedIdeas.map(s => s.name)));
  }, [savedIdeas]);

  const isPremium = profile?.is_premium;
  const isLifetime = profile?.premium_type === 'lifetime';
  const aiCredits = profile?.ai_credits || 0;

  // Monthly free usage tracking
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthlyUses = profile?.monthly_ai_reset_month === currentMonth ? (profile?.monthly_ai_uses || 0) : 0;
  const freeUsesRemaining = Math.max(0, 3 - monthlyUses);
  const canUseAI = freeUsesRemaining > 0 || isPremium;

  const aiButtonLabel = () => {
    if (freeUsesRemaining > 0) return `Generate AI ideas (${freeUsesRemaining} free left)`;
    if (isPremium && isLifetime && aiCredits > 0) return `Generate AI ideas (${aiCredits} credits)`;
    if (isPremium && !isLifetime) return "Generate AI ideas";
    return "Unlock AI ideas";
  };

  const aiStatusBadge = () => {
    if (freeUsesRemaining > 0) return <span className="text-xs text-terracotta font-medium">{freeUsesRemaining} free uses this month</span>;
    if (isPremium && isLifetime) return <span className="text-xs text-ink-soft">{aiCredits} credits</span>;
    if (isPremium) return <span className="text-xs text-moss font-medium">unlimited</span>;
    return <span className="text-xs text-ink-soft">free limit reached</span>;
  };

  const handleGetAI = async () => {
    if (!canUseAI) {
      setPaywallReason('paywall');
      return;
    }
    if (isPremium && isLifetime && aiCredits === 0) {
      setPaywallReason('out_of_credits');
      return;
    }

    setLoading(true);
    try {
      const prompt = `You are a thoughtful gift recommendation expert. 
Recipient: ${recipient || 'a friend'}, Occasion: ${occasion}, Budget: $${budget || 50}.
Skills I have: ${profile?.skills?.join(', ') || 'none listed'}.
My intention this year: ${profile?.intention || 'be more thoughtful'}.

Suggest exactly 6 specific, creative, intentional gift ideas. 
Return STRICT JSON only — no prose, no markdown — as:
{"ideas":[{"name":"...","description":"...","estimated_price":"$XX","why_it_works":"..."}]}
Be specific (real product categories, not generic). Vary price points within the budget. 
CRUCIAL: at least ONE of the 6 ideas MUST be free / no-money — a personal act, skill, or gift of time. Set estimated_price to '$0' for that idea.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            ideas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  estimated_price: { type: "string" },
                  why_it_works: { type: "string" },
                }
              }
            }
          }
        }
      });

      setIdeas(result.ideas || []);

      // Update usage tracking
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      if (profiles[0]) {
        if (freeUsesRemaining > 0) {
          // Increment monthly free uses
          const newUses = monthlyUses + 1;
          await base44.entities.UserProfile.update(profiles[0].id, {
            monthly_ai_uses: newUses,
            monthly_ai_reset_month: currentMonth,
          });
          if (newUses === 3) {
            toast('That was your 3rd free AI use this month — upgrade for unlimited!');
          }
        } else if (isPremium && isLifetime && aiCredits > 0) {
          // Deduct a credit
          await base44.entities.UserProfile.update(profiles[0].id, { ai_credits: aiCredits - 1 });
        }
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    }
    setLoading(false);
  };

  const handleGetCurated = () => {
    const { ideas: curatedIdeas } = getCuratedIdeas(profile?.skills || [], occasion);
    setIdeas(curatedIdeas);
  };

  const handleSave = async (idea) => {
    if (savedIds.has(idea.name)) {
      toast('Already saved');
      return;
    }
    await base44.entities.SavedIdea.create({
      name: idea.name,
      description: idea.description || '',
      estimated_price: idea.estimated_price || '',
      why_it_works: idea.why_it_works || '',
      recipient_name: recipient,
    });
    setSavedIds(s => new Set([...s, idea.name]));
    queryClient.invalidateQueries({ queryKey: ['savedIdeas'] });
    toast.success('Saved to your ideas');
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="font-accent text-ink-soft text-lg">find something meaningful</p>
        <h1 className="font-heading font-bold text-2xl text-ink">Gift Ideas</h1>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-sand-200 rounded-full p-1 gap-1">
        <button
          onClick={() => setTab('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
            tab === 'ai' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
          }`}
        >
          <Sparkles className="w-4 h-4 text-terracotta" />
          AI personalized
          {freeUsesRemaining > 0 && (
            <span className="w-2 h-2 rounded-full bg-terracotta animate-shimmer" />
          )}
        </button>
        <button
          onClick={() => setTab('curated')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
            tab === 'curated' ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-moss" />
          Curated (free)
        </button>
      </div>

      {/* Form */}
      <div className="space-y-3">
        <input
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="Who is this for?"
          className="w-full border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={occasion}
            onChange={e => setOccasion(e.target.value)}
            className="border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
          >
            {['birthday','anniversary','holiday','graduation','baby_shower','wedding','thank_you','just_because'].map(o => (
              <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="Budget ($)"
            className="border border-sand-300 rounded-2xl px-4 py-3 text-ink bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50 font-body"
          />
        </div>
      </div>

      {/* CTA button */}
      {tab === 'ai' ? (
        <div className="space-y-2">
          <button
            onClick={handleGetAI}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-ink text-white py-4 rounded-full font-heading font-semibold hover:bg-ink/90 transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Finding ideas...
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-butter" />
                {aiButtonLabel()}
              </>
            )}
          </button>
          <div className="text-center">{aiStatusBadge()}</div>
        </div>
      ) : (
        <button
          onClick={handleGetCurated}
          className="w-full flex items-center justify-center gap-2 bg-moss text-white py-4 rounded-full font-heading font-semibold hover:bg-moss-dark transition-all hover:-translate-y-0.5"
        >
          <Lightbulb className="w-4 h-4" />
          Get free curated ideas
        </button>
      )}

      {/* Results */}
      {ideas.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-heading font-semibold text-ink">
            {ideas.length} ideas for {recipient || 'them'}
          </h2>
          {ideas.map((idea, i) => (
            <IdeaCard
              key={i}
              idea={idea}
              onSave={handleSave}
              saved={savedIds.has(idea.name)}
            />
          ))}
        </div>
      )}

      {paywallReason && (
        <PaywallModal reason={paywallReason} onClose={() => setPaywallReason(null)} />
      )}
    </div>
  );
}