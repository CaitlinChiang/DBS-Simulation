import { Customer } from '../types/customer'
import { Equipment } from '../types/equipment'
import { Demographic } from '../enums/demographics'
import { State } from '../enums/states'
import { Station, StationEquipmentCount, StationStatus } from '../enums/station'
import { StateTimings } from '../enums/timings'
import { calculateTotalStationTime, calculateTotalDwellTime } from './calculateTime'

export class StationQueues {
  private queues: Record<Station, Customer[]>
  private equipment: Record<Station, Equipment[]>
  private demographicDwellTimeData: Record<Demographic, { totalDwellTime: number, count: number }>

  constructor() {
    this.queues = {
      [Station.APP_BOOTHS]: [],
      [Station.COUNTERS]: [],
      [Station.ATMS]: [],
      [Station.ATM_COINS]: [],
      [Station.VTMS]: []
    }

    this.equipment = {
      [Station.APP_BOOTHS]: new Array(StationEquipmentCount.APP_BOOTHS).fill(null).map(() => ({ status: StationStatus.VACANT, countdown: 0, customer: null })),
      [Station.COUNTERS]: new Array(StationEquipmentCount.COUNTERS).fill(null).map(() => ({ status: StationStatus.VACANT, countdown: 0, customer: null })),
      [Station.ATMS]: new Array(StationEquipmentCount.ATMS).fill(null).map(() => ({ status: StationStatus.VACANT, countdown: 0, customer: null })),
      [Station.ATM_COINS]: new Array(StationEquipmentCount.ATM_COINS).fill(null).map(() => ({ status: StationStatus.VACANT, countdown: 0, customer: null })),
      [Station.VTMS]: new Array(StationEquipmentCount.VTMS).fill(null).map(() => ({ status: StationStatus.VACANT, countdown: 0, customer: null }))
    }

    this.demographicDwellTimeData = {
      [Demographic.LOCAL_ELDERLY]: { totalDwellTime: 0, count: 0 },
      [Demographic.LOCAL_ADULT]: { totalDwellTime: 0, count: 0 },
      [Demographic.FOREIGNER]: { totalDwellTime: 0, count: 0 }
    }
  }

  customerJoinQueue(station: Station, customer: Customer) {
    customer.state = station
    this.queues[station].push(customer)
  }

  isEquipmentAvailable(station: Station): boolean {
    return this.equipment[station].some(equipment => equipment.status === StationStatus.VACANT)
  }

  updateEquipmentStatus() {
    Object.entries(this.equipment).forEach(([station, equipments]) => {
      equipments.forEach(equipment => {
        if (equipment.status === StationStatus.OCCUPIED && equipment.countdown > 0) {
          equipment.countdown--

          if (equipment.countdown === 0) this.updateCustomerDemographicDataEquipmentState(equipment as Equipment)
        }
      })

      if (this.isEquipmentAvailable(station as Station)) {
        this.assignCustomerToEquipment(station as Station)
      }
    })
  }

  updateCustomerDemographicDataEquipmentState(equipment: Equipment) {
    if (equipment.customer) {
      const dwellTime = calculateTotalDwellTime(equipment.customer)

      this.updateCustomerStateExit(equipment.customer, dwellTime)
      this.updateDemographicDwellTime(equipment.customer.demographic, dwellTime);

      equipment.customer = null
      equipment.status = StationStatus.VACANT
    }
  }

  updateCustomerStateExit(customer: Customer, dwellTime: number) {
    customer.dwellTime = dwellTime
    customer.state = State.EXIT
  }

  updateDemographicDwellTime(demographic: Demographic, dwellTime: number) {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]

    demographicDwellTime.totalDwellTime += dwellTime
    demographicDwellTime.count += 1
  }

  getAverageDwellTimeByDemographic(demographic: Demographic): number {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]
    const { count, totalDwellTime } = demographicDwellTime

    return count > 0 ? totalDwellTime / count : 0
  }

  assignCustomerToEquipment(station: Station) {
    const vacantEquipmentIndex = this.equipment[station].findIndex(equipment => equipment.status === StationStatus.VACANT)
    
    if (vacantEquipmentIndex !== -1 && this.queues[station].length > 0) {
      // Remove the first customer from the queue
      const customer: Customer | any = this.queues[station].shift()
      
      this.equipment[station][vacantEquipmentIndex] = {
        status: StationStatus.OCCUPIED,
        countdown: calculateTotalStationTime(StateTimings[station as keyof typeof StateTimings], customer),
        customer
      }
    }
  }

  simulate() {
    setInterval(() => {
      this.updateEquipmentStatus()
    }, 1000)
  }
}
