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
import { stationManager } from '../../simulation/stationManager'
import { returnLaterQueueAgainManager } from '../../simulation/returnLaterQueueAgainManager'
import { useStore } from '../../store'

const Main = (): ReactElement => {
  const { solutionChoice, speedMultiplier } = useStore.getState()

  const [simulationHour, setSimulationHour] = useState(10)
  const [arrivalRate, setArrivalRate] = useState<number>(0)
  const [startSimulation, setStartSimulation] = useState(false)

  const [demographicAverageDwellTimeInfo, setDemographicAverageDwellTimeInfo] = useState<DemographicAverageDwellTimeInfo[]>([])
  const [mainQueueInfo, setMainQueueInfo] = useState<MainQueueLengthAndQueueManagerInfo>({})
  const [stationInfo, setStationInfo] = useState<Record<string, StationManagerInfo>>()
  const [returnLaterQueueAgainInfo, setReturnLaterQueueAgainInfo] = useState<number>(0)
  
  // RESET SIMULATION WHEN BUTTON IS CLICKED
  const toggleSimulation = () => {
    if (startSimulation) {
      // RESTART SIMULATION
      window.location.reload()
    } else {
      setStartSimulation(!startSimulation)
    }
  }

  // TIME SIMULATION
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

  // GENERATION OF CUSTOMERS
  useEffect(() => {
    const defaultArrivalRate = returnArrivalRateBasedFromPoissonDist(simulationHour)
    setArrivalRate(defaultArrivalRate)
  }, [])

  useEffect(() => {
    if (startSimulation) {
      customerGenerationManager.generateCustomerFromArrivalRate(arrivalRate, simulationHour)
    }
  }, [startSimulation, simulationHour])

  // ACTIVATE SUBSYSTEMS
  stationManager.startSubsystemSimulation()
  mainQueueManager.startSubsystemSimulation()
  returnLaterQueueAgainManager.startSubsystemSimulation()

  // FETCH INFORMATION FOR INTERFACE DISPLAY
  useEffect(() => {
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

    const intervalId = setInterval(fetchInformation, modifyInterval(1))
    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className='Main'>
      {/* Start of Sidebar */}
      <div className='sidebar'>
        {/* Start of Simulation Settings */}
        <h3 className='simulation-settings'>Simulation Settings</h3>

        <h4>Simulation Hour: {simulationHour}</h4>
        <h4>Current Date Time: {(new Date()).toISOString()}</h4>
        <br />

        <div className='simulation-settings-item'>
          <label htmlFor='simulationSpeed'>Simulation Speed</label>
          <input
            id="speedMultiplier"
            type="number"
            value={speedMultiplier}
            onChange={(e) => useStore.getState().setSpeedMultiplier(Number(e.target.value))}
            min="1"
            max="100"
            disabled={startSimulation}
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
                onChange={() => useStore.getState().setSolutionChoice(SolutionChoice.SHARED_DATABASE)}
                disabled={startSimulation}
              />
              Shared Database
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="EducationForStaff"
                checked={solutionChoice === SolutionChoice.STAFF_EDUCATION}
                onChange={() => useStore.getState().setSolutionChoice(SolutionChoice.STAFF_EDUCATION)}
                disabled={startSimulation}
              />
              Education for Staff
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="RemovalOf2ndVTMVerification"
                checked={solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL}
                onChange={() => useStore.getState().setSolutionChoice(SolutionChoice.VTM_VERIFICATION_REMOVAL)}
                disabled={startSimulation}
              />
              Removal of 2nd VTM Verification
            </label>
            <br />
            <label>
              <input
                type="radio"
                value="MethodsForErrorPrevention"
                checked={solutionChoice === SolutionChoice.ERROR_PREVENTION}
                onChange={() => useStore.getState().setSolutionChoice(SolutionChoice.ERROR_PREVENTION)}
              />
              Methods for Error Prevention
            </label>
          </form>
        </div>
        {/* End of Solutions to Simulate */}

        {/* Start of Start Simulation Button */}
        <div>
          <button
            onClick={toggleSimulation}
            className={startSimulation ? 'stop-simulation' : 'start-simulation'}
          >
            {startSimulation ? 'Restart Simulation' : 'Start Simulation'}
          </button>
        </div>
        {/* End of Start Simulation Button */}
      </div>
      {/* End of Sidebar */}

      <div className='content'>
        <Floorplan />
      </div>

      <div className='simulationInformation'>
        <div className="dividerSpace" />
        <div className="divider" />

        <h1>Simulation Information</h1>

        <div>
          <h2>Demographic Average Dwell Times</h2>

          {demographicAverageDwellTimeInfo.map((info) => {
            return (
              <div key={info.demographic}>
                <p className='stationInfo'>Demographic: {info.demographic} - Average Dwell Time: {info.averageDwellTime.toFixed(2)}s</p>
              </div>
            )
          })}
        </div>

        <div className='mainQueueSectionInfo'>
          <h2>Main Queue & Queue Manager</h2>

          <p className='stationInfo'>Main Queue Length: {mainQueueInfo.mainQueueLength}</p>
          <p className='stationInfo'>Manager in Discussion EndTime: {mainQueueInfo.queueManagerDiscussionEndTime}</p>
          <p className='stationInfo'>Manager in Assistance EndTime: { mainQueueInfo.queueManagerAssistanceEndTime}</p>
        </div>

        <div className='homeSectionInfo'>
          <h2>Customers Coming Back Later</h2>
          <p className='stationInfo'>Number Returning: {returnLaterQueueAgainInfo}</p>
        </div>
        
        <div className='stationSectionInfo'>
          <h2>Station & Equipment Information</h2>
          
          {Object.entries(stationInfo || {}).map(([station, info]) => {
            return (
              <div key={station} className='stationEquipmentInfo'>
                <h3>Station: {station}</h3>
                {station !== Station.COUNTERS && (
                  <p className='stationInfo'>Queue Length: {info.queueLength[0]}</p>
                )}
                {station === Station.COUNTERS && (
                  <div>
                    <p className='stationInfo'>Queue Length for Digital Queue: {info.queueLength[0]}</p>
                    <p className='stationInfo'>Queue Length for Physical Queue: {info.queueLength[1]}</p>
                  </div>
                )}
                <div>
                  <ul className="no-bullets">
                    {info.equipmentStatus.map((equipment, index) => (
                      <li key={index}>
                        Equipment {index + 1}: {equipment.status} with end usage time of {equipment?.endUsageTime} : {equipment?.customer ? `by Customer ${equipment?.customer?.id}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Main
