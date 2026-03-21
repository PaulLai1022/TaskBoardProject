import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, TaskStatus } from '@/types'
import TaskCard from './TaskCard'
import { useAuthStore } from '@/store/authStore'

interface TaskColumnProps {
  id: string
  title: string
  color: string
  tasks: Task[]
  onDetailTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onAddTask: (status: TaskStatus) => void
}

const priorityConfig = {
  low: { label: 'Low', color: '#94a3b8' },
  normal: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
} as const

/**
 * Task column component
 * Displays a status column and its task list
 */
export default function TaskColumn({ id, title, color, tasks, onDetailTask, onEditTask, onAddTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const { isGuest } = useAuthStore()

  /**
   * Handle adding task
   */
  const handleAddTask = () => {
    onAddTask(id as TaskStatus)
  }

  return (
    <div
      ref={setNodeRef}
      className={`task-column ${isOver ? 'drag-over' : ''}`}
      style={{ '--column-color': color } as React.CSSProperties}
    >
      <div className="task-column-header" style={{ borderColor: color }}>
        <div className="task-column-title-container">
          <h3 className="task-column-title">{title}</h3>
          <span className="task-count">{tasks.length}</span>
        </div>
        {!isGuest && (
          <button className="btn-add-column-task" onClick={handleAddTask} title="Add Task">
            +
          </button>
        )}
      </div>

      <div className="task-column-content">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              priorityConfig={priorityConfig}
              onDetail={onDetailTask}
              onEdit={onEditTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="task-column-empty">
            <p>No tasks</p>
            <p className="task-column-hint">Drag tasks here</p>
          </div>
        )}
      </div>
    </div>
  )
}
