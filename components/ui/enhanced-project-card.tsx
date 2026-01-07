import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectCardActions } from '@/components/ui/project-card-actions'
import { Badge } from '@/components/ui/badge'

interface EnhancedProjectCardProps {
  project: any
  onEdit?: (projectId: number) => void
  onDelete?: (projectId: number) => void
  onFavorite?: (projectId: number) => void
  isFavorite?: boolean
  showActions?: boolean
  className?: string
}

export function EnhancedProjectCard({
  project,
  onEdit,
  onDelete,
  onFavorite,
  isFavorite = false,
  showActions = true,
  className = ""
}: EnhancedProjectCardProps) {
  const semester = project.groups?.batches?.current_semester || project.semester
  const members = project.groups?.group_members?.map((m: any) => m.student.full_name).join(', ') || 'No members'
  const groupName = project.groups?.name || 'No group'
  
  // Generate share URL for the project
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/project/${project.id}` : `/project/${project.id}`

  return (
    <Card className={`relative hover:shadow-md transition-shadow ${className}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1 pr-4">
            <CardTitle className="text-lg leading-tight">{project.title}</CardTitle>
            <CardDescription className="mt-1">
              Group: {groupName} | Members: {members}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Semester Badge */}
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
              {semester}th Sem
            </Badge>
            
            {/* Action Buttons */}
            {showActions && (
              <ProjectCardActions
                projectId={project.id}
                projectTitle={project.title}
                projectDescription={project.description}
                onEdit={() => onEdit?.(project.id)}
                onDelete={() => onDelete?.(project.id)}
                onFavorite={() => onFavorite?.(project.id)}
                isFavorite={isFavorite}
                shareUrl={shareUrl}
                className="relative"
              />
            )}
          </div>
        </div>
        
        {/* Status Badge if available */}
        {project.status && (
          <div className="mt-2">
            <Badge 
              variant={project.status === 'approved' ? 'default' : 'outline'}
              className={`text-xs ${
                project.status === 'approved' ? 'bg-green-100 text-green-800' :
                project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}
            >
              {project.status.toUpperCase()}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Project content goes here - can be customized based on your needs */}
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div className="font-medium">
                {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Last Updated:</span>
              <div className="font-medium">
                {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
          
          {/* Progress Indicators */}
          {semester && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Deliverables Progress</div>
              <div className="flex gap-2">
                {semester === 6 && (
                  <Badge variant="outline" className="text-xs">
                    Scope: {project.doc_links?.some((l: any) => l.component === 'scope') ? '✓' : '○'}
                  </Badge>
                )}
                {semester === 7 && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      SRS: {project.doc_links?.some((l: any) => l.component === 'srs') ? '✓' : '○'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      SDD: {project.doc_links?.some((l: any) => l.component === 'sdd') ? '✓' : '○'}
                    </Badge>
                  </>
                )}
                {semester === 8 && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      60%: {project.doc_links?.some((l: any) => l.component === 'progress60') ? '✓' : '○'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      100%: {project.doc_links?.some((l: any) => l.component === 'progress100') ? '✓' : '○'}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}