# Backup Scheduler Edge Function

This Edge Function handles the scheduling and initiation of backups for all projects. It runs on a schedule and:

1. Checks for projects that need backup (where next_backup_at has passed)
2. Creates backup records for each project
3. Updates the next backup time based on the project's schedule and timezone
4. Initiates the backup process

## Schedule

The function runs every 5 minutes to check for projects that need backup.

## Configuration

The function requires the following environment variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for database access

## Deployment

The function is automatically deployed when you push to the main branch.

## Testing

You can test the function locally using the Supabase CLI:

```bash
supabase functions serve backup-scheduler
```