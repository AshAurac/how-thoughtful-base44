import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// All feature keys and their metadata
export const FEATURES = {
  feature_budget:         { label: 'Budget Tracker',   description: 'Track spending across all your occasions and see where your money goes.', unlock: 'Create a few occasions and add gifts to unlock your budget overview.' },
  feature_deliveries:     { label: 'Deliveries',        description: 'Track orders and shipping status in one place so nothing gets lost.', unlock: 'Mark a gift as ordered to unlock delivery tracking.' },
  feature_saved:          { label: 'Saved Ideas',        description: 'Save gift ideas from the Ideas page to revisit later.', unlock: 'Generate some gift ideas and save your favourites.' },
  feature_group_lists:    { label: 'Group Gifting',     description: 'Coordinate group gifts and Secret Santa with shared lists.', unlock: 'Use this when organising a gift with others, or get invited via a shared link.' },
  feature_restock:        { label: 'Restock',           description: 'Keep track of your go-to gifts so you\'re always prepared.', unlock: 'After you\'ve given a few gifts, you can track what to restock.' },
  feature_wishlist:       { label: 'My Wishlist',       description: 'Share a wishlist so others know exactly what you\'d love.', unlock: 'Available once you\'ve explored the basics, or if someone shares a wishlist with you.' },
  feature_year_in_giving: { label: 'Year in Giving',   description: 'A beautiful summary of your generosity over the year.', unlock: 'Unlocks after you\'ve used the app for a little while.' },
};

export function useFeatureFlags(user) {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0] || null;
    },
    enabled: !!user?.email,
    staleTime: 30_000,
  });

  const mutation = useMutation({
    mutationFn: async (updates) => {
      if (profile?.id) {
        return base44.entities.UserProfile.update(profile.id, updates);
      } else {
        return base44.entities.UserProfile.create({ ...updates, created_by: user?.email });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });

  const isUnlocked = (key) => !!profile?.[key];

  const unlock = (key) => {
    mutation.mutate({ [key]: true });
  };

  const toggle = (key, value) => {
    mutation.mutate({ [key]: value });
  };

  return { profile, isUnlocked, unlock, toggle, isSaving: mutation.isPending };
}