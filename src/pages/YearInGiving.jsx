import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format, parseISO, isValid, getMonth } from 'date-fns';

const HEARTS = Array.from({ length: 16 });
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function FloatingHeart({ style }) {
  return (
    <div
      className="absolute text-terracotta/20 text-2xl select-none pointer-events-none animate-float-up"
      style={style}
    >
      ♥
    </div>
  );
}

function StatCard({ eyebrow, value, label, delay }) {
  return (
    <div
      className="bg-white border border-sand-300 rounded-2xl p-5 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="font-accent text-ink-soft text-base mb-1">{eyebrow}</p>
      <p className="font-heading font-bold text-3xl text-ink">{value}</p>
      <p className="text-sm text-ink-soft mt-0.5">{label}</p>
    </div>
  );
}

export default function YearInGiving({ user }) {
  const year = new Date().getFullYear();

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => base44.entities.Event.list(),
  });

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
  });

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user,
  });

  // Compute stats
  const yearEvents = events.filter(e => {
    const d = parseISO(e.event_date);
    return isValid(d) && d.getFullYear() === year;
  });

  const totalSpent = gifts.reduce((s, g) => s + (g.price || 0), 0);
  const freeGifts = gifts.filter(g => !g.price || g.price === 0).length;
  const boughtGifts = gifts.filter(g => g.bought).length;

  // Top person
  const recipientCount = {};
  yearEvents.forEach(e => {
    recipientCount[e.recipient_name] = (recipientCount[e.recipient_name] || 0) + 1;
  });
  const topPerson = Object.entries(recipientCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

  // Busiest month
  const monthCount = Array(12).fill(0);
  yearEvents.forEach(e => {
    const d = parseISO(e.event_date);
    if (isValid(d)) monthCount[getMonth(d)]++;
  });
  const busiestMonthIdx = monthCount.indexOf(Math.max(...monthCount));
  const busiestMonth = monthCount[busiestMonthIdx] > 0 ? MONTHS[busiestMonthIdx] : '—';

  const firstName = user?.full_name?.split(' ')[0] || 'you';

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Floating hearts background */}
      {HEARTS.map((_, i) => (
        <FloatingHeart
          key={i}
          style={{
            left: `${(i * 6.25) % 100}%`,
            bottom: '-20px',
            animationDuration: `${6 + (i % 5) * 2}s`,
            animationDelay: `${(i * 0.8) % 8}s`,
            fontSize: `${16 + (i % 3) * 8}px`,
          }}
        />
      ))}

      <div className="relative z-10 space-y-6">
        <div className="text-center pt-4">
          <p className="font-accent text-2xl text-terracotta mb-2">your {year}</p>
          <h1 className="font-heading font-bold text-4xl text-ink">Year in Giving</h1>
          <p className="text-ink-soft mt-2">
            {firstName}, here's how you showed up for the people you love.
          </p>
        </div>

        {/* 2×2 stat grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard eyebrow="occasions" value={yearEvents.length} label="people celebrated" delay={500} />
          <StatCard eyebrow="gifts" value={boughtGifts} label="given with intention" delay={700} />
          <StatCard eyebrow="spent" value={`$${Math.round(totalSpent)}`} label="on those you love" delay={900} />
          <StatCard eyebrow="free gifts" value={freeGifts} label="gifts of time & skill" delay={1100} />
        </div>

        {/* Top person */}
        <div
          className="bg-sand-100 border border-sand-300 rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '1300ms' }}
        >
          <p className="font-accent text-ink-soft text-base mb-1">most celebrated</p>
          <p className="font-heading font-bold text-2xl text-ink">{topPerson}</p>
          <p className="text-sm text-ink-soft mt-0.5">{recipientCount[topPerson] || 0} occasion{(recipientCount[topPerson] || 0) !== 1 ? 's' : ''} this year</p>
        </div>

        {/* Busiest month */}
        <div
          className="bg-sand-100 border border-sand-300 rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: '1500ms' }}
        >
          <p className="font-accent text-ink-soft text-base mb-1">busiest month</p>
          <p className="font-heading font-bold text-2xl text-ink">{busiestMonth}</p>
          <p className="text-sm text-ink-soft mt-0.5">{monthCount[busiestMonthIdx] || 0} occasions</p>
        </div>

        {/* Intention */}
        {profile?.intention && (
          <div
            className="bg-gradient-to-br from-terracotta/10 to-moss/10 border border-sand-300 rounded-2xl p-5 animate-fade-up"
            style={{ animationDelay: '1700ms' }}
          >
            <p className="font-accent text-terracotta text-base mb-1">your intention this year</p>
            <p className="font-heading font-semibold text-ink text-lg">"{profile.intention}"</p>
          </div>
        )}

        {/* Closing quote */}
        <div
          className="text-center py-6 animate-fade-up"
          style={{ animationDelay: '1900ms' }}
        >
          <p className="font-accent text-xl text-ink-soft leading-relaxed">
            "Thank you for being thoughtful."
          </p>
          <p className="text-sm text-ink-soft mt-2">
            — from {yearEvents.length} people, in spirit ♥
          </p>
        </div>
      </div>
    </div>
  );
}