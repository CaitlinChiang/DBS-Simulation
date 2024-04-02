import { ReactElement, useState, useEffect } from 'react'
import CustomerElement from './Customer'
import './Floorplan.css'
// import { CustomerPosition } from '../../enums/customerPosition'
// import { CustomerAnimationState } from '../../enums/customerAnimationState'
import { Customer } from '../../types/customer'

const Floorplan = (): ReactElement => {
  const [startSimulation, setStartSimulation] = useState<boolean>(false)
  const [customerArrivalRate, setCustomerArrivalRatew] = useState<number>(3000)
  
  // Arriving Customers to Main Queue
  const [arrivingCustomers, setArrivingCustomers] = useState<Customer[]>([])
  const [mainQueue, setMainQueue] = useState<Customer[]>([])

  // Customers in Waiting Area to Counters
  const waitingAreaCapacity = 15
  const [waitingArea, setWaitingArea] = useState<Customer[]>([])

  return (
    <div className='floorplan'>
      <div className='section-inside'>
        {/* Start of Counters Batch 01 */}
        <div className='counters-batch01'>
          <div className='counter-batch01-item floorplan-element'>
            <p>COUNTER 01</p>
          </div>
          <div className='counter-batch01-item floorplan-element'>
            <p>COUNTER 02</p>
          </div>
          <div className='counter-batch01-item floorplan-element'>
            <p>COUNTER 03</p>
          </div>
        </div>
        {/* End of Counters Batch 01 */}

        {/* Start of Counters Batch 02 */}
        <div className='counters-batch02'>
          <div className='counter-batch02-item floorplan-element'>
            <p>COUNTER 04</p>
          </div>
          <div className='counter-batch02-item floorplan-element'>
            <p>COUNTER 05</p>
          </div>
          <div className='counter-batch02-item floorplan-element'>
            <p>COUNTER 06</p>
          </div>
          <div className='counter-batch02-item floorplan-element'>
            <p>COUNTER 07</p>
          </div>
        </div>
        {/* End of Counters Batch 02 */}

        {/* Start of Counters Batch 03 */}
        <div className='counters-batch03'>
          <div className='counter-batch03-item floorplan-element'>
            <p>COUNTER 08</p>
          </div>
          <div className='counter-batch03-item floorplan-element'>
            <p>COUNTER 09</p>
          </div>
          <div className='counter-batch03-item floorplan-element'>
            <p>COUNTER 10</p>
          </div>
          <div className='counter-batch03-item floorplan-element'>
            <p>COUNTER 11</p>
          </div>
        </div>
        {/* End of Counters Batch 03 */}

        {/* Start of Waiting Area */}
        <div className='waiting-area'>
          <p>WAITING AREA</p>
          <div className='waiting-area-grid'>
            {Array.from({ length: waitingAreaCapacity }, (_, index) => (
              <div key={index} className='waiting-area-cell'>
                {waitingArea[index] ? waitingArea[index].element : null}
              </div>
            ))}
          </div>
        </div>
        {/* End of Waiting Area */}

        {/* Start of Divider for Inside & Outside Branch */}
        <div className='divider-branch-inside-and-out' />
        {/* End of Divider for Inside & Outside Branch */}
        
        {/* Start of Divider for Inside Branch */}
        <div className='divider-branch-inside' />
        {/* End of Divider for Inside Branch */}

        {/* Start of App Booth Learnings */}
        <div className='app-booths'>
          <div className='app-booth-item'>
            <p>BOOTH 01</p>
          </div>
          <div className='app-booth-item'>
            <p>BOOTH 02</p>
          </div>
        </div>
        {/* End of App Booth Learnings */}
      </div>

      <div className='section-outside'>
        {/* Start of ATM Coin Machine */}
        <div className='atm-coin-machines'>
          <div className='floorplan-element'>
            <p>ATM COINS</p>
          </div>
        </div>
        {/* End of ATM Coin Machine */}

        {/* Start of ATMs Batch 02 */}
        <div className='atm-machines-batch02'>
          <div className='atm-machines-batch02-item floorplan-element'>
            <p>ATM 04</p>
          </div>
          <div className='atm-machines-batch02-item floorplan-element'>
            <p>ATM 05</p>
          </div>
          <div className='atm-machines-batch02-item floorplan-element'>
            <p>ATM 06</p>
          </div>
        </div>
        {/* End of ATMs Batch 02 */}

        {/* Start of VTM Machines */}
        <div className='vtm-machines'>
          <div className='vtm-machine-item floorplan-element'>
            <p>VTM 01</p>
          </div>
          <div className='vtm-machine-item floorplan-element'>
            <p>VTM 02</p>
          </div>
          <div className='vtm-machine-item floorplan-element'>
            <p>VTM 03</p>
          </div>
        </div>
        {/* End of VTM Machines */}
        
        {/* Start of Divider Branch Outside*/}
        <div className='divider-branch-outside' />
        {/* End of Divider Branch Outside*/}

        {/* Start of ATMs Batch 01 */}
        <div className='atm-machines-batch01'>
          <div className='atm-machines-batch01-item floorplan-element'>
            <p>ATM 01</p>
          </div>
          <div className='atm-machines-batch01-item floorplan-element'>
            <p>ATM 02</p>
          </div>
          <div className='atm-machines-batch01-item floorplan-element'>
            <p>ATM 03</p>
          </div>
        </div>
        {/* End of ATMs Batch 01 */}
      </div>

      {/* Start of Main Queue */}
      <div className='main-queue'>
        <p>MAIN QUEUE</p>
        <div>
          {mainQueue.map((customer) => (
            <div key={customer.id} className="customer moving-to-waiting-area">
              {customer.element}
            </div>
          ))}
        </div>
      </div>
      {/* End of Main Queue */}

      {/* Start of Spawning Section */}
      <div className='spawning-section'>
        {arrivingCustomers.map((customer) => (
          <div key={customer.id} className="customer moving-to-queue">
            {customer.element}
          </div>
        ))}
      </div>
      {/* End of Spawning Section */}
    </div>
  )
}

export default Floorplan
