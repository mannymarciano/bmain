import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Project } from '../types/project';

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchProject() {
      if (!projectId) {
        setProject(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (fetchError) throw fetchError;
        
        if (mounted) {
          // Ensure all required fields are present
          if (!data.app_url || !data.api_key || !data.data_types) {
            throw new Error('Incomplete project configuration');
          }

          setProject(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch project');
          setProject(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProject();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  return { project, isLoading, error };
}