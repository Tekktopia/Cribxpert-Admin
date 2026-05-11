import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Subscribes to Supabase Realtime changes on one or more tables.
 * Calls refetch() on any INSERT / UPDATE / DELETE event.
 */
export function useRealtimeRefetch(
  tables: string[],
  refetch: () => void,
  channelSuffix = ''
) {
  useEffect(() => {
    const channelName = `admin-realtime-${tables.join('-')}${channelSuffix}`;
    const channel = supabase.channel(channelName);

    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => refetch()
      );
    });

    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);
}
