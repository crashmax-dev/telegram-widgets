import { createRoot } from 'react-dom/client'
import { App } from './app'

const root = document.querySelector('#root')!
createRoot(root).render(<App />)
