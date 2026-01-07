'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { logAction } from '@/lib/audit'

export async function deleteProject(projectId: number) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get app user
  const { data: appUser } = await supabase.from('app_users').select('id, role').eq('auth_user_id', user.id).single()
  if (!appUser) return { error: 'Profile not found' }

  // Check permissions - only admin or project owner can delete
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      groups(
        created_by,
        group_members(student_id)
      )
    `)
    .eq('id', projectId)
    .single()

  if (!project) return { error: 'Project not found' }

  // Check if user has permission to delete
  const isAdmin = appUser.role === 'admin'
  const isProjectOwner = project.groups.created_by === appUser.id
  const isGroupMember = project.groups.group_members.some((m: any) => m.student_id === appUser.id)

  if (!isAdmin && !isProjectOwner && !isGroupMember) {
    return { error: 'You do not have permission to delete this project' }
  }

  // Delete project (cascade will handle related records)
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) return { error: error.message }

  // Log the action
  await logAction(appUser.id, 'delete_project', { project_id: projectId, project_title: project.title })

  // Revalidate relevant paths
  revalidatePath('/student/dashboard')
  revalidatePath('/supervisor/dashboard')
  revalidatePath('/admin/projects')

  return { success: true }
}

export async function toggleFavoriteProject(projectId: number) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get app user
  const { data: appUser } = await supabase.from('app_users').select('id').eq('auth_user_id', user.id).single()
  if (!appUser) return { error: 'Profile not found' }

  // Check if already favorited
  const { data: existingFavorite } = await supabase
    .from('user_favorites')
    .select('id')
    .eq('user_id', appUser.id)
    .eq('project_id', projectId)
    .single()

  if (existingFavorite) {
    // Remove from favorites
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', appUser.id)
      .eq('project_id', projectId)

    if (error) return { error: error.message }
    return { success: true, isFavorite: false }
  } else {
    // Add to favorites
    const { error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: appUser.id,
        project_id: projectId
      })

    if (error) return { error: error.message }
    return { success: true, isFavorite: true }
  }
}

export async function updateProject(projectId: number, updates: { title?: string, description?: string }) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Get app user
  const { data: appUser } = await supabase.from('app_users').select('id, role').eq('auth_user_id', user.id).single()
  if (!appUser) return { error: 'Profile not found' }

  // Check permissions
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      groups(
        created_by,
        group_members(student_id)
      )
    `)
    .eq('id', projectId)
    .single()

  if (!project) return { error: 'Project not found' }

  const isAdmin = appUser.role === 'admin'
  const isProjectOwner = project.groups.created_by === appUser.id
  const isGroupMember = project.groups.group_members.some((m: any) => m.student_id === appUser.id)

  if (!isAdmin && !isProjectOwner && !isGroupMember) {
    return { error: 'You do not have permission to edit this project' }
  }

  // Update project
  const { error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)

  if (error) return { error: error.message }

  // Log the action
  await logAction(appUser.id, 'update_project', { project_id: projectId, updates })

  // Revalidate relevant paths
  revalidatePath('/student/dashboard')
  revalidatePath('/supervisor/dashboard')
  revalidatePath('/admin/projects')

  return { success: true }
}