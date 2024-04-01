import { Customer } from '../types/customer'
import { State } from '../enums/states'
import { RETURN_LATER_QN_RANGE } from '../enums/ranges'
import { modifyInterval } from '../utils/modifyInterval'
import { returnResultBasedOnRange } from '../utils/returnResultBasedOnRange'
import { mainQueueManager } from './mainQueueManager'
import { useStore } from '../store/store'

class ReturnLaterQueueAgainManager {
  constructor() {}

  private returnLaterQueueAgainQueue: Customer[] = []

  getReturnLaterQueueAgainQueueLength(): number {
    return this.returnLaterQueueAgainQueue.length
  }

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer): void {
    const { speedMultiplier } = useStore.getState()

    customer.state = State.RETURN_LATER_QA

    const adjustedDelayRange = RETURN_LATER_QN_RANGE.map(time => Math.round(time * 1000 / speedMultiplier))
    const delay = returnResultBasedOnRange(adjustedDelayRange)
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
    }, modifyInterval(1))
  
    return () => clearInterval(intervalId)
  }
}

export const returnLaterQueueAgainManager = new ReturnLaterQueueAgainManager()
