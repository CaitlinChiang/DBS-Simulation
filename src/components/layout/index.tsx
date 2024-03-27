import { ReactElement, useState, useEffect } from 'react'
import './Layout.css'
import Floorplan from '../floorplan'

import { Station } from '../../enums/station'
import { ARRIVAL_RATE } from '../../enums/rates'
import { generateCustomerFromArrivalRate, appendCustomerToArrivalStateQueue } from '../../simulation/generateCustomerFromArrivalRate'
import { stationManager } from '../../simulation/stationManager'
// import { convertToMilliseconds } from '../../utils/convertToAdjustedInterval'
import { averageDemographicDwellTimeManager } from '../../utils/averageDemographicDwellTimeManager'
import { mainQueueManager } from '../../simulation/mainQueueManager'
import { returnLaterQueueAgainManager } from '../../simulation/returnLaterQueueAgainManager'
import { returnLaterQueueNumberManager } from '../../simulation/returnLaterQueueNumberManager'
import { useSimulationSpeed } from '../hooks/useSimulationSpeed'

const Layout = (): ReactElement => {
  const [customerSpawnRate, setCustomerSpawnRate] = useState(0.33) // 1 customer every 3 seconds
  const [startSimulation, setStartSimulation] = useState(true)
  const [stationInfo, setStationInfo] = useState<Record<string, { queueLength: number[]; equipmentStatus: string[] }>>({});
  const [demographicInfo, setDemographicInfo] = useState<{ demographic: string, averageDwellTime: number }[]>([])
  const [mainQueueInfo, setMainQueueInfo] = useState<any>({ })
  const [returnLaterQueueAgainInfo, setReturnLaterQueueAgainInfo] = useState<number>(0)


  const { setSpeedMultiplier } = useSimulationSpeed()
  setSpeedMultiplier(10)


  generateCustomerFromArrivalRate(ARRIVAL_RATE, appendCustomerToArrivalStateQueue)

  // const intervalInSeconds: number = 1

  // setInterval(() => {
  //   const updatedInformation = stationManager.getStationQueueLengthAndEquipmentStatusInfo()
  //   console.log(updatedInformation)
  // }, 1000)

  //  stationManager.startEquipmentUpdateLoop()

  // useEffect(() => {
  //   // Function to update station info
  //   const fetchStationInfo = () => {
  //     const info = stationManager.getStationQueueLengthAndEquipmentStatusInfo();
  //     setStationInfo(info);
  //   };

  //   // Fetch initial station info
  //   fetchStationInfo();

  //   // Set up an interval to fetch station info periodically
  //   const intervalId = setInterval(fetchStationInfo, 100); // Update every 5 seconds

  //   // Clean up interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [])

  // useEffect(() => {
  //   let cleanupFunction;
  
  //   if (startSimulation) {
  //     cleanupFunction = stationManager.startEquipmentUpdateLoop();
  //   }
  
  //   return () => {
  //     if (cleanupFunction) {
  //       cleanupFunction();
  //     }
  //   };
  // }, [startSimulation]);

  useEffect(() => {
    // Starts the equipment update loop and returns a cleanup function
    const cleanupEquipmentUpdateLoop = stationManager.startEquipmentUpdateLoop();
    const cleanupMainQueueLoop = mainQueueManager.startMainQueueLoop()
    const queueAgainLoop = returnLaterQueueAgainManager.startQueueAgainLoop()
    
    // Function to periodically fetch station info and update state
    const fetchStationInfo = () => {
      const info = stationManager.getStationQueueLengthAndEquipmentStatusInfo();
      setStationInfo(info);
    };

    const fetchDemographicInfo = () => {
      const demographicInfo = averageDemographicDwellTimeManager.getAverageDwellTimeByDemographic()
      setDemographicInfo(demographicInfo)
    }

    const fetchMainQueueInfo = () => {
      const mainQueueInfo = mainQueueManager.getMainQueueLengthAndQueueManagerInfo()
      setMainQueueInfo(mainQueueInfo)
    }

    const fetchQueueAgainInfo = () => {
      const queueAgainInfo = returnLaterQueueAgainManager.getReturnLaterQueueAgainQueueLength()
      setReturnLaterQueueAgainInfo(queueAgainInfo)
    }

    // Fetch initial station info immediately
    const fetchAllData = () => {
      fetchMainQueueInfo()
      fetchStationInfo()
      fetchQueueAgainInfo()
      fetchDemographicInfo()
    }
    

    // Set up an interval to fetch station info periodically
    const intervalId = setInterval(fetchAllData, 100); // Adjust timing as necessary

    // Return a combined cleanup function
    return () => {
      clearInterval(intervalId); // Clears the interval for fetching station info
      cleanupEquipmentUpdateLoop(); // Stops the equipment update loop
      cleanupMainQueueLoop()
      queueAgainLoop()
    };
  }, []);

  const dwellTime = () => {
    return (
      <div>
        {demographicInfo.map((info) => {
          return (
            <div key={info.demographic}>
              <h2>Demographic: {info.demographic}</h2>
              <p>Average Dwell Time: {info.averageDwellTime}</p>
            </div>
          )
        })}
      </div>
    )
  }

  const queueManager = () => {
    return (
      <div>
        MAIN QUEUE LENGTH: {mainQueueInfo.mainQueueLength}
        <br />
        MANAGER DISCUSSION TIMER: {mainQueueInfo.queueManagerDiscussionTimer}
        <br />
        MANAGER IN DISCUSSION?: { mainQueueInfo.isQueueManagerDiscussing ? 'Yes' : 'No'}`
        <br />
        MANAGER ASSISTANCE TIMER: { mainQueueInfo.queueManagerAssistanceTimer}
        <br />
        MANAGER IN ASSISTANCE?: { mainQueueInfo.isQueueManagerAssisting ? 'Yes' : 'No'}
        <br />
      </div>
    )
  }
 
  const test = () => {
    return (
      <div>
        {Object.entries(stationInfo).map(([station, info]) => (
          <div key={station}>
            <h2>Station: {station}</h2>
            {station !== Station.COUNTERS && (
              <p>Queue Length: {info.queueLength[0]}</p>
            )}
            {station === Station.COUNTERS && (
              <div>
                <p>Queue Length for Digital Queue: {info.queueLength[0]}</p>
                <p>Queue Length for Physical Queue: {info.queueLength[1]}</p>
              </div>
            )}
            <div>
              Equipment Status:
              <ul>
                {info.equipmentStatus.map((equipment, index) => (
                  <li key={index}>
                    {equipment.status} with countdown {equipment?.countdown} : {equipment?.customerId ? `by Customer ${equipment?.customerId}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
        {test()}
        {dwellTime()}
        {queueManager()}
        <h1>QUEUE AGAIN FROM HOME COUNT: {returnLaterQueueAgainInfo}</h1>
        {/* <Floorplan /> */}
      </div>
    </div>
  )
}

export default Layout
