import { Customer } from '../types/customer'
import { ReturnLaterQueueAgainManagerInfo } from '../types/managerInfo'
import { State } from '../enums/states'
import { RETURN_LATER_QN_RANGE } from '../enums/ranges'
import { calculateDelayReturnDate } from '../utils/calculateTime'
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

  resetReturnLaterQueueAgainManager(): void {
    this.returnLaterQueueAgainQueue = []
  }

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer): void {
    customer.state = State.RETURN_LATER_QA
    
    const delay: number = returnResultBasedOnRange(RETURN_LATER_QN_RANGE)
    customer.qaDelayDate = calculateDelayReturnDate(delay, customer)

    const customerQueueIndex = this.returnLaterQueueAgainQueue.findIndex(c => c.qaDelayDate! > customer.qaDelayDate!)
    if (customerQueueIndex === -1) {
      this.returnLaterQueueAgainQueue.push(customer)
    } else {
      this.returnLaterQueueAgainQueue.splice(customerQueueIndex, 0, customer)
    }
  }

  processCustomersFromReturnLaterQueueAgainQueue(): void {
    const isReturnLaterQueueAgainQueueEmpty: boolean = this.returnLaterQueueAgainQueue.length === 0
    if (isReturnLaterQueueAgainQueueEmpty) return

    const nextCustomer: Customer = this.returnLaterQueueAgainQueue[0]

    if (nextCustomer.qaDelayDate && Date.now() >= nextCustomer.qaDelayDate.getTime()) {
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
