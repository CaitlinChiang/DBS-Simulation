import { ReactElement, useState, useEffect } from 'react'
import './main.css'
import Floorplan from '../floorplan'

import { DemographicAverageDwellTimeInfo, MainQueueManagerInfo, ReturnLaterQueueAgainManagerInfo, StationManagerInfo } from '../../types/managerInfo'
import { Station } from '../../enums/station'
import { SolutionChoice } from '../../enums/solutionChoice'
import { demographicAverageDwellTimeManager } from '../../utils/demographicAverageDwellTimeManager'
import { generateSimulationDataInExcel } from '../../utils/generateSimulationDataInExcel'
import { modifyInterval } from '../../utils/modifyInterval'
import { returnArrivalRateBasedFromPoissonDist } from '../../utils/returnArrivalRateFromPoissonDist'
import { customerGenerationManager } from '../../simulation/customerGenerationManager'
import { mainQueueManager } from '../../simulation/mainQueueManager'
import { stationManager } from '../../simulation/stationManager'
import { returnLaterQueueAgainManager } from '../../simulation/returnLaterQueueAgainManager'
import { useStore } from '../../store'

const Main = (): ReactElement => {
  const { solutionChoice, speedMultiplier, setSolutionChoice, setSpeedMultiplier, setIsDataCollectionHours } = useStore()

  const [simulationHour, setSimulationHour] = useState(0)
  const [collectedData, setCollectedData] = useState<DemographicAverageDwellTimeInfo[][]>([])
  const [simulationDay, setSimulationDay] = useState<number>(0) // 1 SIMULATION SET = 1 DAY OF 24HRS

  const [arrivalRate, setArrivalRate] = useState<number>(0.00001)
  const [isCustomRateEnabled, setIsCustomRateEnabled] = useState(false)
  const [startSimulation, setStartSimulation] = useState(false)

  const [demographicAverageDwellTimeInfo, setDemographicAverageDwellTimeInfo] = useState<DemographicAverageDwellTimeInfo[]>([])
  const [mainQueueInfo, setMainQueueInfo] = useState<MainQueueManagerInfo | null>({ queueLength: 0, queue: [], isQueueManagerAvailable: false, queueManagerDiscussionEndTime: 0, queueManagerAssistanceEndTime: 0 })
  const [stationInfo, setStationInfo] = useState<Record<string, StationManagerInfo>>({})
  const [returnLaterQueueAgainInfo, setReturnLaterQueueAgainInfo] = useState<ReturnLaterQueueAgainManagerInfo | null>({ queueLength: 0, queue: [] })

  const isOpeningHours: boolean = simulationHour >= 10 && simulationHour <= 17
  const isDataCollectionHours: boolean = simulationHour >= 10 && simulationHour <= 18

  // RE-INITIALIZE STATION MANAGER IF THE SOLUTION CHOICE CHANGES
  useEffect(() => {
    stationManager.init()
  }, [solutionChoice])

  // HANDLE TIME SIMULATION ALONGSIDE DATA COLLECTION FOR EXCEL GENERATION
  const fetchAndSaveDemographicInformation = (hour: number): void => {
    const demographicAverageDwellTimeInfo: DemographicAverageDwellTimeInfo[] = demographicAverageDwellTimeManager.getDemographicAverageDwellTimeInfo()
    const hourString: any = hour.toString().padStart(2, '0')
    const dayString: any = simulationDay.toString()
  
    const hourlyData = demographicAverageDwellTimeInfo.reduce((acc: any, {demographic, averageDwellTime}) => {
      acc[demographic] = averageDwellTime
      return acc
    }, {})
  
    setCollectedData((prevData) => {
      const newData: any = { ...prevData }
      if (!newData[dayString]) newData[dayString] = {}
      newData[dayString][hourString] = hourlyData
      return newData
    })
  }
  
  useEffect(() => {
    if (startSimulation) {
      const interval = setInterval(() => {
        setSimulationHour((currentHour) => {
          let newHour = currentHour + 1
          if (newHour >= 24) newHour = 0
          fetchAndSaveDemographicInformation(newHour)
          return newHour
        })
      }, 3600000 / speedMultiplier)
  
      return () => clearInterval(interval)
    }
  }, [startSimulation, speedMultiplier, simulationDay])

  useEffect(() => {
    if (simulationHour === 0 && startSimulation) {
      setSimulationDay((currentDay) => currentDay + 1)
    }
  }, [simulationHour, startSimulation])

  useEffect(() => {
    setIsDataCollectionHours(isDataCollectionHours)
  }, [simulationHour])
  
  // GENERATE EXCEL SHEET AND RESET SIMULATION WHEN RESTART SIMULATION BUTTON IS CLICKED
  const toggleSimulation = () => {
    setStartSimulation(!startSimulation)
  }

  const downloadAndRestartSimulation = () => {
    generateSimulationDataInExcel(collectedData)
    window.location.reload()
  }

  // GENERATION OF CUSTOMERS
  useEffect(() => {
    if (startSimulation) {
      const effectiveArrivalRate: number = isCustomRateEnabled ? arrivalRate : returnArrivalRateBasedFromPoissonDist(simulationHour)
      setArrivalRate(effectiveArrivalRate)
      customerGenerationManager.generateCustomerFromArrivalRate(arrivalRate, isOpeningHours)
    }
  }, [startSimulation, simulationHour, arrivalRate])

  // RESET SUBSYSTEMS ONCE ITS CLOSING HOURS
  useEffect(() => {
    if (!isOpeningHours) {
      mainQueueManager.resetMainQueueManager()
    }
  }, [isOpeningHours])

  useEffect(() => {
    if (!isDataCollectionHours) {
      demographicAverageDwellTimeManager.resetDemographicDwellTimeData()
    }
  }, [isDataCollectionHours])

  // ACTIVATE SUBSYSTEMS
  stationManager.startSubsystemSimulation()
  mainQueueManager.startSubsystemSimulation()
  returnLaterQueueAgainManager.startSubsystemSimulation()

  // FETCH INFORMATION FOR INTERFACE DISPLAY
  useEffect(() => {
    if (!startSimulation) return

    const fetchInformation = () => {
      const demographicAverageDwellTimeInfo: DemographicAverageDwellTimeInfo[] = demographicAverageDwellTimeManager.getDemographicAverageDwellTimeInfo()
      setDemographicAverageDwellTimeInfo(demographicAverageDwellTimeInfo)

      const mainQueueInfo: MainQueueManagerInfo = mainQueueManager.getMainQueueManagerInfo()
      setMainQueueInfo(mainQueueInfo)

      const stationInfo: Record<string, StationManagerInfo> = stationManager.getStationManagerInfo()
      setStationInfo(stationInfo)

      const returnLaterQueueAgainInfo: ReturnLaterQueueAgainManagerInfo = returnLaterQueueAgainManager.getReturnLaterQueueAgainManagerInfo()
      setReturnLaterQueueAgainInfo(returnLaterQueueAgainInfo)
    }

    const intervalId = setInterval(fetchInformation, modifyInterval(1))
    return () => clearInterval(intervalId)
  }, [startSimulation])

  return (
    <div className='Main'>
      {/* Start of Sidebar */}
      <div className='sidebar'>
        {/* Start of Simulation Settings */}
        <h3 className='simulation-settings'>Simulation Settings</h3>

        <h4>Simulation Day: {simulationDay}</h4>
        <h4 style={{ marginTop: '-20px' }}>Simulation Hour: {simulationHour}</h4>
        <h4>Current Date Time: {(new Date()).toISOString()}</h4>
        <br />

        <div className='simulation-settings-item'>
          <label htmlFor='simulationSpeed'>Simulation Speed</label>
          <input
            id="speedMultiplier"
            type="number"
            value={speedMultiplier}
            onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
            min="1"
            max="100"
            disabled={startSimulation}
          />
          <span>{speedMultiplier}x</span>
        </div>

        <div className='simulation-settings-item'>
          <input
            id='customRateEnabled'
            type='checkbox'
            checked={isCustomRateEnabled}
            onChange={(e) => setIsCustomRateEnabled(e.target.checked)}
            disabled={startSimulation}
          />
          <label htmlFor='customRateEnabled'>Set Custom Arrival Rate:</label>

          <input
            type='range'
            min='0.00001'
            max='1'
            step='0.01'
            value={arrivalRate}
            onChange={(e) => setArrivalRate(parseFloat(e.target.value))}
          />
          <br />
          <span>Rate: {arrivalRate}</span>
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
                onChange={() => setSolutionChoice(SolutionChoice.STAFF_EDUCATION)}
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
                onChange={() => setSolutionChoice(SolutionChoice.VTM_VERIFICATION_REMOVAL)}
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
                onChange={() => setSolutionChoice(SolutionChoice.ERROR_PREVENTION)}
                disabled={startSimulation}
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
            {startSimulation ? 'Stop Simulation' : 'Start Simulation'}
          </button>
        </div>
        <div style={{ marginTop: '5px' }}>
          <button
            onClick={downloadAndRestartSimulation}
          >
            {'Restart Simulation'}
          </button>
        </div>
        {/* End of Start Simulation Button */}
      </div>
      {/* End of Sidebar */}

      <div className='content'>
        <Floorplan
          mainQueueInfo={mainQueueInfo}
          stationInfo={stationInfo}
          returnLaterQueueAgainInfo={returnLaterQueueAgainInfo}
        />
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

          <p className='stationInfo'>Main Queue Length: { mainQueueInfo?.queueLength }</p>
          <p className='stationInfo'>Manager in Discussion EndTime: { mainQueueInfo?.queueManagerDiscussionEndTime }</p>
          <p className='stationInfo'>Manager in Assistance EndTime: { mainQueueInfo?.queueManagerAssistanceEndTime }</p>
        </div>

        <div className='homeSectionInfo'>
          <h2>Customers Coming Back Later</h2>
          <p className='stationInfo'>Number Returning: {returnLaterQueueAgainInfo?.queueLength}</p>
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
