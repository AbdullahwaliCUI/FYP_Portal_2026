'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { updateVisibility } from '@/app/(admin)/actions'

export function VisibilityControl({ initialFlags, batchId }: any) {
    const [flags, setFlags] = useState(initialFlags)
    const [loading, setLoading] = useState(false)

    const handleToggle = (key: string) => {
        const newFlags = { ...flags, [key]: !flags[key] }
        setFlags(newFlags)
    }

    const handleSave = async () => {
        setLoading(true)
        const res = await updateVisibility(batchId, flags)
        setLoading(false)
        if (res?.error) {
            alert('Error updating: ' + res.error)
        } else {
            alert('Settings Saved!')
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4 border p-4 rounded bg-slate-50">
                    <h4 className="font-semibold text-blue-800">6th Semester</h4>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="scope6"
                            checked={flags.scope6}
                            onCheckedChange={() => handleToggle('scope6')}
                        />
                        <Label htmlFor="scope6">Publish Pass/Fail</Label>
                    </div>
                </div>

                <div className="space-y-4 border p-4 rounded bg-slate-50">
                    <h4 className="font-semibold text-purple-800">7th Semester</h4>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="srs7"
                            checked={flags.srs7}
                            onCheckedChange={() => handleToggle('srs7')}
                        />
                        <Label htmlFor="srs7">Publish SRS (25)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="sdd7"
                            checked={flags.sdd7}
                            onCheckedChange={() => handleToggle('sdd7')}
                        />
                        <Label htmlFor="sdd7">Publish SDD (25)</Label>
                    </div>
                </div>

                <div className="space-y-4 border p-4 rounded bg-slate-50">
                    <h4 className="font-semibold text-green-800">8th Semester</h4>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="p60"
                            checked={flags.progress60_8}
                            onCheckedChange={() => handleToggle('progress60_8')}
                        />
                        <Label htmlFor="p60">Publish 60% (15)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="p100"
                            checked={flags.progress100_8}
                            onCheckedChange={() => handleToggle('progress100_8')}
                        />
                        <Label htmlFor="p100">Publish 100% (15)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="ext"
                            checked={flags.external8}
                            onCheckedChange={() => handleToggle('external8')}
                        />
                        <Label htmlFor="ext">Publish External (40)</Label>
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}
