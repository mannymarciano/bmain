import { supabase } from '../lib/supabase';
import { fetchProjectData } from './bubbleApi';
import { createBackupArchive } from './compression';
import { generateBackupPath } from './backup';
import { Project } from '../types/project';
import { BackupResult } from '../types/backup';

export async function processBackup(project: Project, backupId: string): Promise<BackupResult> {
  try {
    // Validate project data
    if (!project.data_types?.length) {
      throw new Error('No data types configured for backup');
    }

    if (!project.api_key) {
      throw new Error('API key not found');
    }

    // Update status to processing
    await updateBackupStatus(backupId, {
      status: 'processing'
    });

    // Fetch all project data
    console.log('Fetching project data...');
    const allData = await fetchProjectData(project);
    
    // Create backup archive
    console.log('Creating backup archive...');
    const { blob, totalRecords } = await createBackupArchive(allData);
    
    // Generate file path and upload
    const filePath = generateBackupPath(project.id, backupId);
    console.log('Uploading backup file:', filePath);
    
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filePath, blob, {
        contentType: 'application/zip',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Update backup record with success
    const result: BackupResult = {
      id: backupId,
      status: 'completed',
      sizeBytes: blob.size,
      recordCount: totalRecords,
      filePath
    };

    await updateBackupStatus(backupId, {
      status: result.status,
      size_bytes: result.sizeBytes,
      record_count: result.recordCount,
      file_path: result.filePath
    });

    console.log('Backup completed successfully:', result);
    return result;
  } catch (error) {
    // Log the full error
    console.error('Backup process failed:', error);
    
    // Update status to failed with error details
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    await updateBackupStatus(backupId, {
      status: 'failed',
      error_details: { 
        message: errorMessage,
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      }
    });

    throw new Error(`Backup failed: ${errorMessage}`);
  }
}

async function updateBackupStatus(backupId: string, updates: Partial<{
  status: string;
  size_bytes: number;
  record_count: number;
  file_path: string;
  error_details: {
    message: string;
    timestamp: string;
    stack?: string;
  };
}>): Promise<void> {
  try {
    const { error } = await supabase
      .from('backups')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', backupId);

    if (error) {
      console.error('Failed to update backup status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Status update failed:', error);
    throw new Error('Failed to update backup status');
  }
}