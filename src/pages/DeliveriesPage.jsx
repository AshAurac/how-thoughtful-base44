import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Package, ExternalLink } from 'lucide-react';

const STATUSES = ['none', 'ordered', 'shipped', 'delivered'];
const STATUS_COLORS = {
  none: 'bg-sand-200 text-ink-soft',
  ordered: 'bg-butter/30 text-butter-dark',
  shipped: 'bg-terracotta/20 text-terracotta',
  delivered: 'bg-moss/20 text-moss-dark',
};

export default function DeliveriesPage() {
  const queryClient = useQueryClient();

  const { data: gifts = [] } = useQuery({
    queryKey: ['gifts'],
    queryFn: () => base44.entities.Gift.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Gift.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Updated');
    },
  });

  const activeDeliveries = gifts.filter(g => g.delivery_status && g.delivery_status !== 'none');

  return (
    <div className="space-y-5">
      <div>
        <p className="font-accent text-ink-soft text-lg">on the way</p>
        <h1 className="font-heading font-bold text-2xl text-ink">Deliveries</h1>
      </div>

      {activeDeliveries.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-sand-300 mx-auto mb-3" />
          <p className="font-accent text-xl text-ink-soft">nothing in transit</p>
          <p className="text-sm text-ink-soft mt-1">When you mark a gift as ordered, it'll appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeDeliveries.map(gift => (
            <div key={gift.id} className="bg-white border border-sand-300 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-heading font-semibold text-ink">{gift.name}</p>
                  {gift.order_number && (
                    <p className="text-xs text-ink-soft">Order: {gift.order_number}</p>
                  )}
                  {gift.expected_arrival && (
                    <p className="text-xs text-ink-soft">Expected: {gift.expected_arrival}</p>
                  )}
                </div>
                {gift.tracking_url && (
                  <a
                    href={gift.tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-terracotta"
                  >
                    Track <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.filter(s => s !== 'none').map(status => (
                  <button
                    key={status}
                    onClick={() => updateMutation.mutate({ id: gift.id, data: { delivery_status: status } })}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                      gift.delivery_status === status
                        ? STATUS_COLORS[status]
                        : 'bg-sand-100 text-ink-soft hover:bg-sand-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}