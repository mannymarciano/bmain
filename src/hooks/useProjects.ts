import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types/project';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            project_settings (
              backup_schedule,
              backup_enabled,
              last_backup_at,
              next_backup_at
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (mounted) {
          setProjects(data || []);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch projects');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProjects();

    return () => {
      mounted = false;
    };
  }, []);

  return { projects, isLoading, error };
}