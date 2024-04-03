import { Customer } from '../types/customer'
import { ReturnLaterQueueAgainManagerInfo } from '../types/managerInfo'
import { State } from '../enums/states'
import { RETURN_LATER_QN_RANGE } from '../enums/ranges'
import { calculateTotalDelayTime } from '../utils/calculateTime'
import { modifyInterval } from '../utils/modifyInterval'
import { returnResultBasedOnRange } from '../utils/returnResultBasedOnRange'
import { mainQueueManager } from './mainQueueManager'

class ReturnLaterQueueAgainManager {
  private returnLaterQueueAgainQueue: Customer[] = []

  getReturnLaterQueueAgainManagerInfo(): ReturnLaterQueueAgainManagerInfo {
    return { 
      queueLength: this.returnLaterQueueAgainQueue.length,
      queue: this.returnLaterQueueAgainQueue
    }
  }

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer): void {
    customer.state = State.RETURN_LATER_QA

    const delay: number = returnResultBasedOnRange(RETURN_LATER_QN_RANGE)
    customer.qaDelayTime = calculateTotalDelayTime(delay, customer)

    this.returnLaterQueueAgainQueue.push(customer)
    this.returnLaterQueueAgainQueue.sort((a, b) => a.qaDelayTime! - b.qaDelayTime!)
  }

  processCustomersFromReturnLaterQueueAgainQueue(): void {
    const isReturnLaterQueueAgainQueueEmpty: boolean = this.returnLaterQueueAgainQueue.length === 0
    if (isReturnLaterQueueAgainQueueEmpty) return

    const nextCustomer: Customer = this.returnLaterQueueAgainQueue[0]

    if (Date.now() >= nextCustomer.qaDelayTime!) {
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
