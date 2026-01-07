'use client'

import { EnhancedProjectCard } from '@/components/ui/enhanced-project-card'

// Demo data
const demoProjects = [
  {
    id: 1,
    title: "AI-Powered Student Management System",
    description: "A comprehensive system for managing student records using artificial intelligence",
    status: "approved",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T15:30:00Z",
    groups: {
      name: "AI Warriors",
      batches: {
        current_semester: 6
      },
      group_members: [
        { student: { full_name: "Ahmed Ali" } },
        { student: { full_name: "Sara Khan" } },
        { student: { full_name: "Hassan Ahmed" } }
      ]
    },
    doc_links: [
      { component: "scope", semester: 6 }
    ]
  },
  {
    id: 2,
    title: "E-Commerce Platform with React & Node.js",
    description: "Modern e-commerce solution with real-time features",
    status: "pending",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T12:00:00Z",
    groups: {
      name: "Code Masters",
      batches: {
        current_semester: 7
      },
      group_members: [
        { student: { full_name: "Fatima Sheikh" } },
        { student: { full_name: "Omar Malik" } }
      ]
    },
    doc_links: [
      { component: "srs", semester: 7 },
      { component: "sdd", semester: 7 }
    ]
  },
  {
    id: 3,
    title: "Mobile Health Monitoring App",
    description: "Cross-platform mobile app for health tracking and monitoring",
    status: "in_progress",
    created_at: "2024-01-05T08:00:00Z",
    updated_at: "2024-01-22T16:45:00Z",
    groups: {
      name: "Health Tech",
      batches: {
        current_semester: 8
      },
      group_members: [
        { student: { full_name: "Zain Abbas" } },
        { student: { full_name: "Ayesha Tariq" } },
        { student: { full_name: "Bilal Hussain" } }
      ]
    },
    doc_links: [
      { component: "progress60", semester: 8 },
      { component: "progress100", semester: 8 }
    ]
  }
]

export default function DemoPage() {
  const handleEdit = (projectId: number) => {
    console.log('Edit project:', projectId)
  }

  const handleDelete = (projectId: number) => {
    console.log('Delete project:', projectId)
  }

  const handleFavorite = (projectId: number) => {
    console.log('Toggle favorite:', projectId)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Enhanced Project Cards Demo</h1>
        <p className="text-muted-foreground">
          Interactive project cards with Edit, Delete, Share, and Favorite actions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {demoProjects.map((project) => (
          <EnhancedProjectCard
            key={project.id}
            project={project}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onFavorite={handleFavorite}
            isFavorite={project.id === 2} // Demo: second project is favorited
            showActions={true}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Features Implemented:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><strong>Edit:</strong> Click edit button to open inline edit modal</li>
          <li><strong>Delete:</strong> Click delete with confirmation dialog</li>
          <li><strong>Share:</strong> Copy link or share via WhatsApp</li>
          <li><strong>Favorite:</strong> Toggle favorite status with heart icon</li>
          <li><strong>Mobile Responsive:</strong> Dropdown menu on mobile, individual buttons on desktop</li>
          <li><strong>Status Badges:</strong> Visual indicators for project status and semester</li>
          <li><strong>Progress Tracking:</strong> Shows deliverable completion status</li>
        </ul>
      </div>
    </div>
  )
}