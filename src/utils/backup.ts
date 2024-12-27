import { BackupScheduleType } from '../types/backup';

export function calculateExpirationDate(scheduleType: BackupScheduleType): Date {
  const now = new Date();
  
  switch (scheduleType) {
    case 'daily':
      now.setDate(now.getDate() + 60); // 60 days
      break;
    case 'weekly':
      now.setDate(now.getDate() + 90); // 90 days
      break;
    case 'monthly':
      now.setDate(now.getDate() + 180); // 180 days
      break;
    case 'manual':
      now.setDate(now.getDate() + 30); // 30 days
      break;
  }
  
  return now;
}

export function generateBackupPath(projectId: string, backupId: string): string {
  return `${projectId}/${backupId}.zip`;
}