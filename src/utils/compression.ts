import JSZip from 'jszip';

interface BackupMetadata {
  version: string;
  timestamp: string;
  dataTypes: {
    name: string;
    recordCount: number;
  }[];
  totalRecords: number;
}

interface ArchiveResult {
  blob: Blob;
  totalRecords: number;
}

export async function createBackupArchive(data: Record<string, any[]>): Promise<ArchiveResult> {
  const zip = new JSZip();
  const root = zip.folder('bubble-backup');
  
  if (!root) throw new Error('Failed to create backup folder');

  let totalRecords = 0;
  const dataTypes: BackupMetadata['dataTypes'] = [];

  // Add each data type as a separate JSON file
  for (const [typeName, records] of Object.entries(data)) {
    const content = JSON.stringify(records, null, 2);
    root.file(`data/${typeName}.json`, content);
    
    totalRecords += records.length;
    dataTypes.push({
      name: typeName,
      recordCount: records.length
    });
  }

  // Create metadata
  const metadata: BackupMetadata = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    dataTypes,
    totalRecords
  };

  root.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Generate zip with maximum compression
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  return { blob, totalRecords };
}