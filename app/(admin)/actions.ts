'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function createBatch(formData: FormData) {
    const name = formData.get('name') as string
    const program = formData.get('program') as string
    const section = formData.get('section') as string
    const intake_term = formData.get('intake_term') as string

    if (!name || !program || !section || !intake_term) {
        return { error: 'All fields are required' }
    }

    const supabase = await createClient()

    // 1. Create Batch
    const { data: batch, error } = await supabase
        .from('batches')
        .insert({
            name,
            program,
            section,
            intake_term,
            current_semester: 6, // Default start at 6th
            config_json: {},
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    // 2. Initialize Settings for this batch
    const { error: settingsError } = await supabase
        .from('settings')
        .insert({
            batch_id: batch.id,
            visibility_flags: {
                scope6: false,
                srs7: false,
                sdd7: false,
                progress60_8: false,
                progress100_8: false,
                external8: false
            },
            weight_config: {},
            windows: {},
            supervisor_capacity: 4
        })

    if (settingsError) {
        // Cleanup if settings fail? Or just return error.
        return { error: 'Batch created but settings failed: ' + settingsError.message }
    }

    revalidatePath('/admin/batches')
    return { success: true }
}

export async function moveSemester(batchId: string, currentSemester: number) {
    const supabase = await createClient()

    if (currentSemester >= 8) {
        return { error: 'Already at final semester' }
    }

    const nextSemester = currentSemester + 1

    // TODO: Add Logic to check checks (e.g. all passed scope).
    // For now, just direct update.

    const { error } = await supabase
        .from('batches')
        .update({ current_semester: nextSemester })
        .eq('id', batchId)

    if (error) return { error: error.message }

    revalidatePath('/admin/batches')
    return { success: true }
}

export async function updateVisibility(batchId: string, flags: any) {
    const supabase = await createClient()

    // Verify Admin (Double check, though middleware/layout protects)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // We can add strict role check here or trust Layout (for now trusting Layout + basic Auth)

    const { error } = await supabase
        .from('settings')
        .update({ visibility_flags: flags })
        .eq('batch_id', batchId)

    if (error) return { error: error.message }

    await logAction('UPDATE_VISIBILITY', 'BATCH', batchId, { flags })
    revalidatePath('/admin/visibility')
    revalidatePath('/student/dashboard')
    return { success: true }
}

export async function assignFaculty(formData: FormData) {
    const projectId = formData.get('projectId') as string
    const supervisorId = formData.get('supervisorId') as string
    const evaluatorId = formData.get('evaluatorId') as string

    if (!projectId) return { error: 'Project ID required' }

    const supabase = await createClient()

    // 1. Fetch current project info for validation
    const { data: project } = await supabase
        .from('projects')
        .select('*, groups(batch_id)')
        .eq('id', projectId)
        .single()

    if (!project) return { error: 'Project not found' }

    const updateData: any = {}
    if (supervisorId) updateData.supervisor_id = Number(supervisorId)
    if (evaluatorId) updateData.evaluator_id = Number(evaluatorId)

    // Validation: Supervisor != Evaluator
    const finalSup = supervisorId ? Number(supervisorId) : project.supervisor_id
    const finalEval = evaluatorId ? Number(evaluatorId) : project.evaluator_id

    if (finalSup && finalEval && finalSup === finalEval) {
        const { data: sup } = await supabase.from('supervisors').select('app_user_id').eq('id', finalSup).single()
        const { data: eva } = await supabase.from('evaluators').select('app_user_id').eq('id', finalEval).single()

        if (sup && eva && sup.app_user_id === eva.app_user_id) {
            return { error: 'Constraint Failed: Supervisor and Evaluator cannot be the same person.' }
        }
    }

    // Validation: Capacity (if Supervisor Changing)
    if (supervisorId && Number(supervisorId) !== project.supervisor_id) {
        const { data: batch } = await supabase.from('batches').select('current_semester, settings(supervisor_capacity)').eq('id', project.groups.batch_id).single()

        if (batch && batch.current_semester === 6) {
            const limit = batch.settings[0]?.supervisor_capacity || 4

            const { data: supProjects } = await supabase
                .from('projects')
                .select('groups(batches(current_semester))')
                .eq('supervisor_id', Number(supervisorId))

            // @ts-ignore
            const activeCount = supProjects?.filter((p: any) => p.groups?.batches?.current_semester === 6).length || 0

            if (activeCount >= limit) {
                return { error: `Supervisor Capacity Reached (${activeCount}/${limit}) for 6th Semester.` }
            }
        }
    }

    const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId)

    if (error) return { error: error.message }

    await logAction('ASSIGN_FACULTY', 'PROJECT', projectId, updateData)

    revalidatePath('/admin/assignments')
    return { success: true }
}
