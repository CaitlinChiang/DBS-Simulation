import { StationEquipmentStatus } from '../enums/station'

export type MainQueueLengthAndQueueManagerInfo = {
  mainQueueLength?: number
  isQueueManagerAvailable?: boolean
  isQueueManagerDiscussing?: boolean
  isQueueManagerAssisting?: boolean
  queueManagerDiscussionTimer?: number
  queueManagerAssistanceTimer?: number  
}

export type StationManagerInfo = {
  queueLength: number[]
  equipmentStatus: Array<{
    status: StationEquipmentStatus
    customerId: string | null
    countdown?: number
  }>
}
