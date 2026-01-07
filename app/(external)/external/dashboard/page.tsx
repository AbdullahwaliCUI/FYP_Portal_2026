import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitExternalMark } from '@/app/(external)/actions'

export default async function ExternalDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: appUser } = await supabase.from('app_users').select('id, full_name').eq('auth_user_id', user!.id).single()

    // Find assignments: We look for entries in `marks` table where marker_id is Me and component is 'external'
    // and join with projects to get details.

    const { data: assignments } = await supabase
        .from('marks')
        .select(`
      *,
      projects(
        *,
        groups(name, group_members(student:app_users(full_name))),
        doc_links(*)
      )
    `)
        .eq('marker_id', appUser!.id)
        .eq('by_role', 'external')
        .eq('component', 'external')

    const projects = assignments ? assignments.map((a: any) => ({
        ...a.projects,
        feedback: a.feedback,
        score: a.score,
        mark_id: a.id // assignment tracked via this mark entry
    })) : []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">External Examination</h1>
                <div className="text-muted-foreground">{projects.length} Projects Assigned</div>
            </div>

            <div className="space-y-6">
                {projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {projects.length === 0 && (
                    <div className="p-8 border rounded-md text-center bg-slate-50">
                        <h3 className="font-semibold">No Assignments Found</h3>
                        <p className="text-sm text-muted-foreground">Contact the administrator if you believe this is an error.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ProjectCard({ project }: { project: any }) {
    // External only for 8th semester typically, but let's check
    // We assume mostly 8th. The assignment implies it's ready for external.
    const members = project.groups.group_members.map((m: any) => m.student.full_name).join(', ')

    // Links for External: They usually need Report (100%) etc.
    // Let's show all links for 8th sem.
    const links8 = project.doc_links.filter((l: any) => l.semester === 8)

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>Group: {project.groups.name}</CardDescription>
                        <div className="text-xs text-muted-foreground mt-1">Students: {members}</div>
                    </div>
                    <div>
                        {project.score !== null ? (
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded font-bold">
                                Score: {project.score} / 40
                            </span>
                        ) : (
                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                                Pending
                            </span>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-semibold mb-2">Project Documents</h4>
                        {links8.length > 0 ? (
                            <div className="space-y-2">
                                {links8.map((link: any) => (
                                    <div key={link.id} className="text-sm flex justify-between border-b pb-1">
                                        <span className="capitalize">{link.component}</span>
                                        <a href={link.url} target="_blank" className="text-blue-600 hover:underline">View</a>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">No documents submitted for 8th semester.</p>
                        )}
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Final Evaluation</h4>
                        <form action={submitExternalMark} className="space-y-3">
                            <input type="hidden" name="projectId" value={project.id} />
                            <input type="hidden" name="semester" value="8" />
                            <input type="hidden" name="component" value="external" />
                            <input type="hidden" name="maxScore" value="40" />

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label htmlFor={`score-${project.id}`}>Score (Max 40)</Label>
                                    <Input
                                        id={`score-${project.id}`}
                                        name="score"
                                        type="number"
                                        min="0"
                                        max="40"
                                        defaultValue={project.score}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor={`fb-${project.id}`}>Comments</Label>
                                <Input
                                    id={`fb-${project.id}`}
                                    name="feedback"
                                    placeholder="Examination remarks..."
                                    defaultValue={project.feedback || ''}
                                />
                            </div>
                            <div className="text-right">
                                <Button type="submit">Submit Result</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
