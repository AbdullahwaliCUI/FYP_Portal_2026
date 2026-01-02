import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateVisibility } from '../../actions'

export default async function VisibilityPage() {
    const supabase = await createClient()

    // Fetch Batches with their Settings
    const { data: batches } = await supabase
        .from('batches')
        .select('*, settings(*)')
        .order('created_at', { ascending: false })

    if (!batches) return <div>No batches found.</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Publishing Controls</h1>
            <p className="text-muted-foreground">Toggle visibility of marks for students. When enabled, students can see their results.</p>

            <div className="grid gap-6">
                {batches.map(batch => (
                    <VisibilityCard key={batch.id} batch={batch} />
                ))}
            </div>
        </div>
    )
}

function VisibilityCard({ batch }: { batch: any }) {
    const settings = batch.settings[0] // 0-1 relationship
    const flags = settings?.visibility_flags || {}

    return (
        <Card>
            <CardHeader>
                <CardTitle>{batch.name} - {batch.current_semester}th Semester</CardTitle>
                <CardDescription>Intake: {batch.intake_term}</CardDescription>
            </CardHeader>
            <CardContent>
                <form action={async (formData) => {
                    'use server'
                    const newFlags = { ...flags }
                    // We rely on form submission to toggle specific keys via hidden inputs or similar?
                    // Standard HTML forms don't handle JSON updates easily without JS.
                    // So we use a Server Action bound to the form, but extracting Switch state is tricky without JS client-side.

                    // Alternative: Server Action per toggle?
                    // Or Client Component for the form.
                    // Let's use a wrapper Client Component for the toggles to be interactive.
                }}>
                    <div className="p-4 bg-yellow-50 text-sm mb-4">
                        Note: Interactive Toggles require Client Components. Re-implementing card as Client Component...
                    </div>
                </form>
                {/* Integrating Client Component below */}
                <VisibilityControl settingsId={settings.id} initialFlags={flags} batchId={batch.id} />
            </CardContent>
        </Card>
    )
}

// Optimization: Import Client Component
import { VisibilityControl } from '@/components/admin/visibility-control'
