import { ReactElement, useState, useEffect } from 'react'
import CustomerElement from './Customer'
import './Floorplan.css'
// import { CustomerPosition } from '../../enums/customerPosition'
// import { CustomerAnimationState } from '../../enums/customerAnimationState'
import { Customer } from '../../types/customer'

const Floorplan = (): ReactElement => {
  const [startSimulation, setStartSimulation] = useState<boolean>(false)
  const [customerArrivalRate, setCustomerArrivalRate] = useState<number>(3000)
  
  // Arriving Customers to Main Queue
  const [arrivingCustomers, setArrivingCustomers] = useState<Customer[]>([])
  const [mainQueue, setMainQueue] = useState<Customer[]>([])

  // Customers in Waiting Area to Counters
  const waitingAreaCapacity = 15
  const [waitingArea, setWaitingArea] = useState<Customer[]>([])
  const [counter1, setCounter1] = useState<boolean>(false)
  const [counter2, setCounter2] = useState<boolean>(false)
  const [counter3, setCounter3] = useState<boolean>(false)
  const [counter4, setCounter4] = useState<boolean>(false)
  const [counter5, setCounter5] = useState<boolean>(false)
  const [counter6, setCounter6] = useState<boolean>(false)
  const [counter7, setCounter7] = useState<boolean>(false)
  const [counter8, setCounter8] = useState<boolean>(false)
  const [counter9, setCounter9] = useState<boolean>(false)
  const [counter10, setCounter10] = useState<boolean>(false)
  const [counter11, setCounter11] = useState<boolean>(false)

  // Customers in App Booths
  const [appBooth1, setAppBooth1] = useState<boolean>(false)
  const [appBooth2, setAppBooth2] = useState<boolean>(false)

  // Customers in ATMs and VTMs
  const [atm1, setAtm1] = useState<boolean>(false)
  const [atm2, setAtm2] = useState<boolean>(false)
  const [atm3, setAtm3] = useState<boolean>(false)
  const [atm4, setAtm4] = useState<boolean>(false)
  const [atm5, setAtm5] = useState<boolean>(false)
  const [atm6, setAtm6] = useState<boolean>(false)
  const [atmCoins, setAtmCoins] = useState<number>(0)
  const [vtm1, setVtm1] = useState<boolean>(false)
  const [vtm2, setVtm2] = useState<boolean>(false)
  const [vtm3, setVtm3] = useState<boolean>(false)

  // Customer Object
  const newCustomer: Customer = { 
    id: new Date().getTime(),
    position: 'START',
    element: <CustomerElement />
  }

  // Run code when the component renders
  useEffect(() => {
    if (!startSimulation) return

    const spawnCustomer = () => {
      // setArrivingCustomers([newCustomer])
      setArrivingCustomers(prev => [...prev, newCustomer])

      // Move customer to the queue after the animation duration
      setTimeout(() => {
        setMainQueue(prevQueue => [...prevQueue, newCustomer])
        setArrivingCustomers([])
      }, 3000)
    }

    const intervalId = setInterval(spawnCustomer, customerArrivalRate)

    return () => clearInterval(intervalId)
  }, [startSimulation, customerArrivalRate])

  useEffect(() => {
    // Move customer from main queue to waiting area if there's space
    const moveCustomerToWaitingArea = () => {
      if (mainQueue.length > 0 && waitingArea.length < waitingAreaCapacity) {
        const customerToMove = mainQueue[0]
        customerToMove.position = 'WAITING_AREA'
        setWaitingArea(prevWaiting => [...prevWaiting, customerToMove])
        setMainQueue(prevQueue => prevQueue.slice(1))
      }
    }

    const moveInterval = setInterval(moveCustomerToWaitingArea, 1000)
    return () => clearInterval(moveInterval)
  }, [mainQueue, waitingArea.length])

  useEffect(() => {
    const moveCustomerToCounter = () => {
      // Check if there is at least one customer in the waiting area and at least one counter available
      if (waitingArea.length > 0 && [counter1, counter2, counter3, counter4, counter5, counter6, counter7, counter8, counter9, counter10, counter11].includes(false)) {
        // Find the first available counter
        const counters = [setCounter1, setCounter2, setCounter3, setCounter4, setCounter5, setCounter6, setCounter7, setCounter8, setCounter9, setCounter10, setCounter11]
        const availableCounterIndex = counters.findIndex(counterSetter => !eval(counterSetter.name.replace("set", "").toLowerCase()))
        
        if (availableCounterIndex !== -1) {
          // Move the first customer in the waiting area to the available counter
          const customerToMove = waitingArea.shift();
          counters[availableCounterIndex](true); // Mark the counter as occupied
          
          // Simulate the customer being serviced for 2 seconds, then release the counter
          setTimeout(() => {
            counters[availableCounterIndex](false); // Mark the counter as available again after 2 seconds
          }, 2000);
  
          // Update the waiting area state without the moved customer
          setWaitingArea([...waitingArea]);
        }
      }
    };
  
    // Periodically check for available counters and move customers to them
    const intervalId = setInterval(moveCustomerToCounter, 1000); // Check every second
  
    return () => clearInterval(intervalId);
  }, [waitingArea, counter1, counter2, counter3, counter4, counter5, counter6, counter7, counter8, counter9, counter10, counter11]);
  

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
