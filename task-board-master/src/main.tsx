import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import '@/assets/styles/global.scss'

/**
 * 应用入口文件
 * 创建 React 根实例并渲染应用
 */
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('找不到 root 元素')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
