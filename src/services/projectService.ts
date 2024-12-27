import { supabase } from '../lib/supabase';
import { ProjectFormData, Project } from '../types/project';

export async function createProject(data: ProjectFormData): Promise<Project> {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        app_url: data.appUrl,
        server_region: data.serverRegion,
        timezone: data.timezone,
        data_types: data.dataTypes,
        api_key: data.apiKey,
        data_types_count: data.dataTypes.length,
        status: 'active',
        backup_enabled: true
      })
      .select()
      .single();

    if (error) throw error;
    if (!project) throw new Error('Project creation failed');

    // Create project settings
    const { error: settingsError } = await supabase
      .from('project_settings')
      .insert({
        project_id: project.id,
        backup_schedule: data.schedule,
        backup_hour: 2,
        backup_minute: 0,
        backup_enabled: true
      });

    if (settingsError) throw settingsError;

    return project;
  } catch (error) {
    console.error('Project creation failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to create project');
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Project deletion failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete project');
  }
}

export async function updateProjectStatus(
  projectId: string, 
  status: 'active' | 'paused'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ status })
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Status update failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update project status');
  }
}

export async function updateProjectTimezone(
  projectId: string,
  timezone: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({ 
        timezone,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Timezone update failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update project timezone');
  }
}

export async function updateProjectDataTypes(
  projectId: string,
  dataTypes: string[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        data_types: dataTypes,
        data_types_count: dataTypes.length,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId);

    if (error) throw error;
  } catch (error) {
    console.error('Data types update failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to update data types');
  }
}