import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportGenerator } from './report-generator' // Client Component

export default async function ReportsPage() {
    const supabase = await createClient()

    // Fetch Batches
    const { data: batches } = await supabase.from('batches').select('*').order('created_at', { ascending: false })

    // We'll fetch all projects/marks for the generator to filter client-side 
    // OR usually better to fetch on demand.
    // For simplicity: We pass batches to the Client Component, which will ask server for data via Action or API.
    // Let's create a server action to fetch report data to keep it clean.

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports & Exports</h1>
            <ReportGenerator batches={batches || []} />
        </div>
    )
}
