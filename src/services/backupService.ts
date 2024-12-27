import { supabase } from '../lib/supabase';
import { Project } from '../types/project';
import { BackupResult } from '../types/backup';
import { fetchBubbleData } from '../utils/api/bubbleDataApi';
import { createBackupArchive } from '../utils/compression';
import { calculateExpirationDate, generateBackupPath } from '../utils/backup';

export async function initiateManualBackup(project: Project): Promise<BackupResult> {
  try {
    if (!project?.id || !project.data_types?.length || !project.api_key) {
      throw new Error('Invalid project configuration');
    }

    // Generate a unique backup ID and file path
    const backupId = crypto.randomUUID();
    const filePath = generateBackupPath(project.id, backupId);

    // Create backup record with file path
    const { data: backup, error: backupError } = await supabase
      .from('backups')
      .insert({
        id: backupId,
        project_id: project.id,
        status: 'pending',
        schedule_type: 'manual',
        file_path: filePath,
        expires_at: calculateExpirationDate('manual').toISOString(),
        metadata: {
          initiatedAt: new Date().toISOString(),
          dataTypes: project.data_types
        }
      })
      .select()
      .single();

    if (backupError || !backup) {
      throw backupError || new Error('Failed to create backup record');
    }

    // Update status to processing
    await updateBackupStatus(backup.id, 'processing');

    // Fetch data for each type
    const allData: Record<string, any[]> = {};
    for (const dataType of project.data_types) {
      const response = await fetchBubbleData({
        baseUrl: project.app_url,
        apiKey: project.api_key,
        dataType
      });
      allData[dataType] = response.results;
    }

    // Create backup archive
    const { blob, totalRecords } = await createBackupArchive(allData);

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filePath, blob, {
        contentType: 'application/zip',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Update backup record with success
    await updateBackupStatus(backup.id, 'completed', {
      size_bytes: blob.size,
      record_count: totalRecords
    });

    return {
      id: backup.id,
      status: 'completed',
      sizeBytes: blob.size,
      recordCount: totalRecords,
      filePath
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Manual backup failed:', error);
    throw new Error(message);
  }
}

async function updateBackupStatus(
  backupId: string, 
  status: 'pending' | 'processing' | 'completed' | 'failed',
  data: Partial<{
    size_bytes: number;
    record_count: number;
    error_details: { message: string };
  }> = {}
) {
  const { error } = await supabase
    .from('backups')
    .update({
      status,
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', backupId);

  if (error) {
    console.error('Failed to update backup status:', error);
    throw error;
  }
}