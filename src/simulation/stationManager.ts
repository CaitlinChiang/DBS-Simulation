import { Customer } from '../types/customer'
import { Equipment } from '../types/equipment'
import { StationManagerInfo } from '../types/managerInfo'
import { Station, StationEquipmentAverageUsageTime, StationEquipmentCount, StationEquipmentStatus } from '../enums/station'
import { calculateTotalStationTime } from '../utils/calculateTime'
import { modifyAppBoothsEquipmentCount } from '../utils/modifyAppBoothsEquipmentCount'
import { modifyInterval } from '../utils/modifyInterval'
import { modifyVTMEquipmentAverageUsageTime } from '../utils/modifyVTMEquipmentAverageUsageTime'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'

class StationManager {
  constructor() {
    this.queues = {
      [Station.APP_BOOTHS]: [],
      [Station.COUNTERS]: [],
      [Station.ATMS]: [],
      [Station.ATM_COINS]: [],
      [Station.VTMS]: []
    }

    this.equipment = {
      [Station.APP_BOOTHS]: new Array(modifyAppBoothsEquipmentCount(StationEquipmentCount.APP_BOOTHS)).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, endUsageTime: 0, customer: null })),
      [Station.COUNTERS]: new Array(StationEquipmentCount.COUNTERS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, endUsageTime: 0, customer: null })),
      [Station.ATMS]: new Array(StationEquipmentCount.ATMS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, endUsageTime: 0, customer: null })),
      [Station.ATM_COINS]: new Array(StationEquipmentCount.ATM_COINS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, endUsageTime: 0, customer: null })),
      [Station.VTMS]: new Array(StationEquipmentCount.VTMS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, endUsageTime: 0, customer: null }))
    }
  }

  private queues: Record<Station, Customer[]>
  private equipment: Record<Station, Equipment[]>

  getStationQueueLengthAndEquipmentStatusInfo(): Record<string, StationManagerInfo> {
    return Object.entries(this.queues).reduce((info, [station, queue]) => {
      const equipmentStatus = this.equipment[station as Station].map((equipment: Equipment) => ({
        status: equipment.status,
        endUsageTime: equipment.endUsageTime,
        customer: equipment?.customer,
      }))
      
      const queueLength = station === Station.COUNTERS ? [
        queue.filter(customer => customer.isFromDigitalQueue).length,
        queue.filter(customer => !customer.isFromDigitalQueue).length
      ] : [queue.length]
  
      info[station] = { queueLength, equipmentStatus }

      return info
    }, {} as Record<string, StationManagerInfo>)
  }

  appendCustomerToStationQueue(station: Station, customer: Customer): void {
    customer.state = station
    this.queues[station].push(customer)
  }

  getStationVacantEquipmentInfo(station: Station): { isEquipmentVacant: boolean, vacantEquipmentIndices: number[] } {
    const vacantEquipmentIndices: number[] = this.equipment[station].reduce((indices: number[], equipment: Equipment, index: number) => {
      if (equipment.status === StationEquipmentStatus.VACANT) {
        indices.push(index)
      }
      return indices
    }, [])
    const isEquipmentVacant: boolean = vacantEquipmentIndices.length > 0
    
    return { isEquipmentVacant, vacantEquipmentIndices }
  }

  assignCustomerToVacantEquipment(station: Station, vacantEquipmentIndex: number, customer: Customer): void {
    let stationEquipmentAverageUsageTime: number = StationEquipmentAverageUsageTime[station]
    if (station === Station.VTMS) {
      stationEquipmentAverageUsageTime = modifyVTMEquipmentAverageUsageTime()
    }

    const endUsageTime = Date.now() + calculateTotalStationTime(stationEquipmentAverageUsageTime, customer)

    this.equipment[station][vacantEquipmentIndex] = {
      status: StationEquipmentStatus.OCCUPIED,
      endUsageTime,
      customer
    }
  }

  shiftCustomerFromStationQueueToVacantEquipment(station: Station) {
    while (this.queues[station].length > 0 && this.getStationVacantEquipmentInfo(station).isEquipmentVacant) {
      const customer: Customer | any = this.queues[station].shift()
      const vacantEquipmentIndex: number | any = this.getStationVacantEquipmentInfo(station).vacantEquipmentIndices.shift()

      this.assignCustomerToVacantEquipment(station, vacantEquipmentIndex, customer)
    }
  }

  updateEquipmentStatusToVacant(equipment: Equipment) {
    equipment.status = StationEquipmentStatus.VACANT
    equipment.endUsageTime = 0
    equipment.customer = null
  }

  updateStationEquipment() {
    Object.entries(this.equipment).forEach(([station, equipments]) => {
      equipments.forEach(equipment => {
        if (equipment.status === StationEquipmentStatus.OCCUPIED && Date.now() >= equipment.endUsageTime) {
          updateCustomerDwellTimeAndExitSimulation(equipment.customer)
          this.updateEquipmentStatusToVacant(equipment)
        }
      })

      this.shiftCustomerFromStationQueueToVacantEquipment(station as Station)
    })
  }

  startSubsystemSimulation() {
    const intervalId = setInterval(() => {
      this.updateStationEquipment()
    }, modifyInterval(1))
  
    return () => clearInterval(intervalId)
  }
}

export const stationManager = new StationManager()
