import { create } from 'zustand'
import type { Task, FilterCriteria, BoardStats, CreateTaskInput, UpdateTaskInput } from '@/types'
import { TaskStatus } from '@/types'
import { getTasks, createTask, updateTask, deleteTask, moveTaskStatus } from '@/api'
import type { ApiError } from '@/api'
import { useAuthStore } from './authStore'

/**
 * Task state management interface
 */
interface TaskState {
  tasks: Task[]
  filter: FilterCriteria
  isLoading: boolean
  error: string | null
  
  setFilter: (filter: Partial<FilterCriteria>) => void
  resetFilter: () => void
  
  fetchTasks: () => Promise<void>
  addTask: (task: CreateTaskInput) => Promise<void>
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
  
  getFilteredTasks: () => Task[]
  getBoardStats: () => BoardStats
  getTaskById: (id: string) => Task | undefined
}

/**
 * Get error message from ApiError object
 */
function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    if ('message' in err) {
      return String((err as ApiError).message)
    }
  }
  if (err instanceof Error) {
    return err.message
  }
  return String(err) || 'Unknown error'
}

/**
 * Task state management store
 */
export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  filter: {
    search: '',
    status: null,
    priority: null,
    tag: null,
  },
  
  isLoading: false,
  error: null,
  
  /**
   * Set filter criteria
   */
  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }))
  },
  
  /**
   * Reset filter criteria
   */
  resetFilter: () => {
    set({
      filter: {
        search: '',
        status: null,
        priority: null,
        tag: null,
      },
    })
  },
  
  /**
   * Fetch task list
   */
  fetchTasks: async () => {
    const accessToken = useAuthStore.getState().getAccessToken()
    if (!accessToken) {
      console.warn('Not logged in, cannot fetch tasks')
      return
    }
    
    set({ isLoading: true, error: null })
    
    try {
      const tasks = await getTasks(accessToken, {})
      set({ tasks, isLoading: false })
    } catch (error) {
      const message = getErrorMessage(error)
      console.error('Failed to fetch tasks:', message)
      set({ error: message, isLoading: false })
    }
  },
  
  /**
   * Add task
   */
  addTask: async (taskInput) => {
    const accessToken = useAuthStore.getState().getAccessToken()
    if (!accessToken) {
      console.warn('Not logged in, cannot add task')
      return
    }
    
    try {
      const newTask = await createTask(accessToken, taskInput)
      set((state) => ({
        tasks: [newTask, ...state.tasks],
      }))
    } catch (error) {
      console.error('Failed to add task:', error)
      throw error
    }
  },
  
  /**
   * Update task
   */
  updateTask: async (id, updates) => {
    const accessToken = useAuthStore.getState().getAccessToken()
    if (!accessToken) {
      console.warn('Not logged in, cannot update task')
      return
    }
    
    try {
      const updatedTask = await updateTask(accessToken, id, updates)
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? updatedTask : task
        ),
      }))
    } catch (error) {
      console.error('Failed to update task:', error)
      throw error
    }
  },
  
  /**
   * Delete task
   */
  deleteTask: async (id) => {
    const accessToken = useAuthStore.getState().getAccessToken()
    if (!accessToken) {
      console.warn('Not logged in, cannot delete task')
      return
    }
    
    try {
      await deleteTask(accessToken, id)
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }))
    } catch (error) {
      console.error('Failed to delete task:', error)
      throw error
    }
  },
  
  /**
   * Move task status
   * Uses optimistic update: update local state first, then call API asynchronously
   */
  moveTask: async (taskId, newStatus) => {
    const accessToken = useAuthStore.getState().getAccessToken()
    if (!accessToken) {
      console.warn('Not logged in, cannot move task')
      return
    }
    
    // Save current task state for rollback on failure
    const currentTask = get().tasks.find((t) => t.id === taskId)
    if (!currentTask) return
    
    const oldStatus = currentTask.status
    
    // Optimistic update: update local state immediately
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ),
    }))
    
    // Call API asynchronously, don't block UI
    try {
      const updatedTask = await moveTaskStatus(accessToken, taskId, newStatus)
      // Update with server response (ensure data consistency)
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? updatedTask : task
        ),
      }))
    } catch (error) {
      console.error('Failed to move task:', error)
      // Rollback to previous state on failure
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === taskId ? { ...task, status: oldStatus } : task
        ),
      }))
      throw error
    }
  },
  
  /**
   * Get filtered task list
   */
  getFilteredTasks: () => {
    const { tasks, filter } = get()
    return tasks.filter((task) => {
      if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) {
        return false
      }
      if (filter.status && task.status !== filter.status) {
        return false
      }
      if (filter.priority && task.priority !== filter.priority) {
        return false
      }
      if (filter.tag && task.tag !== filter.tag) {
        return false
      }
      return true
    })
  },
  
  /**
   * Get board statistics
   */
  getBoardStats: () => {
    const tasks = get().tasks
    const now = new Date().getTime()
    
    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      inReview: tasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      overdue: tasks.filter(
        (t) =>
          t.dueDate &&
          new Date(t.dueDate).getTime() < now &&
          t.status !== TaskStatus.DONE
      ).length,
    }
  },
  
  /**
   * Get task by ID
   */
  getTaskById: (id) => {
    return get().tasks.find((task) => task.id === id)
  },
}))
