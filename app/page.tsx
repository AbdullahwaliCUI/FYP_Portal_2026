import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If user is logged in, we need to know their role to redirect
  const { data: appUser } = await supabase
    .from('app_users')
    .select('role')
    .eq('auth_user_id', user.id)
    .single()

  if (!appUser) {
    // Fallback if auth user exists but no app_user profile
    return (
      <div className="p-10">User profile not found. Please contact support.</div>
    )
  }

  switch (appUser.role) {
    case 'SUPER_ADMIN':
    case 'SUB_ADMIN':
      redirect('/admin/batches')
    case 'SUPERVISOR':
      redirect('/supervisor/dashboard')
    case 'EVALUATOR':
      redirect('/evaluator/dashboard')
    case 'STUDENT':
      redirect('/student/dashboard')
    case 'EXTERNAL':
      redirect('/external/dashboard')
    default:
      // @ts-ignore
      redirect(`/login?error=Unknown Role: ${appUser.role}`)
  }
}
