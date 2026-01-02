import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function EvaluatorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: appUser } = await supabase
        .from('app_users')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

    if (!appUser || appUser.role !== 'EVALUATOR') {
        redirect('/') // Unauthorized
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center gap-2 font-bold text-xl">
                        <Link href="/evaluator/dashboard" className="text-primary hover:text-primary/90">
                            FYP Evaluator
                        </Link>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/evaluator/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                            Dashboard
                        </Link>
                        <form action="/auth/logout" method="post">
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                Sign Out
                            </Button>
                        </form>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container py-6">
                {children}
            </main>
        </div>
    )
}
