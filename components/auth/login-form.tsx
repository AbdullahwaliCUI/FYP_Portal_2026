"use client"

import * as React from "react"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { login } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export function LoginForm() {
    const [showPassword, setShowPassword] = React.useState(false)

    // @ts-ignore
    const [state, formAction, isPending] = useActionState(login, { error: null })

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>FYP Portal Login</CardTitle>
                <CardDescription>Enter your credentials to access the system.</CardDescription>
            </CardHeader>
            <form action={formAction}>
                <CardContent>
                    <div className="grid w-full items-center gap-4">
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="user@university.edu"
                                required
                            />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        {state?.error && (
                            <div className="text-sm font-medium text-destructive">
                                {state.error}
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    )
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
        </Button>
    )
}

function FormError() {
    // We can read the URL params client-side or pass them down.
    // simpler to pass them down from the parent page if possible, 
    // but for now let's just use the server rendering of the parent page for errors.
    // Actually, the parent page renders the errors passed via searchParams.
    // So we will leave error rendering to the parent page, or move it here.
    return null
}
