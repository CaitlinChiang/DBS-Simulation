import { Customer } from '../types/customer'
import { Demographic, DemographicArrivalProb } from '../enums/demographic'
import { State } from '../enums/states'
import { StateFromArrivalProb } from '../enums/probabilities'
import { Station } from '../enums/station'
import { modifyInterval } from '../utils/modifyInterval'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { mainQueueManager } from './mainQueueManager'
import { returnLaterQueueNumberManager } from './returnLaterQueueNumberManager'
import { stationManager } from './stationManager'

class CustomerGenerationManager {
  constructor() {}

  private randomizeDemographic(): Demographic {
    return returnResultBasedOnProb(DemographicArrivalProb)
  }

  private randomizeStateFromArrival(): State {
    return returnResultBasedOnProb(StateFromArrivalProb)
  }

  generateCustomer(): Customer {
    const newCustomer: Customer = {
      id: (new Date()).toISOString(),
      demographic: this.randomizeDemographic(),
      state: this.randomizeStateFromArrival(),
      dwellTime: 0
    }

    return newCustomer
  }

  generateCustomerFromArrivalRate(arrivalRate: number): void {
    const intervalInSeconds: number = 1 / arrivalRate

    setInterval(() => {
      const customer: Customer = this.generateCustomer()
      this.appendCustomerToArrivalStateQueue(customer)
    }, modifyInterval(intervalInSeconds))
  }

  appendCustomerToArrivalStateQueue = (customer: Customer): void => {
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
}

export const customerGenerationManager = new CustomerGenerationManager()
