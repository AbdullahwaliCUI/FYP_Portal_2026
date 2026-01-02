import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { assignFaculty } from '../../actions'

export default async function AssignmentsPage() {
    const supabase = await createClient()

    // Fetch active projects
    const { data: projects } = await supabase
        .from('projects')
        .select(`
        *,
        groups(name, batch_id, batches(name, current_semester)),
        supervisor:supervisors(id, app_users(full_name)),
        evaluator:evaluators(id, app_users(full_name))
    `)
        .order('created_at', { ascending: false })

    // Fetch Candidates
    const { data: supervisors } = await supabase.from('supervisors').select('id, app_users(full_name)')
    const { data: evaluators } = await supabase.from('evaluators').select('id, app_users(full_name)')

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Faculty Assignments</h1>
            <div className="grid gap-4">
                {projects?.map((project: any) => (
                    <AssignmentCard
                        key={project.id}
                        project={project}
                        supervisors={supervisors || []}
                        evaluators={evaluators || []}
                    />
                ))}
                {(!projects || projects.length === 0) && (
                    <p className="text-muted-foreground p-8 bg-slate-50 border rounded text-center">No projects to assign.</p>
                )}
            </div>
        </div>
    )
}

function AssignmentCard({ project, supervisors, evaluators }: any) {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1">
                    <div className="font-bold">{project.title || "Untitled Project"}</div>
                    <div className="text-sm text-muted-foreground">
                        Group: {project.groups.name} | Batch: {project.groups.batches.name} (Sem {project.groups.batches.current_semester})
                    </div>
                </div>

                <form action={assignFaculty} className="flex flex-col md:flex-row gap-2 items-center">
                    <input type="hidden" name="projectId" value={project.id} />

                    <div className="flex flex-col text-xs">
                        <label className="font-semibold text-gray-500">Supervisor</label>
                        <select name="supervisorId" className="border rounded p-1 w-48" defaultValue={project.supervisor_id || ''}>
                            <option value="">-- Unassigned --</option>
                            {supervisors.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.app_users.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col text-xs">
                        <label className="font-semibold text-gray-500">Evaluator</label>
                        <select name="evaluatorId" className="border rounded p-1 w-48" defaultValue={project.evaluator_id || ''}>
                            <option value="">-- Unassigned --</option>
                            {evaluators.map((e: any) => (
                                <option key={e.id} value={e.id}>{e.app_users.full_name}</option>
                            ))}
                        </select>
                    </div>

                    <Button size="sm" type="submit" className="mt-4 md:mt-0">Update</Button>
                </form>
            </CardContent>
        </Card>
    )
}
