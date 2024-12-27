import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProjectSettings {
  id: string;
  project_id: string;
  backup_hour: number;
  backup_minute: number;
  last_backup_at: string | null;
  next_backup_at: string | null;
}

export function useProjectSettings(projectId: string) {
  const [settings, setSettings] = useState<ProjectSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchSettings() {
      try {
        console.log('Fetching settings for project:', projectId);
        const { data, error: fetchError } = await supabase
          .from('project_settings')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching settings:', fetchError);
          throw fetchError;
        }
        
        if (mounted) {
          console.log('Received settings:', data);
          setSettings(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to fetch project settings:', err);
          setError(err instanceof Error ? err.message : 'Failed to fetch project settings');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    if (projectId) {
      fetchSettings();
    }

    return () => {
      mounted = false;
    };
  }, [projectId]);

  return { settings, isLoading, error };
}