'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { validateDriveUrl } from '@/lib/drive-utils'

export async function createGroup(formData: FormData) {
    const batchId = formData.get('batchId') as string
    const name = formData.get('name') as string // Optional group name

    if (!batchId) return { error: 'Batch is required' }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Get App User ID
    const { data: appUser } = await supabase.from('app_users').select('id').eq('auth_user_id', user.id).single()
    if (!appUser) return { error: 'Profile not found' }

    // 1. Create Group
    const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
            batch_id: Number(batchId),
            name: name || null,
            created_by: appUser.id
        })
        .select()
        .single()

    if (groupError) return { error: groupError.message }

    // 2. Add Self as Member
    const { error: memberError } = await supabase
        .from('group_members')
        .insert({
            group_id: group.id,
            student_id: appUser.id
        })

    if (memberError) return { error: 'Group created but failed to join: ' + memberError.message }

    revalidatePath('/student/dashboard')
    return { success: true }
}

export async function submitProjectTitle(formData: FormData) {
    const groupId = formData.get('groupId') as string
    const title = formData.get('title') as string

    if (!groupId || !title) return { error: 'Group and Title required' }

    const supabase = await createClient()

    const { error } = await supabase
        .from('projects')
        .insert({
            group_id: Number(groupId),
            title: title,
            status: 'DRAFT'
        })

    if (error) return { error: error.message }

    revalidatePath('/student/dashboard')
    return { success: true }
}

export async function submitDocLink(formData: FormData) {
    const projectId = formData.get('projectId') as string
    const semester = formData.get('semester') as string
    const component = formData.get('component') as string
    const url = formData.get('url') as string

    if (!projectId || !semester || !component || !url) {
        return { error: 'All fields required' }
    }

    if (!validateDriveUrl(url)) {
        return { error: 'Invalid Google Drive URL. Must be drive.google.com or docs.google.com' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data: appUser } = await supabase.from('app_users').select('id').eq('auth_user_id', user!.id).single()

    const { error } = await supabase
        .from('doc_links')
        .insert({
            project_id: Number(projectId),
            semester: Number(semester),
            component: component,
            url: url,
            submitted_by: appUser!.id
        })

    if (error) return { error: error.message }

    revalidatePath('/student/dashboard')
    return { success: true }
}
