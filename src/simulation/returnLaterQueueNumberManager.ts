import { Customer } from '../types/customer'
import { State, EventState } from '../enums/states'
import { StateFromReturnLaterQNProb, StateFromMissedQueueProb } from '../enums/probabilities'
import { Station } from '../enums/station'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'
import { stationManager } from './stationManager'

class ReturnLaterQueueNumberManager {
  appendCustomerToReturnLaterQueueNumberQueue(customer: Customer): void {
    customer.state = State.RETURN_LATER_QN
    this.handleCustomerActionFromStartOfDigitalQueue(customer)
  }

  handleCustomerActionFromStartOfDigitalQueue(customer: Customer): void {
    const customerFirstActionFromDigitalQueue: State | EventState = returnResultBasedOnProb(StateFromReturnLaterQNProb)

    switch (customerFirstActionFromDigitalQueue) {
      case State.COUNTERS:
        customer.isFromDigitalQueue = true
        stationManager.appendCustomerToStationQueue(Station.COUNTERS, customer)
        break
      case EventState.MISSED_QUEUE:
        this.handleCustomerActionFromMissedQueue(customer)
        break
    }
  }

  handleCustomerActionFromMissedQueue(customer: Customer): void {
    const customerActionFromMissedQueue: State = returnResultBasedOnProb(StateFromMissedQueueProb)

    switch (customerActionFromMissedQueue) {
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
