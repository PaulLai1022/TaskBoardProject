import { useTaskStore } from '@/store/taskStore'
import { TaskStatus, TaskPriority } from '@/types'

/**
 * Board statistics component
 * Displays task statistics and search/filter functionality
 */
export default function BoardStats() {
  const { getBoardStats, filter, setFilter, resetFilter } = useTaskStore()
  const stats = getBoardStats()

  const statItems = [
    { label: 'Total', value: stats.total, color: '#64748b' },
    { label: 'Completed', value: stats.done, color: '#10b981' },
    { label: 'Overdue', value: stats.overdue, color: '#ef4444' },
  ]

  return (
    <div className="board-stats">
      <div className="stats-content">
        {/* Left side statistics */}
        <div className="stats-list">
          {statItems.map((item) => (
            <div key={item.label} className="stat-item">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.color }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Right side search and filters */}
        <div className="stats-filters">
          <div className="filter-search-wrapper">
            <input
              type="text"
              placeholder="Search tasks..."
              value={filter.search}
              onChange={(e) => setFilter({ search: e.target.value })}
              className="filter-search-input"
            />
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filter.status || ''}
              onChange={(e) =>
                setFilter({ status: (e.target.value as TaskStatus) || null })
              }
              className="filter-select-input"
            >
              <option value="">All Status</option>
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.IN_REVIEW}>In Review</option>
              <option value={TaskStatus.DONE}>Done</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filter.priority || ''}
              onChange={(e) =>
                setFilter({ priority: (e.target.value as TaskPriority) || null })
              }
              className="filter-select-input"
            >
              <option value="">All Priority</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.NORMAL}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
            </select>
          </div>

          <button className="btn-reset" onClick={resetFilter}>
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
