import { Customer } from '../types/customer'
import { DemographicAdditionalServiceTime } from '../enums/demographics'

export const calculateTotalStationTime = (baseTime: number, customer: Customer | undefined): number => {
  if (!customer) return baseTime

  return baseTime + DemographicAdditionalServiceTime[customer.demographic]
}

export const calculateTotalDwellTime = (customer: Customer): number => {
  const startTime = customer.id
  const endTime = (new Date()).toISOString()

  const startDate: any = new Date(startTime)
  const endDate: any = new Date(endTime)

  // Return time in seconds
  return (endDate - startDate) / 1000
}
