import { Customer } from '../types/customer'
import { Demographic, DemographicArrivalProb } from '../enums/demographic'
import { StateFromArrival } from '../enums/states'
import { StateFromArrivalProb } from '../enums/probabilities'
import { Station } from '../enums/station'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { stationManager } from './stationManager'

const randomizeStateFromArrival = (): StateFromArrival => returnResultBasedOnProb(StateFromArrivalProb)
const randomizeDemographic = (): Demographic => returnResultBasedOnProb(DemographicArrivalProb)

const generateCustomer = (): Customer => {
  const newCustomer: Customer = {
    id: (new Date()).toISOString(),
    demographic: randomizeDemographic(),
    state: randomizeStateFromArrival(),
    dwellTime: 0
  }

  return newCustomer
}

export const generateCustomerFromArrivalRate = (arrivalRate: number, callback: (customer: Customer) => void): void => {
  const intervalInSeconds = 1 / arrivalRate
  const intervalInMilliseconds = intervalInSeconds * 1000

  setTimeout(() => {
    const customer: Customer = generateCustomer()
    callback(customer)
  }, intervalInMilliseconds)
}

export const appendCustomerToArrivalStateQueue = (customer: Customer): void => {
  switch (customer.state) {
    case StateFromArrival.MAIN_QUEUE:
      // TODO: Append customer to main queue -> main queue logic 
      break
    case StateFromArrival.ATMS:
      stationManager.appendCustomerToStationQueue(Station.ATMS, customer)
      break
    case StateFromArrival.ATM_COINS:
      stationManager.appendCustomerToStationQueue(Station.ATM_COINS, customer)
      break
    case StateFromArrival.VTMS:
      stationManager.appendCustomerToStationQueue(Station.VTMS, customer)
      break
    case StateFromArrival.RETURN_LATER_QN:
      // TODO: Append customer to the return later queue number queue (counters mixed queue)
      break
  }
}
