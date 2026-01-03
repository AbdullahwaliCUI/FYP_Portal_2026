import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitMark } from '../../actions'

export default async function SupervisorDashboard() {
    const supabase = await createClient()

    // 1. Get Supervisor ID and Profile
    const { data: { user } } = await supabase.auth.getUser()
    const { data: appUser } = await supabase.from('app_users').select('id, full_name').eq('auth_user_id', user!.id).single()
    const { data: supervisorProfile } = await supabase.from('supervisors').select('id').eq('app_user_id', appUser!.id).single()

    if (!supervisorProfile) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold">Access Denied</h1>
                <p>You do not have an active Supervisor profile. Please contact Admin.</p>
            </div>
        )
    }

    // 2. Fetch Assigned Projects
    const { data: projectsRaw } = await supabase
        .from('projects')
        .select(`
      *,
      groups(
        *,
        batches(*),
        group_members(
           student:app_users(full_name, roll_no)
        )
      ),
      doc_links(*),
      marks(*)
    `)
        .eq('supervisor_id', supervisorProfile.id)

    // Safe cast or parsing needed normally, here simple any for speed
    const projects = projectsRaw || []

    // 3. Calculate Capacity for 6th Sem Projects
    const projects6th = projects.filter((p: any) => p.groups.batches.current_semester === 6)
    // Assuming default 4, fetch from settings if strictly needed, but simple counter is enough for display
    const activeCount = projects6th.length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Supervisor Dashboard</h1>
                <div className="bg-slate-100 px-4 py-2 rounded-md shadow-sm">
                    <span className="text-sm font-medium text-slate-500">6th Semester Load</span>
                    <div className="text-2xl font-bold">{activeCount} / 4</div>
                </div>
            </div>

            <div className="space-y-8">
                {projects.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
                {projects.length === 0 && (
                    <p className="text-muted-foreground">No projects assigned yet.</p>
                )}
            </div>
        </div>
    )
}

function ProjectCard({ project }: { project: any }) {
    const semester = project.groups.batches.current_semester
    const members = project.groups.group_members.map((m: any) => m.student.full_name).join(', ')

    // Helper to find existing mark
    const getMark = (comp: string) => project.marks.find((m: any) => m.component === comp && m.by_role === 'supervisor')
    // Helper to find existing link
    const getLink = (comp: string) => project.doc_links.find((l: any) => l.component === comp && l.semester === semester)

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between">
                    <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>Group: {project.groups.name} | Members: {members}</CardDescription>
                    </div>
                    <div className="text-right">
                        <span className="inline-block px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">
                            {semester}th Semester
                        </span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    {/* DELIVERABLES */}
                    <div>
                        <h4 className="font-semibold mb-2">Deliverables</h4>
                        <div className="space-y-2">
                            {semester === 6 && (
                                <LinkDisplay label="Scope Document" link={getLink('scope')} />
                            )}
                            {semester === 7 && (
                                <>
                                    <LinkDisplay label="SRS" link={getLink('srs')} />
                                    <LinkDisplay label="SDD" link={getLink('sdd')} />
                                </>
                            )}
                            {semester === 8 && (
                                <>
                                    <LinkDisplay label="Progress 60%" link={getLink('progress60')} />
                                    <LinkDisplay label="Progress 100%" link={getLink('progress100')} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* MARKING */}
                    <div>
                        <h4 className="font-semibold mb-2">Grading</h4>
                        <div className="space-y-4">
                            {semester === 6 && (
                                <MarkForm
                                    label="Project Scope (Pass/Fail)"
                                    projectId={project.id}
                                    semester={6}
                                    component="scope"
                                    maxScore={1}
                                    existingMark={getMark('scope')}
                                    isPF
                                />
                            )}
                            {semester === 7 && (
                                <>
                                    <MarkForm label="SRS (25)" projectId={project.id} semester={7} component="srs" maxScore={25} existingMark={getMark('srs')} />
                                    <MarkForm label="SDD (25)" projectId={project.id} semester={7} component="sdd" maxScore={25} existingMark={getMark('sdd')} />
                                </>
                            )}
                            {semester === 8 && (
                                <>
                                    <MarkForm label="Progress 60% (15)" projectId={project.id} semester={8} component="progress60" maxScore={15} existingMark={getMark('progress60')} />
                                    <MarkForm label="Progress 100% (15)" projectId={project.id} semester={8} component="progress100" maxScore={15} existingMark={getMark('progress100')} />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function LinkDisplay({ label, link }: any) {
    if (!link) return <div className="text-sm text-gray-400">{label}: Not Submitted</div>
    return (
        <div className="text-sm">
            <span className="font-medium mr-2">{label}:</span>
            <a href={link.url} target="_blank" className="text-blue-600 hover:underline">View Document</a>
        </div>
    )
}

function MarkForm({ label, projectId, semester, component, maxScore, existingMark, isPF }: any) {
    return (
        <form action={submitMark} className="border p-3 rounded bg-slate-50">
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="semester" value={semester} />
            <input type="hidden" name="component" value={component} />
            <input type="hidden" name="maxScore" value={maxScore} />

            <div className="flex justify-between items-center mb-2">
                <Label>{label}</Label>
                {existingMark && <span className="text-xs text-green-600 font-bold">Graded: {isPF ? (existingMark.score > 0 ? 'Pass' : 'Fail') : existingMark.score}</span>}
            </div>

            <div className="flex gap-2 mb-2">
                {isPF ? (
                    <select name="score" className="h-9 w-full rounded-md border border-input bg-background px-3 py-1" defaultValue={existingMark?.score ?? ''}>
                        <option value="" disabled>Select Status</option>
                        <option value="1">Pass</option>
                        <option value="0">Fail</option>
                    </select>
                ) : (
                    <Input name="score" type="number" min="0" max={maxScore} placeholder={`0-${maxScore}`} defaultValue={existingMark?.score} required />
                )}
            </div>
            <Input name="feedback" placeholder="Feedback (Optional)" defaultValue={existingMark?.feedback || ''} />
            <div className="mt-2 text-right">
                <Button size="sm" type="submit">Save</Button>
            </div>
        </form>
    )
}
