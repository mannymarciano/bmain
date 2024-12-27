import { supabase } from '../lib/supabase';

export async function downloadBackup(filePath: string): Promise<void> {
  try {
    const { data, error } = await supabase.storage
      .from('backups')
      .download(filePath);

    if (error) {
      console.error('Download error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No backup data found');
    }

    // Create download link
    const url = URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filePath.split('/').pop() || 'backup.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download backup file');
  }
}