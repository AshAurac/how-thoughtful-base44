import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Link as LinkIcon, Users, Mail, Shuffle } from 'lucide-react';

export default function GroupManagePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', description: '', link: '', estimated_price: '' });
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [assigning, setAssigning] = useState(false);

  const { data: list } = useQuery({
    queryKey: ['sharedList', id],
    queryFn: async () => {
      const results = await base44.entities.SharedList.filter({ id });
      return results[0];
    },
  });

  const { data: items = [] } = useQuery({
    queryKey: ['sharedListItems', id],
    queryFn: () => base44.entities.SharedListItem.filter({ list_id: id }),
  });

  const addItemMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedListItem.create({ ...data, list_id: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sharedListItems', id] });
      setShowAddItem(false);
      setNewItem({ name: '', description: '', link: '', estimated_price: '' });
      toast.success('Item added');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => base44.entities.SharedListItem.delete(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sharedListItems', id] }),
  });

  const updateListMutation = useMutation({
    mutationFn: (data) => base44.entities.SharedList.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sharedList', id] }),
  });

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) { toast.error('Name and email required'); return; }
    const members = [...(list?.members || []), newMember];
    updateListMutation.mutate({ members });
    setNewMember({ name: '', email: '' });
    setShowAddMember(false);
    toast.success(`${newMember.name} added!`);
  };

  const handleRemoveMember = (email) => {
    const members = (list?.members || []).filter(m => m.email !== email);
    updateListMutation.mutate({ members });
  };

  const handleAssignSantas = async () => {
    const members = list?.members || [];
    if (members.length < 2) { toast.error('You need at least 2 people for Secret Santa!'); return; }
    setAssigning(true);
    try {
      await base44.functions.invoke('assignSecretSanta', { listId: id });
      queryClient.invalidateQueries({ queryKey: ['sharedList', id] });
      toast.success('🎅 Secret Santas assigned! Everyone has been emailed their match.');
    } catch (err) {
      toast.error('Something went wrong. Try again.');
    }
    setAssigning(false);
  };

  const copyLink = () => {
    const url = `${window.location.origin}/group/${list.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied! 🔗');
  };

  if (!list) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-sand-200 rounded-2xl animate-pulse" />)}</div>;

  const isSecretSanta = list.list_type === 'secret_santa';

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="mt-1 p-2 rounded-full hover:bg-sand-200 transition-all">
          <ArrowLeft className="w-5 h-5 text-ink" />
        </button>
        <div className="flex-1">
          <p className="font-accent text-ink-soft text-lg">{isSecretSanta ? '🎅 Secret Santa' : '🎁 Group gift'}</p>
          <h1 className="font-heading font-bold text-2xl text-ink">{list.title}</h1>
          <p className="text-sm text-ink-soft">For {list.recipient_name}</p>
        </div>
        <button onClick={copyLink} className="flex items-center gap-1 text-xs bg-terracotta/10 text-terracotta px-3 py-2 rounded-full hover:bg-terracotta/20 transition-all font-medium">
          <LinkIcon className="w-3 h-3" /> Share
        </button>
      </div>

      {/* Items section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-semibold text-lg text-ink">Gift ideas</h2>
          <button onClick={() => setShowAddItem(v => !v)} className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark font-medium">
            <Plus className="w-4 h-4" /> Add idea
          </button>
        </div>

        {showAddItem && (
          <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 mb-3 space-y-2">
            <input value={newItem.name} onChange={e => setNewItem(i => ({ ...i, name: e.target.value }))} placeholder="Gift idea *" className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
            <input value={newItem.description} onChange={e => setNewItem(i => ({ ...i, description: e.target.value }))} placeholder="Description (optional)" className="w-full border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
            <div className="grid grid-cols-2 gap-2">
              <input value={newItem.estimated_price} onChange={e => setNewItem(i => ({ ...i, estimated_price: e.target.value }))} placeholder="Price (e.g. $40)" className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
              <input value={newItem.link} onChange={e => setNewItem(i => ({ ...i, link: e.target.value }))} placeholder="Link (optional)" className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if (!newItem.name) { toast.error('Needs a name'); return; } addItemMutation.mutate(newItem); }} className="flex-1 bg-terracotta text-white py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all">Add</button>
              <button onClick={() => setShowAddItem(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-sand-100 transition-all">Cancel</button>
            </div>
          </div>
        )}

        {items.length === 0 && !showAddItem ? (
          <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 text-center text-sm text-ink-soft">
            No ideas yet — add one or share the link for others to add!
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className={`bg-white border rounded-2xl p-4 ${item.is_claimed ? 'border-moss/30 bg-moss/5' : 'border-sand-300'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-heading font-semibold text-sm ${item.is_claimed ? 'line-through text-ink-soft' : 'text-ink'}`}>{item.name}</p>
                    {item.estimated_price && <p className="text-xs text-ink-soft">{item.estimated_price}</p>}
                    {item.description && <p className="text-xs text-ink-soft mt-0.5">{item.description}</p>}
                    {item.link && <a href={item.link} target="_blank" rel="noreferrer" className="text-xs text-terracotta hover:underline">View link</a>}
                    {item.is_claimed && <p className="text-xs text-moss-dark font-medium mt-1">✓ Claimed by {item.claimed_by_name}</p>}
                  </div>
                  <button onClick={() => deleteItemMutation.mutate(item.id)} className="p-1.5 rounded-full hover:bg-sand-100 text-ink-soft hover:text-terracotta transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Members / Secret Santa section */}
      {isSecretSanta && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-lg text-ink flex items-center gap-2">
              <Users className="w-5 h-5 text-ink-soft" /> Participants
            </h2>
            <button onClick={() => setShowAddMember(v => !v)} className="flex items-center gap-1 text-sm text-terracotta hover:text-terracotta-dark font-medium">
              <Plus className="w-4 h-4" /> Add person
            </button>
          </div>

          {showAddMember && (
            <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 mb-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input value={newMember.name} onChange={e => setNewMember(m => ({ ...m, name: e.target.value }))} placeholder="Name *" className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
                <input value={newMember.email} onChange={e => setNewMember(m => ({ ...m, email: e.target.value }))} placeholder="Email *" className="border border-sand-300 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-terracotta/50" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddMember} className="flex-1 bg-terracotta text-white py-2 rounded-full text-sm font-heading font-semibold hover:bg-terracotta-dark transition-all">Add</button>
                <button onClick={() => setShowAddMember(false)} className="px-4 py-2 rounded-full text-sm text-ink-soft hover:bg-sand-100 transition-all">Cancel</button>
              </div>
            </div>
          )}

          {(list.members || []).length === 0 ? (
            <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 text-center text-sm text-ink-soft">Add everyone who's taking part 🎅</div>
          ) : (
            <div className="space-y-2 mb-4">
              {(list.members || []).map(member => (
                <div key={member.email} className="flex items-center justify-between bg-white border border-sand-300 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{member.name}</p>
                    <p className="text-xs text-ink-soft">{member.email}</p>
                  </div>
                  <button onClick={() => handleRemoveMember(member.email)} className="p-1.5 rounded-full hover:bg-sand-100 text-ink-soft hover:text-terracotta transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {(list.members || []).length >= 2 && (
            <button
              onClick={handleAssignSantas}
              disabled={assigning || list.santa_assigned}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-heading font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                list.santa_assigned
                  ? 'bg-moss/20 text-moss-dark cursor-default'
                  : 'bg-ink text-white hover:bg-ink/90 disabled:opacity-60'
              }`}
            >
              {assigning ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Assigning...</span>
              ) : list.santa_assigned ? (
                <><Mail className="w-4 h-4" /> Santas assigned — everyone emailed! ✓</>
              ) : (
                <><Shuffle className="w-4 h-4" /> Assign Santas &amp; email everyone 🎅</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}