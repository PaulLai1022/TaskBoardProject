import AppRouter from './router'
import './App.scss'

/**
 * Application root component
 * Serves as the entry point of the application, containing routing configuration
 * @returns JSX.Element
 */
function App() {
  return (
    <div className="app">
      <AppRouter />
    </div>
  )
}

export default App
