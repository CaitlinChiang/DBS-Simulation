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

  getStationQueueLengthAndEquipmentStatusInfo(): Record<string, { queueLength: number[], equipmentStatus: Array<{status: StationEquipmentStatus, customerId: string | null}> }> {
    const information: Record<string, { queueLength: number[], equipmentStatus: Array<{status: StationEquipmentStatus, customerId: string | null}> }> = {}
  
    Object.entries(this.queues).forEach(([station, queue]) => {
      // Map each piece of equipment to include both status and the occupying customer's ID (if any)
      const equipmentStatus = this.equipment[station as Station].map(equipment => ({
        status: equipment.status,
        // Assuming customer has an 'id' property; adjust as necessary
        customerId: equipment.customer ? equipment.customer.id : null,
        countdown: equipment.countdown
      }));
      
      if (station === Station.COUNTERS) {
        // Separate counting for digital and physical queues
        const digitalQueueLength = queue.filter(customer => customer.isFromDigitalQueue === true).length;
        const physicalQueueLength = queue.filter(customer => !customer.isFromDigitalQueue).length; // Includes customers where isFromDigitalQueue is false or undefined
  
        information[station] = {
          queueLength: [digitalQueueLength, physicalQueueLength],
          equipmentStatus
        };
      } else {
        // Original logic for other stations
        information[station] = {
          queueLength: [queue.length],
          equipmentStatus
        };
      }
    });
  
    return information;
  }

  getStationVacantEquipmentInfo(station: Station): { isEquipmentVacant: boolean, vacantEquipmentIndices: number[] } {
    const vacantEquipmentIndices: number[] = this.equipment[station].reduce((indices: number[], equipment: Equipment, index: number) => {
      if (equipment.status === StationEquipmentStatus.VACANT) indices.push(index)
      return indices
    }, [])
    const isEquipmentVacant: boolean = vacantEquipmentIndices.length > 0
    
    return { isEquipmentVacant, vacantEquipmentIndices }
  }

  assignCustomerToVacantEquipment(station: Station, vacantEquipmentIndex: number, customer: Customer) {
    this.equipment[station][vacantEquipmentIndex] = {
      status: StationEquipmentStatus.OCCUPIED,
      countdown:  Math.round(calculateTotalStationTime(StateTimings[station], customer) / 100),
      customer
    }
  }

  shiftCustomerFromStationQueueToVacantEquipment(station: Station) {
    // const { isEquipmentVacant, vacantEquipmentIndices } = this.getStationVacantEquipmentInfo(station)
    // const isStationQueueNotEmpty: boolean = this.queues[station].length > 0

    while (this.queues[station].length > 0 && this.getStationVacantEquipmentInfo(station).isEquipmentVacant) {
      const customer: Customer | any = this.queues[station].shift()
      const vacantEquipmentIndex: number | any = this.getStationVacantEquipmentInfo(station).vacantEquipmentIndices.shift()

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

  // Repeatedly running simulation
  startEquipmentUpdateLoop() {
    const intervalId = setInterval(() => {
      this.updateStationEquipment();
    }, 100); // Adjust time as necessary
  
    // Return a cleanup function
    return () => clearInterval(intervalId);
  }
}

export const stationManager = new StationManager()
