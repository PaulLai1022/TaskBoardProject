import { useState, useEffect } from 'react'
import { useTaskStore } from '@/store/taskStore'
import { useAuthStore } from '@/store/authStore'
import { TaskStatus, TaskPriority, type Task } from '@/types'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  defaultStatus: TaskStatus | null
}

/**
 * Task edit modal component
 * Used for creating and editing tasks
 */
export default function TaskModal({ isOpen, onClose, task, defaultStatus }: TaskModalProps) {
  const { addTask, updateTask } = useTaskStore()
  const { isGuest, user } = useAuthStore()
  const isEditing = !!task

  const canEdit = !isGuest && (!task || user?.id === task.userId)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: TaskStatus.TODO,
    priority: TaskPriority.NORMAL,
    dueDate: '',
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (task) {
      // Convert comma-separated tag string to array
      const tags = task.tag ? task.tag.split(',').filter(t => t.trim()) : []
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || '',
        tags,
      })
    } else {
      // Default date is today for new tasks
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        title: '',
        description: '',
        status: defaultStatus || TaskStatus.TODO,
        priority: TaskPriority.NORMAL,
        dueDate: today,
        tags: [],
      })
    }
    setTagInput('')
  }, [task, defaultStatus])

  if (!isOpen || !canEdit) return null

  /**
   * Add tag
   */
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  /**
   * Remove tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  /**
   * Handle tag input enter key
   */
  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('Please enter task title')
      return
    }

    // Convert tags array to comma-separated string
    const tagString = formData.tags.join(',')

    try {
      if (isEditing && task) {
        await updateTask(task.id, {
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          tag: tagString,
        })
      } else {
        await addTask({
          title: formData.title,
          description: formData.description || undefined,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          tag: tagString,
        })
      }
      onClose()
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task, please try again')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-field">
            <label htmlFor="title">
              <span className="required">*</span>Task Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Task Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="form-row-three">
            <div className="form-field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as TaskStatus,
                  }))
                }
                disabled={!isEditing && defaultStatus !== null}
              >
                <option value={TaskStatus.TODO}>To Do</option>
                <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
                <option value={TaskStatus.IN_REVIEW}>In Review</option>
                <option value={TaskStatus.DONE}>Done</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as TaskPriority,
                  }))
                }
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.NORMAL}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="form-field">
            <label>Tags</label>
            <div className="tag-list-inline">
              {formData.tags.map((tag) => (
                <span key={tag} className="tag-item">
                  {tag}
                  <button
                    type="button"
                    className="tag-remove-btn"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="tag-input-inline-wrapper">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={formData.tags.length === 0 ? 'Type...' : 'Add tag...'}
                  className="tag-input-inline"
                />
                <button
                  type="button"
                  className="tag-add-inline-btn"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-confirm">
              {isEditing ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
