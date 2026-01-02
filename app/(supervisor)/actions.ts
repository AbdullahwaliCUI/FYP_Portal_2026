'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMark(formData: FormData) {
    const projectId = formData.get('projectId') as string
    const semester = formData.get('semester') as string
    const component = formData.get('component') as string
    const score = formData.get('score') as string // For PF this might be 1 (Pass) or 0 (Fail) or actual int
    const maxScore = formData.get('maxScore') as string
    const feedback = formData.get('feedback') as string

    if (!projectId || !semester || !component || !score || !maxScore) {
        return { error: 'Missing required fields' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify Supervisor Identity
    const { data: appUser } = await supabase.from('app_users').select('id, role').eq('auth_user_id', user.id).single()

    if (!appUser || appUser.role !== 'SUPERVISOR') return { error: 'Unauthorized' }

    // Upsert Mark
    const { error } = await supabase
        .from('marks')
        .upsert({
            project_id: Number(projectId),
            semester: Number(semester),
            component: component,
            by_role: 'supervisor',
            marker_id: appUser.id,
            score: Number(score),
            max_score: Number(maxScore),
            feedback: feedback || null
        }, {
            onConflict: 'project_id, semester, component, by_role'
        })

    if (error) return { error: error.message }

    revalidatePath('/supervisor/dashboard')
    return { success: true }
}
