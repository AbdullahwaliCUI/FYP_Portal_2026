import { LoginForm } from '@/components/auth/login-form'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: { message?: string, error?: string }
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/')
    }

    // You can pass searchParams.error to LoginForm if you update it to accept props
    // For now, let's just render the LoginForm which handles submission.
    // If we want to show server errors from redirects (like ?error=...), we should pass them.

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-sm">
                {searchParams?.error && (
                    <div className="mb-4 p-4 text-sm text-red-600 bg-red-100 rounded-md">
                        {searchParams.error}
                    </div>
                )}
                {searchParams?.message && (
                    <div className="mb-4 p-4 text-sm text-green-600 bg-green-100 rounded-md">
                        {searchParams.message}
                    </div>
                )}
                <LoginForm />
            </div>
        </div>
    )
}
