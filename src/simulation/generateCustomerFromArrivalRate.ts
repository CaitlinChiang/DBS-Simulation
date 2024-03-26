import { Customer } from '../types/customer'
import { Demographic, DemographicArrivalProb } from '../enums/demographic'
import { State } from '../enums/states'
import { StateFromArrivalProb } from '../enums/probabilities'
import { Station } from '../enums/station'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { mainQueueManager } from './mainQueueManager'
import { returnLaterQueueNumberManager } from './returnLaterQueueNumberManager'
import { stationManager } from './stationManager'

const randomizeStateFromArrival = (): State => returnResultBasedOnProb(StateFromArrivalProb)
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
  const intervalInSeconds: number = 1 / arrivalRate
  const intervalInMilliseconds: number = intervalInSeconds * 1000

  setTimeout(() => {
    const customer: Customer = generateCustomer()
    callback(customer)
  }, intervalInMilliseconds)
}

export const appendCustomerToArrivalStateQueue = (customer: Customer): void => {
  switch (customer.state) {
    case State.MAIN_QUEUE:
      mainQueueManager.appendCustomerToMainQueue(customer)
      break
    case State.ATMS:
      stationManager.appendCustomerToStationQueue(Station.ATMS, customer)
      break
    case State.ATM_COINS:
      stationManager.appendCustomerToStationQueue(Station.ATM_COINS, customer)
      break
    case State.VTMS:
      stationManager.appendCustomerToStationQueue(Station.VTMS, customer)
      break
    case State.RETURN_LATER_QN:
      returnLaterQueueNumberManager.appendCustomerToReturnLaterQueueNumberQueue(customer)
      break
  }
}
