import React from 'react'
import ReactDOM from 'react-dom/client'
import { GlobalProvider } from './hooks/useGlobal'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalProvider>
      <App />
    </GlobalProvider>
  </React.StrictMode>,
)
