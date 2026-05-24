import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Plus, Trash2, Share2, ExternalLink } from 'lucide-react';
import NativePicker from '@/components/NativePicker';

function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function WishlistPage({ user }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', link: '', price: '', priority: 'medium' });

  const { data: wishlist } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const lists = await base44.entities.Wishlist.filter({ created_by: user?.email });
      return lists[0] || null;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: () => base44.entities.Wishlist.create({
      share_token: generateToken(),
      title: `${user?.full_name?.split(' ')[0] || 'My'}'s Wishlist`,
      items: [],
      is_public: true,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  });

  const updateMutation = useMutation({
    mutationFn: (items) => base44.entities.Wishlist.update(wishlist.id, { items }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Wishlist updated');
    },
  });

  useEffect(() => {
    if (user && wishlist === null) createMutation.mutate();
  }, [user, wishlist]);

  const addItem = () => {
    if (!newItem.name) { toast.error('Item needs a name'); return; }
    const items = [...(wishlist?.items || []), {
      ...newItem,
      price: newItem.price ? parseFloat(newItem.price) : null,
    }];
    updateMutation.mutate(items);
    setNewItem({ name: '', description: '', link: '', price: '', priority: 'medium' });
    setShowAdd(false);
  };

  const removeItem = (idx) => {
    const items = wishlist.items.filter((_, i) => i !== idx);
    updateMutation.mutate(items);
  };

  const shareUrl = wishlist?.share_token
    ? `${window.location.origin}/w/${wishlist.share_token}`
    : null;

  const copyShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    }
  };

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-accent text-muted-foreground text-lg">what you'd love</p>
          <h1 className="font-heading font-bold text-2xl text-foreground">My Wishlist</h1>
        </div>
        <div className="flex gap-2">
          {shareUrl && (
            <button onClick={copyShare} className="p-2 rounded-full bg-sand-200 hover:bg-sand-300 transition-all" title="Copy share link">
              <Share2 className="w-4 h-4 text-ink" />
            </button>
          )}
          <button
            onClick={() => setShowAdd(v => !v)}
            className="flex items-center gap-1 bg-terracotta text-white px-3 py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {shareUrl && (
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-3 flex items-center gap-2">
          <Share2 className="w-4 h-4 text-moss flex-none" />
          <p className="text-xs text-muted-foreground flex-1 truncate">Share: {shareUrl}</p>
          <button onClick={copyShare} className="text-xs text-terracotta font-medium shrink-0">Copy</button>
        </div>
      )}

      {showAdd && (
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 space-y-3">
          <input
            value={newItem.name}
            onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))}
            placeholder="What would you love? *"
            className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newItem.price}
              onChange={e => setNewItem(f => ({ ...f, price: e.target.value }))}
              placeholder="Price hint ($)"
              type="number"
              className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
            />
            <NativePicker
              label="Priority"
              value={newItem.priority}
              onChange={v => setNewItem(f => ({ ...f, priority: v }))}
              options={[
                { value: 'low', label: 'Nice to have' },
                { value: 'medium', label: 'Would love it' },
                { value: 'high', label: 'Really want this' },
              ]}
            />
          </div>
          <input
            value={newItem.link}
            onChange={e => setNewItem(f => ({ ...f, link: e.target.value }))}
            placeholder="Link (optional)"
            className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50"
          />
          <div className="flex gap-2">
            <button onClick={addItem} className="flex-1 bg-terracotta text-white py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-sand-200 transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {(wishlist?.items || []).length === 0 && !showAdd ? (
        <div className="text-center py-12">
          <p className="font-accent text-2xl text-muted-foreground mb-2">your wishlist is empty</p>
          <p className="text-sm text-muted-foreground">Add what you'd love — share the link with people who ask.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(wishlist?.items || []).map((item, idx) => (
            <div key={idx} className="bg-white border border-sand-300 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-heading font-semibold text-foreground">{item.name}</p>
                  {item.description && <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>}
                  <div className="flex items-center gap-3 mt-1">
                    {item.price && <p className="text-sm text-muted-foreground">~${item.price}</p>}
                    {item.link && (
                      <a href={item.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                <button onClick={() => removeItem(idx)} className="p-1.5 rounded-full hover:bg-sand-100 text-ink-soft hover:text-terracotta transition-all ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}