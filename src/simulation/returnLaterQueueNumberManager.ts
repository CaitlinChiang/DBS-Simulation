import { Customer } from '../types/customer'
import { State, EventState } from '../enums/states'
import { StateFromReturnLaterQNProb, StateFromMissingQNProb } from '../enums/probabilities'
import { Station } from '../enums/station'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { stationManager } from './stationManager'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'

class ReturnLaterQueueNumberManager {
  constructor() {}

  appendCustomerToReturnLaterQueueNumberQueue(customer: Customer) {
    customer.state = State.RETURN_LATER_QN
    this.handleCustomerActionFromStartOfDigitalQueue(customer)
  }

  handleCustomerActionFromStartOfDigitalQueue(customer: Customer) {
    const customerFirstActionFromDigitalQueue: State | EventState = returnResultBasedOnProb(StateFromReturnLaterQNProb)

    switch (customerFirstActionFromDigitalQueue) {
      case EventState.MISSED_QUEUE:
        this.handleCustomerActionFromMissingQueue(customer)
        break
      case State.COUNTERS:
        stationManager.appendCustomerToStationQueue(Station.COUNTERS, customer)
        break
    }
  }

  handleCustomerActionFromMissingQueue(customer: Customer) {
    const customerActionFromMissingQueue: State = returnResultBasedOnProb(StateFromMissingQNProb)

    switch (customerActionFromMissingQueue) {
      case State.RETURN_LATER_QN:
        this.appendCustomerToReturnLaterQueueNumberQueue(customer)
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }
}

export const returnLaterQueueNumberManager = new ReturnLaterQueueNumberManager()
