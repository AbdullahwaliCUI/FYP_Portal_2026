'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { downloadCSV } from '@/lib/exports/csv'
import { fetchReportData } from './actions'

export function ReportGenerator({ batches }: any) {
    const [batchId, setBatchId] = useState<string>('')
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        if (!batchId) return alert("Select a batch")
        setLoading(true)
        const data = await fetchReportData(batchId)
        setLoading(false)
        if (data.error) return alert(data.error)

        // Flatten for CSV
        const flatData = data.projects.map((p: any) => ({
            ProjectID: p.id,
            Title: p.title,
            Group: p.groups?.name,
            Supervisor: p.supervisors ? p.supervisors.app_users.full_name : 'Unassigned',
            Evaluator: p.evaluators ? p.evaluators.app_users.full_name : 'Unassigned',
            Status: p.status,
            // Marks can be flattened here too if needed
        }))

        downloadCSV(flatData, `report-batch-${batchId}.csv`)
    }

    const handlePrint = () => {
        if (!batchId) return alert("Select a batch")
        window.open(`/admin/reports/print?batchId=${batchId}`, '_blank')
    }

    return (
        <Card>
            <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4 items-center">
                    <Select onValueChange={setBatchId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select Batch" />
                        </SelectTrigger>
                        <SelectContent>
                            {batches.map((b: any) => (
                                <SelectItem key={b.id} value={b.id}>{b.name} ({b.current_semester}th Sem)</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button variant="outline" onClick={handleExport} disabled={loading}>
                        {loading ? 'Generating...' : 'Download Excel (CSV)'}
                    </Button>

                    <Button onClick={handlePrint}>
                        Print / PDF View
                    </Button>
                </div>

                <div className="text-sm text-muted-foreground p-4 bg-slate-50 rounded">
                    <p><strong>Reports Included:</strong> Project List, Supervisor Allocations, Current Status.</p>
                    <p>For Grade Sheets, use the Print view.</p>
                </div>
            </CardContent>
        </Card>
    )
}
