import { Customer } from '../types/customer'
import { Equipment } from '../types/equipment'
import { Demographic } from '../enums/demographic'

export type DemographicAverageDwellTimeInfo = {
  demographic: Demographic
  averageDwellTime: number
}

export type MainQueueManagerInfo = {
  queueLength: number
  queue: Customer[]
  isQueueManagerAvailable?: boolean
  queueManagerDiscussionEndTime?: number
  queueManagerAssistanceEndTime?: number  
}

export type ReturnLaterQueueAgainManagerInfo = {
  queueLength: number
  queue: Customer[]
}

export type StationManagerInfo = {
  queueLength: number[]
  queue: Customer[]
  equipmentStatus: Array<Equipment>
}
