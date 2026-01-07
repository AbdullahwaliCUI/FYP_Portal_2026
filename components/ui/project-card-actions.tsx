'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProjectEditModal } from '@/components/ui/project-edit-modal'
import { 
  Edit, 
  Trash2, 
  Share2, 
  Heart, 
  MoreVertical,
  Copy,
  MessageSquare,
  ExternalLink
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'

interface ProjectCardActionsProps {
  projectId: number
  projectTitle: string
  projectDescription?: string
  onEdit?: () => void
  onDelete?: () => void
  onFavorite?: () => void
  isFavorite?: boolean
  shareUrl?: string
  className?: string
}

export function ProjectCardActions({
  projectId,
  projectTitle,
  projectDescription,
  onEdit,
  onDelete,
  onFavorite,
  isFavorite = false,
  shareUrl,
  className = ""
}: ProjectCardActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit()
    } else {
      // Show edit modal by default
      setShowEditModal(true)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (onDelete) {
      onDelete()
    }
    setShowDeleteDialog(false)
    toast({
      title: "Project Deleted",
      description: `"${projectTitle}" has been deleted successfully.`,
    })
  }

  const handleFavorite = () => {
    if (onFavorite) {
      onFavorite()
    }
    toast({
      title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
      description: `"${projectTitle}" ${isFavorite ? 'removed from' : 'added to'} your favorites.`,
    })
  }

  const handleShare = () => {
    setShowShareMenu(true)
  }

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        toast({
          title: "Link Copied",
          description: "Project link has been copied to clipboard.",
        })
      }
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      })
    }
  }

  const shareViaWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const url = shareUrl || window.location.href
      const text = `Check out this project: ${projectTitle}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <>
      {/* Mobile-first: Show individual buttons on larger screens, dropdown on mobile */}
      <div className={`flex items-center gap-1 ${className}`}>
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden sm:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFavorite}
            className={`h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 ${
              isFavorite ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile dropdown - shown only on mobile */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleFavorite}>
                <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => copyToClipboard(shareUrl || (typeof window !== 'undefined' ? window.location.href : ''))}>
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={shareViaWhatsApp}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Share via WhatsApp
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Share Menu for Desktop */}
      {showShareMenu && (
        <div className="hidden sm:block absolute right-0 top-10 z-50 bg-white border rounded-md shadow-lg p-2 min-w-[200px]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              copyToClipboard(shareUrl || (typeof window !== 'undefined' ? window.location.href : ''))
              setShowShareMenu(false)
            }}
            className="w-full justify-start"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              shareViaWhatsApp()
              setShowShareMenu(false)
            }}
            className="w-full justify-start"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Share via WhatsApp
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectTitle}"? This action cannot be undone.
              All associated data including submissions, marks, and feedback will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <ProjectEditModal
        project={{
          id: projectId,
          title: projectTitle,
          description: projectDescription
        }}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          // Refresh the page or update the UI
          window.location.reload()
        }}
      />
    </>
  )
}