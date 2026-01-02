'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

// @ts-ignore
export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = await createClient()

    // 1. Sign in
    const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    if (!user) {
        return { error: 'Authentication failed.' }
    }

    // 2. Fetch User Role
    const { data: appUser, error: roleError } = await supabase
        .from('app_users')
        .select('role, must_change_password')
        .eq('auth_user_id', user.id)
        .single()

    if (roleError || !appUser) {
        // If no role found, maybe redirect to a setup page or show error
        // For now, let's assume valid users always exist if they can log in 
        // (or we handle seeding carefully).
        await supabase.auth.signOut()
        return { error: 'User profile not found. Contact Admin.' }
    }

    // 3. Check for Forced Password Change
    if (appUser.must_change_password) {
        redirect('/change-password')
    }

    // 4. Redirect based on role
    let redirectUrl = '/dashboard' // Default for student
    switch (appUser.role) {
        case 'SUPER_ADMIN':
        case 'SUB_ADMIN':
            redirectUrl = '/admin/batches'
            break;
        case 'SUPERVISOR':
            redirectUrl = '/supervisor/dashboard'
            break
        case 'EVALUATOR':
            redirectUrl = '/evaluator/dashboard'
            break
        case 'STUDENT':
            redirectUrl = '/student/dashboard'
            break
        case 'EXTERNAL':
            redirectUrl = '/external/dashboard'
            break
    }

    revalidatePath('/', 'layout')
    redirect(redirectUrl)
}

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const supabase = await createClient()

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' }
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters.' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    // Update app_user flag
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await supabase.from('app_users').update({ must_change_password: false }).eq('auth_user_id', user.id)
    }

    redirect('/')
}

export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
