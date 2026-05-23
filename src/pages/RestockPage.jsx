import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Star, ExternalLink } from 'lucide-react';

const AFFILIATE_TAG = 'howthoughtful-20';

// Evergreen "always good to have" gift staples worth re-buying
const RESTOCK_STAPLES = [
  {
    category: "Cards & Stationery",
    color: "bg-butter/20 border-butter/40",
    items: [
      { name: "A box of quality blank notecards", hint: "blank notecards set", why: "The most underrated thing in your home" },
      { name: "Nice pens for writing", hint: "fine writing pens set", why: "Good handwriting needs good tools" },
      { name: "Kraft gift wrap & twine", hint: "kraft paper gift wrap", why: "Timeless, elegant, never over-packaged" },
    ]
  },
  {
    category: "Always-Great Consumables",
    color: "bg-moss/10 border-moss/30",
    items: [
      { name: "A great candle (cedar, amber, or fig)", hint: "luxury soy candle cedar amber", why: "Everyone uses them. Everyone loves them." },
      { name: "Premium tea or coffee sampler", hint: "premium tea sampler gift", why: "Works for nearly every relationship" },
      { name: "Nice honey or jam set", hint: "artisan honey jam gift set", why: "Feels thoughtful, tastes amazing" },
      { name: "Olive oil or balsamic vinegar", hint: "premium olive oil gift", why: "Chefs and non-chefs alike will use it" },
    ]
  },
  {
    category: "Comfort & Wellness",
    color: "bg-terracotta/10 border-terracotta/20",
    items: [
      { name: "Beeswax lip balm set", hint: "beeswax lip balm set natural", why: "Tiny, useful, genuinely welcome" },
      { name: "Hand cream trio", hint: "luxury hand cream gift set", why: "Everyone's hands need love" },
      { name: "Lavender bath salts", hint: "lavender bath salts gift", why: "Universally relaxing" },
    ]
  },
  {
    category: "Experience Seeds",
    color: "bg-sand-200 border-sand-300",
    items: [
      { name: "A beautiful blank journal", hint: "high quality blank journal", why: "Pairs perfectly with a heartfelt note" },
      { name: "A pack of activity cards / conversation prompts", hint: "conversation card deck", why: "Unforgettable for groups, couples, families" },
    ]
  },
];

export default function RestockPage() {
  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
  });

  // Surface recently bought gifts as restock suggestions
  const boughtGifts = gifts
    .filter(g => g.bought && g.name)
    .slice(-10);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-accent text-ink-soft text-lg">always have something ready</p>
        <h1 className="font-heading font-bold text-2xl text-ink">Restock Ideas</h1>
        <p className="text-sm text-ink-soft mt-1">Keep a small stash of go-to gifts so you're never scrambling.</p>
      </div>

      {/* Previously bought — restock */}
      {boughtGifts.length > 0 && (
        <div>
          <h2 className="font-heading font-semibold text-lg text-ink mb-3">You've given before</h2>
          <div className="space-y-2">
            {boughtGifts.map((g, i) => {
              const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(g.name)}&tag=${AFFILIATE_TAG}`;
              return (
                <div key={i} className="bg-white border border-sand-300 rounded-2xl p-3 flex items-center gap-3">
                  <Star className="w-4 h-4 text-butter-dark flex-none" />
                  <p className="flex-1 font-body text-sm text-ink">{g.name}</p>
                  <a href={amazonUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark">
                    Restock <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Curated staples */}
      {RESTOCK_STAPLES.map(section => (
        <div key={section.category}>
          <h2 className="font-heading font-semibold text-lg text-ink mb-3">{section.category}</h2>
          <div className={`border rounded-2xl p-4 space-y-3 ${section.color}`}>
            {section.items.map((item, i) => {
              const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(item.hint)}&tag=${AFFILIATE_TAG}`;
              return (
                <div key={i} className="bg-white border border-sand-300 rounded-xl p-3 flex items-start gap-3">
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-sm text-ink">{item.name}</p>
                    <p className="text-xs text-ink-soft italic mt-0.5">{item.why}</p>
                  </div>
                  <a href={amazonUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark shrink-0 mt-0.5">
                    Shop <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}