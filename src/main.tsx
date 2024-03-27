import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SimulationSpeedProvider } from './components/hooks/useSimulationSpeed';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SimulationSpeedProvider>
      <App />
    </SimulationSpeedProvider>
  </React.StrictMode>,
)
