import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Project {
  id: string
  app_url: string
  timezone: string
}

interface ProjectSettings {
  project_id: string
  backup_schedule: string
  next_backup_at: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all projects that need backup
    const { data: projectSettings, error: settingsError } = await supabase
      .from('project_settings')
      .select(`
        project_id,
        backup_schedule,
        next_backup_at,
        projects!inner (
          id,
          app_url,
          timezone
        )
      `)
      .lt('next_backup_at', new Date().toISOString())
      .eq('projects.status', 'active')

    if (settingsError) throw settingsError

    const backupPromises = projectSettings?.map(async (setting) => {
      const project = setting.projects as Project

      // Create backup record
      const { data: backup, error: backupError } = await supabase
        .from('backups')
        .insert({
          project_id: project.id,
          schedule_type: setting.backup_schedule,
          status: 'pending',
          file_path: `backups/${project.id}/${new Date().toISOString()}.json`
        })
        .select()
        .single()

      if (backupError) throw backupError

      // Calculate next backup time
      const { data: nextBackup, error: calcError } = await supabase
        .rpc('calculate_next_backup', {
          p_schedule: setting.backup_schedule,
          p_timezone: project.timezone,
          p_hour: 2,
          p_minute: 0
        })

      if (calcError) throw calcError

      // Update project settings with new next_backup_at
      const { error: updateError } = await supabase
        .from('project_settings')
        .update({
          last_backup_at: new Date().toISOString(),
          next_backup_at: nextBackup
        })
        .eq('project_id', project.id)

      if (updateError) throw updateError

      return backup
    }) ?? []

    const results = await Promise.allSettled(backupPromises)
    const succeeded = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} projects. Success: ${succeeded}, Failed: ${failed}`,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})