import { Customer } from '../types/customer'
import { Equipment } from '../types/equipment'
import { Station, StationEquipmentCount, StationEquipmentStatus } from '../enums/station'
import { StateTimings } from '../enums/timings'
import { calculateTotalStationTime } from '../utils/calculateTime'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'

class StationManager {
  private queues: Record<Station, Customer[]>
  private equipment: Record<Station, Equipment[]>

  constructor() {
    this.queues = {
      [Station.APP_BOOTHS]: [],
      [Station.COUNTERS]: [],
      [Station.ATMS]: [],
      [Station.ATM_COINS]: [],
      [Station.VTMS]: []
    }

    this.equipment = {
      [Station.APP_BOOTHS]: new Array(StationEquipmentCount.APP_BOOTHS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, countdown: 0, customer: null })),
      [Station.COUNTERS]: new Array(StationEquipmentCount.COUNTERS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, countdown: 0, customer: null })),
      [Station.ATMS]: new Array(StationEquipmentCount.ATMS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, countdown: 0, customer: null })),
      [Station.ATM_COINS]: new Array(StationEquipmentCount.ATM_COINS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, countdown: 0, customer: null })),
      [Station.VTMS]: new Array(StationEquipmentCount.VTMS).fill(null).map(() => ({ status: StationEquipmentStatus.VACANT, countdown: 0, customer: null }))
    }
  }

  appendCustomerToStationQueue(station: Station, customer: Customer) {
    this.queues[station].push(customer)
  }

  getStationVacantEquipmentInfo(station: Station): { isEquipmentVacant: boolean, vacantEquipmentIndices: number[] } {
    const vacantEquipmentIndices = this.equipment[station].reduce((indices: number[], equipment: Equipment, index: number) => {
      if (equipment.status === StationEquipmentStatus.VACANT) indices.push(index)
      return indices
    }, [])
    const isEquipmentVacant = vacantEquipmentIndices.length > 0
    
    return { isEquipmentVacant, vacantEquipmentIndices }
  }

  assignCustomerToVacantEquipment(station: Station, vacantEquipmentIndex: number, customer: Customer) {
    this.equipment[station][vacantEquipmentIndex] = {
      status: StationEquipmentStatus.OCCUPIED,
      countdown: calculateTotalStationTime(StateTimings[station], customer),
      customer
    }
  }

  shiftCustomerFromStationQueueToVacantEquipment(station: Station) {
    const { isEquipmentVacant, vacantEquipmentIndices } = this.getStationVacantEquipmentInfo(station)
    const isStationQueueNotEmpty = this.queues[station].length > 0

    while (isStationQueueNotEmpty && isEquipmentVacant) {
      const customer: Customer | any = this.queues[station].shift()
      const vacantEquipmentIndex: number | any = vacantEquipmentIndices.shift()

      this.assignCustomerToVacantEquipment(station, vacantEquipmentIndex, customer)
    }
  }

  updateEquipmentStatusToVacant(equipment: Equipment) {
    equipment.status = StationEquipmentStatus.VACANT
    equipment.countdown = 0
    equipment.customer = null
  }

  updateStationEquipment() {
    Object.entries(this.equipment).forEach(([station, equipments]) => {
      equipments.forEach(equipment => {
        if (equipment.status === StationEquipmentStatus.OCCUPIED && equipment.countdown > 0) {
          equipment.countdown--

          if (equipment.countdown === 0) {
            updateCustomerDwellTimeAndExitSimulation(equipment.customer)
            this.updateEquipmentStatusToVacant(equipment)
          }
        }
      })

      this.shiftCustomerFromStationQueueToVacantEquipment(station as Station)
    })
  }
}

export const stationManager = new StationManager()
