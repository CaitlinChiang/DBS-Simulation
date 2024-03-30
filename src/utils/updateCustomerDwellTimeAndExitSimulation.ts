import { Customer } from '../types/customer'
import { State } from '../enums/states'
import { demographicAverageDwellTimeManager } from './demographicAverageDwellTimeManager'
import { calculateTotalDwellTime } from './calculateTime'

export const updateCustomerDwellTimeAndExitSimulation = (customer: Customer | any): void => {
  const dwellTime = calculateTotalDwellTime(customer)

  customer.dwellTime = dwellTime
  customer.state = State.EXIT

  demographicAverageDwellTimeManager.updateDemographicDwellTimeData(customer.demographic, dwellTime)
}
