import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAuthStore } from '@/store/authStore'
import type { Task } from '@/types'
import { TaskStatus } from '@/types'

interface TaskCardProps {
  task: Task
  priorityConfig: Record<string, { label: string; color: string }>
  isDragging?: boolean
  onDetail?: (task: Task) => void
  onEdit?: (task: Task) => void
}

/**
 * Task card component
 * Displays task summary information, supports drag and drop
 */
export default function TaskCard({
  task,
  priorityConfig,
  isDragging: isOverlayDragging = false,
  onDetail,
  onEdit,
}: TaskCardProps) {
  const { user, isGuest } = useAuthStore()

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now() &&
    task.status !== TaskStatus.DONE

  const canEdit = !isGuest && user?.id === task.userId
  const canDrag = !isGuest && user?.id === task.userId

  // Use useSortable for drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? transition : undefined,
  }

  const isDragging = isSortableDragging || isOverlayDragging

  const handleClick = () => {
    if (!isDragging && onDetail) {
      onDetail(task)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onEdit) {
      onEdit(task)
    }
  }

  const priority = priorityConfig[task.priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${isOverdue ? 'task-card-overdue' : ''} ${
        isGuest ? 'task-card-readonly' : ''
      } ${isDragging ? 'task-card-dragging' : ''} ${
        canDrag ? 'task-card-draggable' : ''
      }`}
      onClick={handleClick}
    >
      <div className="task-card-header">
        <div className="task-title-container">
          <span
            className="task-priority"
            style={{ backgroundColor: priority.color }}
          >
            {priority.label}
          </span>
          <h3 className="task-title">{task.title}</h3>
          {canEdit && (
            <button className="task-edit-btn" onClick={handleEdit}>
              ✏️
            </button>
          )}
        </div>
      </div>

      <div className="task-card-footer">
        {task.dueDate && (
          <span className={`task-due-date ${isOverdue ? 'overdue' : ''}`}>
            {isOverdue ? 'Overdue ' : ''}
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  )
}
