import { createClient } from '@/lib/supabase/server'

export default async function PrintReportPage({ searchParams }: { searchParams: { batchId: string } }) {
    const batchId = searchParams.batchId
    if (!batchId) return <div>Missing Batch ID</div>

    const supabase = await createClient()

    const { data: projects } = await supabase
        .from('projects')
        .select(`
         id, title, status,
         groups!inner(name, batch_id),
         supervisors(app_users(full_name)),
         evaluators(app_users(full_name)),
         marks(*)
       `)
        .eq('groups.batch_id', batchId)
        .order('groups(name)')

    return (
        <div className="p-8 font-sans">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold uppercase">Consolidated Result Sheet</h1>
                <p>Batch ID: {batchId}</p>
            </div>

            <table className="w-full border-collapse text-xs">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Group</th>
                        <th className="border p-2 text-left">Project Title</th>
                        <th className="border p-2 text-left">Supervisor</th>
                        <th className="border p-2 text-left">Evaluator</th>
                        <th className="border p-2 text-center">Status</th>
                        {/* Dynamic Mark Headers could go here, for now generic */}
                        <th className="border p-2 text-center">Marks (Total)</th>
                    </tr>
                </thead>
                <tbody>
                    {projects?.map((p: any) => {
                        const totalMarks = p.marks?.reduce((acc: number, m: any) => acc + (m.score || 0), 0)
                        return (
                            <tr key={p.id}>
                                <td className="border p-2">{p.groups.name}</td>
                                <td className="border p-2">{p.title}</td>
                                <td className="border p-2">{p.supervisors?.app_users?.full_name || '-'}</td>
                                <td className="border p-2">{p.evaluators?.app_users?.full_name || '-'}</td>
                                <td className="border p-2 text-center">{p.status}</td>
                                <td className="border p-2 text-center font-bold">{totalMarks}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div className="mt-8 text-xs text-gray-500 text-center">
                Generated via FYP Portal • {new Date().toLocaleDateString()}
            </div>
        </div>
    )
}
