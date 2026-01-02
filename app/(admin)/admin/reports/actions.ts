'use server'

import { createClient } from '@/lib/supabase/server'

export async function fetchReportData(batchId: string) {
    const supabase = await createClient()

    const { data: projects, error } = await supabase
        .from('projects')
        .select(`
         id, title, status,
         groups!inner(name, batch_id),
         supervisors(app_users(full_name)),
         evaluators(app_users(full_name))
       `)
        .eq('groups.batch_id', batchId)

    if (error) return { error: error.message }

    return { projects }
}
