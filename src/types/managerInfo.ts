import { Equipment } from '../types/equipment'
import { Demographic } from '../enums/demographic'

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
  equipmentStatus: Array<Equipment>
}
