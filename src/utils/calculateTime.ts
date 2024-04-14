import { Customer } from '../types/customer'
import { DemographicAdditionalServiceTime } from '../enums/demographic'
import { useStore } from '../store'

export const calculateTotalStationTime = (stationBaseTime: number, customer: Customer | undefined): number => {
  if (!customer) return stationBaseTime

  const { speedMultiplier } = useStore.getState()

  const totalStationTime: number = stationBaseTime + DemographicAdditionalServiceTime[customer.demographic]
  const totalStationTimeInMilliseconds: number = totalStationTime * 1000
  const totalStationTimeWithSpeedMultiplier: number = totalStationTimeInMilliseconds / speedMultiplier
  const roundedModifiedStationTime: number = Math.max(0, Math.round(totalStationTimeWithSpeedMultiplier))

  return roundedModifiedStationTime
}

export const calculateTotalDwellTime = (customer: Customer): number => {
  const { speedMultiplier } = useStore.getState()

  const startTime = customer.id
  const endTime = (new Date()).toISOString()

  const startDate: any = new Date(startTime)
  const endDate: any = new Date(endTime)

  const totalDwellTime: number = endDate - startDate
  const totalDwellTimeInSeconds: number = totalDwellTime / 1000
  const totalDwellTimeWithSpeedMultiplier: number = totalDwellTimeInSeconds * speedMultiplier

  return totalDwellTimeWithSpeedMultiplier
}

export const calculateDelayReturnDate = (rangeInSeconds: number, customer: Customer): Date => {
  const { speedMultiplier } = useStore.getState()

  const totalDelayTime: number = rangeInSeconds + DemographicAdditionalServiceTime[customer.demographic]
  const delayTimeInMilliseconds: number = totalDelayTime * 1000
  const delayTimeWithSpeedMultiplier: number = delayTimeInMilliseconds / speedMultiplier
  const dateNow: Date = new Date()
  const roundedModifiedDelayTime: number = Math.max(0, Math.round(delayTimeWithSpeedMultiplier))
  const delayDateTime = new Date(dateNow.getTime() + roundedModifiedDelayTime)

  return delayDateTime
}
