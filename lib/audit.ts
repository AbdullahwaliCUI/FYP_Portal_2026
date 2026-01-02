import { createClient } from '@/lib/supabase/server'

export async function logAction(
    action: string,
    entityType: string,
    entityId: string | number | null,
    details: any
) {
    try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        // We try to get the app_user_id if possible, 
        // but the table might link to app_users or auth.users. 
        // Step 2 Schema check: audit_logs -> actor_id references app_users.id.

        let actorId = null
        if (user) {
            const { data: appUser } = await supabase.from('app_users').select('id').eq('auth_user_id', user.id).single()
            actorId = appUser?.id
        }

        if (!actorId) {
            console.error("Audit Log: No actor ID found (System action or unauth)")
            // return, or log as system if allowed. Schema dictates referencing app_users, so strictly needs user.
            return
        }

        await supabase.from('audit_logs').insert({
            action,
            entity_type: entityType,
            entity_id: entityId ? Number(entityId) : null,
            actor_id: actorId,
            details,
            created_at: new Date().toISOString()
        })

    } catch (error) {
        console.error("Failed to log action:", error)
        // Don't throw, we don't want to break the main action if logging fails
    }
}
