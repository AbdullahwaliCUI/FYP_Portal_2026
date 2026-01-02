import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AuditPage() {
    const supabase = await createClient()

    const { data: logs } = await supabase
        .from('audit_logs')
        .select(`
        *,
        actor:app_users(full_name, role)
     `)
        .order('created_at', { ascending: false })
        .limit(100)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {logs?.map((log: any) => (
                            <div key={log.id} className="border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-gray-700">{log.action}</span>
                                    <span className="text-gray-500">{new Date(log.created_at).toLocaleString()}</span>
                                </div>
                                <div className="text-sm mt-1">
                                    <span className="font-medium">{log.actor?.full_name}</span> ({log.actor?.role})
                                    performed on <span className="font-mono bg-gray-100 px-1">{log.entity_type} #{log.entity_id}</span>
                                </div>
                                <code className="text-xs text-gray-400 block mt-1">
                                    {JSON.stringify(log.details)}
                                </code>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
