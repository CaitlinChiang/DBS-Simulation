import { Customer } from '../types/customer'
import { StationStatus } from '../enums/station'

export type Equipment = {
  status: StationStatus,
  endTime: number,
  customer: Customer | null
}
