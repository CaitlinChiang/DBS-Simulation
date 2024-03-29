import { Customer } from '../types/customer'
import { State } from '../enums/states'
import { RETURN_LATER_QN_RANGE } from '../enums/ranges'
import { modifyInterval } from '../utils/modifyInterval'
import { returnResultBasedOnRange } from '../utils/returnResultBasedOnRange'
import { mainQueueManager } from './mainQueueManager'

class ReturnLaterQueueAgainManager {
  constructor() {}

  private returnLaterQueueAgainQueue: Customer[] = []

  getReturnLaterQueueAgainQueueLength(): number {
    return this.returnLaterQueueAgainQueue.length
  }

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer): void {
    customer.state = State.RETURN_LATER_QA

    const delay = returnResultBasedOnRange(RETURN_LATER_QN_RANGE)
    customer.qaDelayTime = Date.now() + delay

    this.returnLaterQueueAgainQueue.push(customer)
    this.returnLaterQueueAgainQueue.sort((a, b) => a.qaDelayTime! - b.qaDelayTime!)
  }

  processCustomersFromReturnLaterQueueAgainQueue(): void {
    const isReturnLaterQueueAgainQueueEmpty: boolean = this.returnLaterQueueAgainQueue.length === 0
    if (isReturnLaterQueueAgainQueueEmpty) return

    const currentDateTime = Date.now()
    const nextCustomer: Customer = this.returnLaterQueueAgainQueue[0]
    const isCustomerDelayTimeLessThanOrEqualToCurrentDateTime: boolean = nextCustomer.qaDelayTime! <= currentDateTime

    if (isCustomerDelayTimeLessThanOrEqualToCurrentDateTime) {
      mainQueueManager.appendCustomerToMainQueue(nextCustomer)
      this.returnLaterQueueAgainQueue.shift()
    }
  }

  startSubsystemSimulation() {
    const intervalId = setInterval(() => {
      this.processCustomersFromReturnLaterQueueAgainQueue()
    }, modifyInterval(1000))
  
    return () => clearInterval(intervalId)
  }
}

export const returnLaterQueueAgainManager = new ReturnLaterQueueAgainManager()
