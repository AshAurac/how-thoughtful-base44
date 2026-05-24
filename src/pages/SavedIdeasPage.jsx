import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';

const AFFILIATE_TAG = 'howthoughtful-20';

export default function SavedIdeasPage({ user }) {
  const queryClient = useQueryClient();

  const { data: ideas = [], isLoading } = useQuery({
    queryKey: ['savedIdeas', user?.email],
    queryFn: () => base44.entities.SavedIdea.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SavedIdea.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedIdeas'] });
      toast.success('Removed');
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="font-accent text-muted-foreground text-lg">things you loved</p>
        <h1 className="font-heading font-bold text-2xl text-foreground">Saved Ideas</h1>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-sand-200 rounded-2xl animate-pulse" />)}</div>
      ) : ideas.length === 0 ? (
        <div className="text-center py-12">
          <Bookmark className="w-12 h-12 text-sand-300 mx-auto mb-3" />
          <p className="font-accent text-xl text-muted-foreground">nothing saved yet</p>
          <p className="text-sm text-muted-foreground mt-1">Bookmark ideas from the Ideas page to see them here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map(idea => {
            const isFree = idea.estimated_price === '$0';
            const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(idea.name)}&tag=${AFFILIATE_TAG}`;
            return (
              <div key={idea.id} className="bg-white border border-sand-300 rounded-2xl p-4">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-semibold text-foreground">{idea.name}</h3>
                      {isFree && <span className="text-xs bg-moss/20 text-moss-dark px-2 py-0.5 rounded-full">free</span>}
                    </div>
                    {idea.recipient_name && (
                      <p className="text-xs text-muted-foreground mt-0.5">For {idea.recipient_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(idea.id)}
                    className="p-1.5 rounded-full hover:bg-sand-100 text-ink-soft hover:text-terracotta transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {idea.description && <p className="text-sm text-muted-foreground mb-2">{idea.description}</p>}
                {idea.why_it_works && <p className="text-xs text-moss-dark italic mb-2">{idea.why_it_works}</p>}
                <div className="flex items-center gap-3">
                  {idea.estimated_price && !isFree && (
                    <span className="text-xs text-muted-foreground">{idea.estimated_price}</span>
                  )}
                  {!isFree && (
                    <a href={amazonUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-terracotta hover:text-terracotta-dark">
                      Find on Amazon <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}