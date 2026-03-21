import { useState } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { TaskStatus } from '@/types'
import ConfirmModal from '@/components/ConfirmModal'
import './TaskDetailModal.scss'

const boardColumns = [
  { id: TaskStatus.TODO, title: 'To Do', color: '#94a3b8' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#3b82f6' },
  { id: TaskStatus.IN_REVIEW, title: 'In Review', color: '#f59e0b' },
  { id: TaskStatus.DONE, title: 'Done', color: '#10b981' },
] as const

const priorityConfig = {
  low: { label: 'Low', color: '#94a3b8' },
  normal: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
} as const

interface TaskDetailModalProps {
  taskId: string
  isOpen: boolean
  onClose: () => void
}

/**
 * Task detail modal component
 * Displays detailed information of a single task
 */
export default function TaskDetailModal({
  taskId,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const { getTaskById, deleteTask } = useTaskStore()
  const { isGuest, user } = useAuthStore()

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const task = getTaskById(taskId)

  if (!task) {
    return null
  }

  const canDelete = !isGuest && user?.id === task.userId

  const priority = priorityConfig[task.priority]
  const column = boardColumns.find((c) => c.id === task.status)
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now() &&
    task.status !== TaskStatus.DONE

  const handleDeleteClick = () => {
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(task.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete task:', error)
      alert('Failed to delete task, please try again')
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDueDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      <div className="task-detail-modal-overlay" onClick={onClose}>
        <div className="task-detail-modal" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="modal-close-btn">
            ✕
          </button>

          <div className="task-detail-modal-content">
            <div className="task-detail-main">
              <div className="task-detail-header">
                <h1 className="task-detail-title">{task.title}</h1>
                <div className="task-detail-meta">
                  <span
                    className="task-status-badge"
                    style={{ backgroundColor: column?.color }}
                  >
                    {column?.title}
                  </span>
                  <span
                    className="task-priority-badge"
                    style={{ backgroundColor: priority.color }}
                  >
                    {priority.label} Priority
                  </span>
                  {isOverdue && (
                    <span className="task-overdue-badge">Overdue</span>
                  )}
                </div>
              </div>

              <div className="task-detail-section">
                <h3 className="section-title">Description</h3>
                <div className="task-description">
                  {task.description || (
                    <span className="text-muted">No description</span>
                  )}
                </div>
              </div>
            </div>

            <div className="task-detail-sidebar">
              {canDelete && (
                <div className="sidebar-section">
                  <h3 className="section-title">Actions</h3>
                  <button onClick={handleDeleteClick} className="btn-delete-task">
                    🗑️ Delete Task
                  </button>
                </div>
              )}

              <div className="sidebar-section">
                <h3 className="section-title">Tags</h3>
                <div className="tag-list">
                  {task.tag ? (
                    task.tag.split(',').filter(t => t.trim()).map((tag, index) => (
                      <span key={index} className="tag-item">
                        {tag.trim()}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted">No tags</span>
                  )}
                </div>
              </div>

              {task.dueDate && (
                <div className="sidebar-section">
                  <h3 className="section-title">Due Date</h3>
                  <div className={`due-date ${isOverdue ? 'overdue' : ''}`}>
                    {formatDueDate(task.dueDate)}
                  </div>
                </div>
              )}

              <div className="sidebar-section">
                <h3 className="section-title">Time</h3>
                <div className="time-info">
                  <div className="time-item">
                    <span className="time-label">Created</span>
                    <span className="time-value">{formatDate(task.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Confirm Delete"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  )
}
