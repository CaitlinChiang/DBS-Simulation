import { Customer } from '../types/customer'
import { DemographicAdditionalServiceTime } from '../enums/demographic'

export const calculateTotalStationTime = (stationTime: number, customer: Customer | undefined): number => {
  if (!customer) return stationTime
  return stationTime + DemographicAdditionalServiceTime[customer.demographic]
}

export const calculateTotalDwellTime = (customer: Customer): number => {
  const startTime = customer.id
  const endTime = (new Date()).toISOString()

  const startDate: any = new Date(startTime)
  const endDate: any = new Date(endTime)

  return (endDate - startDate) / 1000 // seconds
}
