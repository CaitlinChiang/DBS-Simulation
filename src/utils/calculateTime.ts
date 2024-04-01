import { Customer } from '../types/customer'
import { DemographicAdditionalServiceTime } from '../enums/demographic'
import { useStore } from '../store/store'

export const calculateTotalStationTime = (stationTime: number, customer: Customer | undefined): number => {
  if (!customer) return stationTime

  const { speedMultiplier } = useStore.getState()
  const totalStationTime: number = ((stationTime + DemographicAdditionalServiceTime[customer.demographic]) * 1000) / speedMultiplier
  return Math.round(totalStationTime)
}

export const calculateTotalDwellTime = (customer: Customer): number => {
  const { speedMultiplier } = useStore.getState()
  const startTime = customer.id
  const endTime = (new Date()).toISOString()

  const startDate: any = new Date(startTime)
  const endDate: any = new Date(endTime)

  return (((endDate - startDate) / 1000) * speedMultiplier)
}
