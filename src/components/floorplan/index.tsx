import { ReactElement } from 'react'
import CustomerElement from './Customer'
import './Floorplan.css'
import { MainQueueManagerInfo, StationManagerInfo, ReturnLaterQueueAgainManagerInfo } from '../../types/managerInfo'
import { Demographic } from '../../enums/demographic'
import { Station, StationEquipmentStatus } from '../../enums/station'
import { useStore } from '../../store'

const Floorplan = ({
  mainQueueInfo,
  stationInfo,
  returnLaterQueueAgainInfo,
}: {
  mainQueueInfo: MainQueueManagerInfo | null,
  stationInfo: Record<string, StationManagerInfo>,
  returnLaterQueueAgainInfo: ReturnLaterQueueAgainManagerInfo | null
}): ReactElement => {
  const { isDataCollectionHours } = useStore.getState()

  const renderCustomerInStationEquipment = (index: number, station: Station): ReactElement | null => {
    const counterStatus = stationInfo[station]?.equipmentStatus[index - 1]

    if (counterStatus?.status === StationEquipmentStatus.OCCUPIED) {
      return (
        <div className='customer'>
          <CustomerElement demographic={counterStatus?.customer?.demographic} />
        </div>
      )
    }
    return null
  }

  const renderCustomersInCountersWaitingArea = (location: string): ReactElement[] => {
    const locationQueueLength: number = location === 'digital' ? 0 : 1
    const queueLength = stationInfo[Station.COUNTERS]?.queueLength[locationQueueLength] || 0

    return Array.from({ length: queueLength }, (_, index) => (
      <div key={index} className="customer-waiting-counters">
        <CustomerElement demographic={stationInfo[Station.COUNTERS]?.queue[index]?.demographic} />
      </div>
    ))
  }

  const renderCustomersInReturningLaterArea = (): any => {
    return returnLaterQueueAgainInfo?.queue.map((customer, index) => (
      <div key={index} className="customer-waiting-counters">
        <CustomerElement demographic={customer?.demographic} />
      </div>
    ))
  }

  return (
    <div className='floorplan'>
      <div className='section-inside'>
        {/* Start of Counters Batch 01 */}
        <div className='counters-batch01'>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`COUNTER-${index + 1}`} className='counter-batch01-item floorplan-element'>
              <p>COUNTER {index + 1}</p>
              {renderCustomerInStationEquipment(index + 1, Station.COUNTERS)}
            </div>
          ))}
        </div>
        {/* End of Counters Batch 01 */}

        {/* Start of Counters Batch 02 */}
        <div className='counters-batch02'>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`COUNTER-${index + 4}`} className='counter-batch02-item floorplan-element'>
              <p>COUNTER {index + 4}</p>
              {renderCustomerInStationEquipment(index + 4, Station.COUNTERS)}
            </div>
          ))}
        </div>
        {/* End of Counters Batch 02 */}

        {/* Start of Counters Batch 03 */}
        <div className='counters-batch03'>
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`COUNTER-${index + 8}`} className='counter-batch03-item floorplan-element'>
              <p>COUNTER {index + 8}</p>
              {renderCustomerInStationEquipment(index + 8, Station.COUNTERS)}
            </div>
          ))}
        </div>
        {/* End of Counters Batch 03 */}

        {/* Start of Waiting Area */}
        <div className='waiting-area'>
          <p>WAITING AREA</p>
          <div className='waiting-area-grid'>
            {renderCustomersInCountersWaitingArea('physical')}
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
          {stationInfo[Station.APP_BOOTHS]?.equipmentStatus.map((_, index) => (
            <div key={`BOOTH-${index + 1}`} className='app-booth-item'>
              <p>BOOTH {index + 1}</p>
              {renderCustomerInStationEquipment(index + 1, Station.APP_BOOTHS)}
            </div>
          ))}
        </div>
        <div className='app-booths-queue'>
          <div className='app-booths-queue-grid'>
            {Array.from({ length: stationInfo[Station.APP_BOOTHS]?.queueLength[0] || 0 }).map((_, index) => (
              <div key={index} className="customer-waiting-counters">
                <CustomerElement demographic={stationInfo[Station.APP_BOOTHS]?.queue[index]?.demographic} />
              </div>
            ))}
          </div>
        </div>
        {/* End of App Booth Learnings */}
      </div>

      <div className='section-outside'>
        {/* Start of ATM Coin Machine */}
        <div className='atm-coin-machines'>
          <div className='floorplan-element'>
            <p>ATM COINS</p>
            {renderCustomerInStationEquipment(1, Station.ATM_COINS)}
          </div>
        </div>
        <div className='atm-coins-queue'>
          {Array.from({ length: stationInfo[Station.ATM_COINS]?.queueLength[0] || 0 }).map((_, index) => (
            <div key={index} className="customer-waiting-counters">
              <CustomerElement demographic={stationInfo[Station.ATM_COINS]?.queue[index]?.demographic} />
            </div>
          ))}
        </div>
        {/* End of ATM Coin Machine */}

        {/* Start of ATMs Batch 02 */}
        <div className='atm-machines-batch02'>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`ATM-${index + 4}`} className='atm-machines-batch02-item floorplan-element'>
              <p>ATM {index + 4}</p>
              {renderCustomerInStationEquipment(index + 4, Station.ATMS)}
            </div>
          ))}
        </div>
        <div className='atm-machines-batch02-waiting-area'>
          <div className='atm-machines-batch02-waiting-area-grid'>
            {Array.from({ length: stationInfo[Station.ATMS]?.queueLength[0] || 0 }).filter((_, index) => index % 2 === 0).map((_, index) => (
              <div key={index} className="customer-waiting-counters">
                <CustomerElement demographic={stationInfo[Station.ATMS]?.queue[index * 2]?.demographic} />
              </div>
            ))}
          </div>
        </div>
        {/* End of ATMs Batch 02 */}

        {/* Start of VTM Machines */}
        <div className='vtm-machines'>
          {stationInfo[Station.VTMS]?.equipmentStatus.map((_, index) => (
            <div key={`VTM-${index + 1}`} className='vtm-machine-item floorplan-element'>
              <p>VTM {index + 1}</p>
              {renderCustomerInStationEquipment(index + 1, Station.VTMS)}
            </div>
          ))}
        </div>
        <div className='vtm-machines-queue'>
          {Array.from({ length: stationInfo[Station.VTMS]?.queueLength[0] || 0 }).map((_, index) => (
            <div key={index} className="customer-waiting-vtms">
              <CustomerElement demographic={stationInfo[Station.VTMS]?.queue[index]?.demographic} />
            </div>
          ))}
        </div>
        {/* End of VTM Machines */}
        
        {/* Start of Divider Branch Outside*/}
        <div className='divider-branch-outside' />
        {/* End of Divider Branch Outside*/}

        {/* Start of ATMs Batch 01 */}
        <div className='atm-machines-batch01'>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={`ATM-${index + 1}`} className='atm-machines-batch01-item floorplan-element'>
              <p>ATM {index + 1}</p>
              {renderCustomerInStationEquipment(index + 1, Station.ATMS)}
            </div>
          ))}
        </div>
        <div className='atm-machines-batch01-waiting-area'>
          <div className='atm-machines-batch01-waiting-area-grid'>
            {Array.from({ length: stationInfo[Station.ATMS]?.queueLength[0] || 0 }).filter((_, index) => index % 2 !== 0).map((_, index) => (
              <div key={index} className="customer-waiting-counters">
                <CustomerElement demographic={stationInfo[Station.ATMS]?.queue[index * 2 + 1]?.demographic} />
              </div>
            ))}
          </div>
        </div>
        {/* End of ATMs Batch 01 */}
      </div>

      {/* Start of Main Queue */}
      <div className='queue-manager'>
        <div className='colleague-speaking'>
          {isDataCollectionHours && <CustomerElement />}
          {(isDataCollectionHours && mainQueueInfo?.queueManagerAssistanceEndTime && mainQueueInfo?.queueManagerAssistanceEndTime > 0) ? <CustomerElement /> : null}
        </div>
        {(mainQueueInfo?.queueManagerDiscussionEndTime && mainQueueInfo?.queueManagerDiscussionEndTime > 0) ? <p>{'Status: Discussing with Customer'}</p> : null}
        {(mainQueueInfo?.queueManagerAssistanceEndTime && mainQueueInfo?.queueManagerAssistanceEndTime > 0) ? <p>{'Status: Asking Assistance'}</p> : null}
      </div>
      <div className='main-queue'>
        <p>MAIN QUEUE</p>
        <div>
          {Array.from({ length: mainQueueInfo?.queueLength || 0 }).map((_, index) => (
            <div key={index} className="customer-waiting-counters">
              <CustomerElement demographic={mainQueueInfo?.queue[index]?.demographic} />
            </div>
          ))}
        </div>
      </div>
      {/* End of Main Queue */}

      {/* Start Return later Section */}
      <div className='return-later-section'>
        <p>CUSTOMERS RETURNING LATER</p>
        <div className='waiting-area-grid'>
          {renderCustomersInReturningLaterArea()}
        </div>
      </div>
      {/* End of Return Later Section */}

      {/* Start of Digital Queue Section */}
      <div className='digital-waiting-area'>
        <p>DIGITAL QUEUE INDICATOR AREA</p>
        <div className='waiting-area-grid'>
          {renderCustomersInCountersWaitingArea('digital')}
        </div>
      </div>
      {/* End of Digital Queue Section */}

      {/* Start of Spawning Section */}
      <div className='customer-legend'>
        <p>Legend for Customer Demographics</p>
        <div className="customer-item">
          <span>Local Elderly</span>
          <CustomerElement demographic={Demographic.LOCAL_ELDERLY} />
        </div>
        <div className="customer-item">
          <span>Local Adult</span>
          <CustomerElement demographic={Demographic.LOCAL_ADULT} />
        </div>
        <div className="customer-item">
          <span>Foreigners</span>
          <CustomerElement demographic={Demographic.FOREIGNER} />
        </div>
      </div>
      {/* End of Spawning Section */}
    </div>
  )
}

export default Floorplan
