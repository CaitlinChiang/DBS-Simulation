import { ReactElement, useState, useEffect } from 'react'
import './main.css'
import Floorplan from '../floorplan'

import { DemographicAverageDwellTimeInfo, MainQueueLengthAndQueueManagerInfo, StationManagerInfo } from '../../types/managerInfo'
import { Station } from '../../enums/station'
import { SolutionChoice } from '../../enums/solutionChoice'
import { demographicAverageDwellTimeManager } from '../../utils/demographicAverageDwellTimeManager'
import { modifyInterval } from '../../utils/modifyInterval'
import { returnArrivalRateBasedFromPoissonDist } from '../../utils/returnArrivalRateFromPoissonDist'
import { customerGenerationManager } from '../../simulation/customerGenerationManager'
import { mainQueueManager } from '../../simulation/mainQueueManager'
import { returnLaterQueueAgainManager } from '../../simulation/returnLaterQueueAgainManager'
import { stationManager } from '../../simulation/stationManager'
import { useGlobal } from '../../hooks/useGlobal'

const Main = (): ReactElement => {
  const {
    solutionChoice,
    setSolutionChoice,
    speedMultiplier,
    setSpeedMultiplier
  } = useGlobal()

  const [simulationHour, setSimulationHour] = useState(8)
  const [arrivalRate, setArrivalRate] = useState<number>(0)
  const [startSimulation, setStartSimulation] = useState(true)

  const [demographicAverageDwellTimeInfo, setDemographicAverageDwellTimeInfo] = useState<DemographicAverageDwellTimeInfo[]>([])
  const [mainQueueInfo, setMainQueueInfo] = useState<MainQueueLengthAndQueueManagerInfo>({})
  const [stationInfo, setStationInfo] = useState<Record<string, StationManagerInfo>>()
  const [returnLaterQueueAgainInfo, setReturnLaterQueueAgainInfo] = useState<number>(0)

  // Run time simulation
  useEffect(() => {
    if (startSimulation) {
      const interval = setInterval(() => {
        setSimulationHour((currentHour) => {
          const newHour = currentHour + 1
          if (newHour >= 24) return 0
          return newHour
        })
      }, 3600000 / speedMultiplier)

      return () => clearInterval(interval)
    }
  }, [startSimulation, speedMultiplier])

  useEffect(() => {
    const defaultArrivalRate = returnArrivalRateBasedFromPoissonDist(simulationHour)
    setArrivalRate(defaultArrivalRate)
    if (startSimulation) {
      customerGenerationManager.generateCustomerFromArrivalRate(arrivalRate)
    }
  }, [simulationHour, startSimulation, arrivalRate])

  // Run main simulation loops
  useEffect(() => {
    const mainQueueSubsystem = mainQueueManager.startSubsystemSimulation()
    const returnLaterQueueAgainSubsystem = returnLaterQueueAgainManager.startSubsystemSimulation()
    const stationSubsystem = stationManager.startSubsystemSimulation()

    const fetchInformation = () => {
      const demographicAverageDwellTimeInfo: DemographicAverageDwellTimeInfo[] = demographicAverageDwellTimeManager.getDemographicAverageDwellTimeInfo()
      setDemographicAverageDwellTimeInfo(demographicAverageDwellTimeInfo)

      const mainQueueInfo: MainQueueLengthAndQueueManagerInfo = mainQueueManager.getMainQueueLengthAndQueueManagerInfo()
      setMainQueueInfo(mainQueueInfo)

      const stationInfo: Record<string, StationManagerInfo> = stationManager.getStationQueueLengthAndEquipmentStatusInfo()
      setStationInfo(stationInfo)

      const returnLaterQueueAgainInfo: number = returnLaterQueueAgainManager.getReturnLaterQueueAgainQueueLength()
      setReturnLaterQueueAgainInfo(returnLaterQueueAgainInfo)
    }

    const intervalId = setInterval(fetchInformation, modifyInterval(1000))

    return () => {
      clearInterval(intervalId)
      mainQueueSubsystem()
      returnLaterQueueAgainSubsystem()
      stationSubsystem()
    }
  }, [])

  return (
    <div className='Main'>
      {/* Start of Sidebar */}
      <div className='sidebar'>
        {/* Start of Simulation Settings */}
        <h3 className='simulation-settings'>Simulation Settings</h3>

        <div className='simulation-settings-item'>
          <label htmlFor='simulationSpeed'>Simulation Speed</label>
          <input
            id="speedMultiplier"
            type="number"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            min="1"
            max="100"
          />
          <span>{speedMultiplier}x</span>
        </div>
       
        <div className='simulation-settings-item'>
          <label className='simulation-settings-item-label' htmlFor='customerSpawnRate'>Customer Spawn Rate</label>
          <input
            type='range'
            min='0'
            max='1'
            step='0.01'
            value={arrivalRate}
            onChange={(e) => setArrivalRate(parseFloat(e.target.value))}
          />
          <span>{arrivalRate}</span>
        </div>
        {/* End of Simulation Settings */}

        {/* Solutions to Simulate */}
        <div className='simulation-settings-item'>
          <h3>Solutions to Simulate</h3>
          <form>
            <label>
              <input
                type="radio"
                value="SharedDatabase"
                checked={solutionChoice === SolutionChoice.SHARED_DATABASE}
                onChange={() => setSolutionChoice(SolutionChoice.SHARED_DATABASE)}
              />
              Shared Database
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="EducationForStaff"
                checked={solutionChoice === SolutionChoice.STAFF_EDUCATION}
                onChange={() => setSolutionChoice(SolutionChoice.STAFF_EDUCATION)}
              />
              Education for Staff
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="RemovalOf2ndVTMVerification"
                checked={solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL}
                onChange={() => setSolutionChoice(SolutionChoice.VTM_VERIFICATION_REMOVAL)}
              />
              Removal of 2nd VTM Verification
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="MethodsForErrorPrevention"
                checked={solutionChoice === SolutionChoice.ERROR_PREVENTION}
                onChange={() => setSolutionChoice(SolutionChoice.ERROR_PREVENTION)}
              />
              Methods for Error Prevention
            </label>
          </form>
        </div>
        {/* End of Solutions to Simulate */}

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

        <div>
        {demographicAverageDwellTimeInfo.map((info) => {
          return (
            <div key={info.demographic}>
              <h2>Demographic: {info.demographic}</h2>
              <p>Average Dwell Time: {info.averageDwellTime}</p>
            </div>
          )
          })}
        </div>
        
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

        <h1>QUEUE AGAIN FROM HOME COUNT: {returnLaterQueueAgainInfo}</h1>
      </div>
    </div>
  )
}

export default Main
