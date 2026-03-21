import { useState, useMemo, useEffect, useRef } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { TaskStatus, type Task } from '@/types'
import TaskCard from './components/TaskCard'
import TaskColumn from './components/TaskColumn'
import BoardStats from './components/BoardStats'
import TaskModal from './components/TaskModal'
import TaskDetailModal from './components/TaskDetailModal'
import './index.scss'

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

/**
 * Board page component
 * Displays a four-column kanban board layout with drag and drop support
 * @returns JSX.Element
 */
export default function Board() {
  const { getFilteredTasks, moveTask, fetchTasks } = useTaskStore()
  const { isAuthenticated, restoreSession } = useAuthStore()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus | null>(null)
  
  // Flag to prevent duplicate API calls
  const isInitializedRef = useRef(false)

  const tasks = getFilteredTasks()

  /**
   * Initialize and restore session
   * Only executes once on component mount
   */
  useEffect(() => {
    if (isInitializedRef.current) {
      return
    }
    isInitializedRef.current = true
    
    restoreSession().then(() => {
      // restoreSession updates isAuthenticated state internally
    })
  }, [])

  /**
   * Fetch tasks when authentication state changes
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks()
    }
  }, [isAuthenticated, fetchTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const activeTask = useMemo(() => {
    return activeId ? tasks.find((t) => t.id === activeId) : null
  }, [activeId, tasks])

  /**
   * Handle drag start
   */
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  /**
   * Handle drag end
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Check if dropped over a column directly
    const column = boardColumns.find((col) => col.id === overId)
    if (column) {
      await moveTask(taskId, column.id)
      return
    }

    // Check if dropped over another task - find which column that task belongs to
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask && overTask.id !== taskId) {
      // Only move if the status is different
      const currentTask = tasks.find((t) => t.id === taskId)
      if (currentTask && currentTask.status !== overTask.status) {
        await moveTask(taskId, overTask.status)
      }
    }
  }

  /**
   * Handle adding new task
   */
  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status)
    setEditingTask(null)
    setIsModalOpen(true)
  }

  /**
   * Handle editing task
   */
  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setDefaultStatus(null)
    setIsModalOpen(true)
  }

  /**
   * Handle viewing task details
   */
  const handleDetailTask = (task: Task) => {
    setDetailTaskId(task.id)
  }

  /**
   * Handle closing modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setDefaultStatus(null)
  }

  /**
   * Handle closing detail modal
   */
  const handleCloseDetailModal = () => {
    setDetailTaskId(null)
  }

  return (
    <div className="board-page">
      <BoardStats />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="board-columns">
          {boardColumns.map((column) => (
            <TaskColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasks.filter((task) => task.status === column.id)}
              onDetailTask={handleDetailTask}
              onEditTask={handleEditTask}
              onAddTask={handleAddTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              priorityConfig={priorityConfig}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        task={editingTask}
        defaultStatus={defaultStatus}
      />

      <TaskDetailModal
        taskId={detailTaskId || ''}
        isOpen={!!detailTaskId}
        onClose={handleCloseDetailModal}
      />
    </div>
  )
}
