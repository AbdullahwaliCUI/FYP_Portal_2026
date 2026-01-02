import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
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

    if (!appUser || !['SUPER_ADMIN', 'SUB_ADMIN'].includes(appUser.role)) {
        redirect('/') // Unauthorized
    }

    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex-shrink-0">
                <div className="p-4 border-b border-slate-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">FYP Portal</h1>
                    <p className="text-xs text-slate-400">Administration</p>
                </div>

                <nav className="flex flex-col gap-2 p-4 text-sm font-medium">
                    <Link href="/admin/batches" className="px-4 py-2 rounded-md hover:bg-slate-800">Batches & Semesters</Link>
                    <Link href="/admin/assignments" className="px-4 py-2 rounded-md hover:bg-slate-800">Faculty Assignments</Link>
                    <Link href="/admin/visibility" className="px-4 py-2 rounded-md hover:bg-slate-800">Publishing Controls</Link>
                    <Link href="/admin/reports" className="px-4 py-2 rounded-md hover:bg-slate-800">Reports & Exports</Link>
                    <Link href="/admin/audit" className="px-4 py-2 rounded-md hover:bg-slate-800">Audit Logs</Link>

                    <div className="mt-8 border-t border-slate-700 pt-4">
                        <form action="/auth/logout" method="post">
                            <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </nav>
            </aside>
            <main className="flex-1 overflow-auto bg-slate-50">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
