export function validateDriveUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        if (parsed.hostname !== 'drive.google.com' && parsed.hostname !== 'docs.google.com') {
            return false;
        }
        // Check if public/shareable? Hard to strictly validate public access without pinging, 
        // but at least check domain.
        return true;
    } catch (e) {
        return false;
    }
}
