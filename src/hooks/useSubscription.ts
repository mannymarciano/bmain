import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Subscription } from '../types/subscription';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    async function fetchSubscription() {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscription();
  }, [user]);

  return { subscription, isLoading, error };
}