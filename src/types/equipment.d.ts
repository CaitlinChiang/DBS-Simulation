import { Customer } from '../types/customer'
import { StationEquipmentStatus } from '../enums/station'

export type Equipment = {
  status: StationEquipmentStatus,
  endUsageTime: number,
  customer: Customer | null
}
