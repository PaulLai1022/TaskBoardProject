import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from '@/components/Layout'
import Board from '@/pages/Board'
import Login from '@/pages/Login'
import ProtectedRoute from '@/components/ProtectedRoute'

/**
 * Route configuration array
 * Defines all routing rules for the application
 */
export const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Board />,
      },
    ],
  },
]

/**
 * Create browser router instance
 */
const router = createBrowserRouter(routes)

/**
 * Router provider component
 * Provides routing configuration to the entire application
 * @returns JSX.Element
 */
export default function AppRouter() {
  return <RouterProvider router={router} />
}
