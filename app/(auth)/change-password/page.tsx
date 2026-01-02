import { updatePassword } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function ChangePasswordPage({
    searchParams,
}: {
    searchParams: { error?: string }
}) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>You must update your password to continue.</CardDescription>
                </CardHeader>
                <form action={updatePassword}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required />
                            </div>
                            {searchParams?.error && (
                                <div className="text-sm font-medium text-destructive">
                                    {searchParams.error}
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full">Update Password</Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
