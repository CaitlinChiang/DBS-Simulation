import { ReactElement, useState } from 'react'
import './Layout.css'
import Floorplan from '../floorplan'

const Layout = (): ReactElement => {
  const [customerSpawnRate, setCustomerSpawnRate] = useState(0.33) // 1 customer every 3 seconds
  const [startSimulation, setStartSimulation] = useState(false)

  return (
    <div className='layout'>
      {/* Start of Sidebar */}
      <div className='sidebar'>
        {/* Start of Logo */}
        <div className='logo-sidebar'>
          {/* <img src='/logo-name.jpg' alt='DBS Logo' /> */}
        </div>
        {/* End of Logo */}

        {/* Start of Simulation Settings */}
        <h3 className='simulation-settings'>Simulation Settings</h3>
       
        <div className='simulation-settings-item'>
          <label className='simulation-settings-item-label' htmlFor='customerSpawnRate'>Customer Spawn Rate</label>
          <input
            type='range'
            min='0'
            max='1'
            step='0.01'
            value={customerSpawnRate}
            onChange={(e) => setCustomerSpawnRate(parseFloat(e.target.value))}
          />
          <span>{customerSpawnRate}</span>
        </div>
        {/* End of Simulation Settings */}

        {/* Start of Start Simulation Button */}
        <div>
          <button
            onClick={() => setStartSimulation(!startSimulation)}
            className={startSimulation ? 'stop-simulation' : 'start-simulation'}
          >
            Start Simulation
          </button>
        </div>
        {/* End of Start Simulation Button */}
      </div>
      {/* End of Sidebar */}

      <div className='content'>
        <Floorplan />
      </div>
    </div>
  )
}

export default Layout
