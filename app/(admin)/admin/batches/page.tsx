import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createBatch, moveSemester } from '../../actions'

export default async function BatchesPage() {
    const supabase = await createClient()
    const { data: batches } = await supabase
        .from('batches')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Batch Management</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Batch</CardTitle>
                        <CardDescription>Start a new cohort for 6th Semester.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createBatch} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Batch Name</Label>
                                    <Input id="name" name="name" placeholder="Spring 2026" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="program">Program</Label>
                                    <Input id="program" name="program" placeholder="BSSE" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="section">Section</Label>
                                    <Input id="section" name="section" placeholder="A" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="intake">Intake Term</Label>
                                    <Input id="intake" name="intake_term" placeholder="Fall 2022" required />
                                </div>
                            </div>
                            <Button type="submit">Create Batch</Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Active Batches</h2>
                    {batches && batches.length > 0 ? (
                        batches.map((batch) => (
                            <Card key={batch.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle>{batch.name} ({batch.program}-{batch.section})</CardTitle>
                                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                                            {batch.current_semester}th Semester
                                        </span>
                                    </div>
                                    <CardDescription>Intake: {batch.intake_term}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex gap-2">
                                    <form action={moveSemester.bind(null, batch.id, batch.current_semester)}>
                                        <Button variant="outline" size="sm" disabled={batch.current_semester >= 8}>
                                            Promote to {batch.current_semester + 1}th
                                        </Button>
                                    </form>
                                    <Button variant="secondary" size="sm">Manage Settings</Button>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground">No active batches found.</div>
                    )}
                </div>
            </div>
        </div>
    )
}
