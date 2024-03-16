import { Customer } from '../types/customer'
import { StationStatus } from '../enums/station'

export type Equipment = {
  status: StationStatus,
  countdown: number,
  customer: Customer | null
}
