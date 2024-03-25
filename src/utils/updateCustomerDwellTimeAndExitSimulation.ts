import { Customer } from '../types/customer'
import { State } from '../enums/states'
import { averageDemographicDwellTimeManager } from './averageDemographicDwellTimeManager'
import { calculateTotalDwellTime } from './calculateTime'

export const updateCustomerDwellTimeAndExitSimulation = (customer: Customer | any) => {
  const dwellTime = calculateTotalDwellTime(customer)

  customer.dwellTime = dwellTime
  customer.state = State.EXIT

  averageDemographicDwellTimeManager.updateDemographicDwellTime(customer.demographic, dwellTime)
}
