import { Demographic } from '../enums/demographic'
import { StationEquipmentStatus } from '../enums/station'

export type DemographicAverageDwellTimeInfo = {
  demographic: Demographic
  averageDwellTime: number
}

export type MainQueueLengthAndQueueManagerInfo = {
  mainQueueLength?: number
  isQueueManagerAvailable?: boolean
  isQueueManagerDiscussing?: boolean
  isQueueManagerAssisting?: boolean
  queueManagerDiscussionEndTime?: number
  queueManagerAssistanceEndTime?: number  
}

export type StationManagerInfo = {
  queueLength: number[]
  equipmentStatus: Array<{
    status: StationEquipmentStatus
    customerId: string | null
    endTime?: number
  }>
}
