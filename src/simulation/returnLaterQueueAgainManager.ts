import { Customer } from '../types/customer'
import { State } from '../enums/states'
import { RETURN_LATER_QUEUE_AGAIN_RANGE } from '../enums/ranges'
import { mainQueueManager } from './mainQueueManager'
import { returnResultBasedOnRange } from '../utils/returnResultBasedOnRange'

class ReturnLaterQueueAgainManager {
  private returnLaterQueueAgainQueue: Customer[] = []

  constructor() {}

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer) {
    customer.state = State.RETURN_LATER_QA
    customer.qaDelayTime = returnResultBasedOnRange(RETURN_LATER_QUEUE_AGAIN_RANGE)

    this.returnLaterQueueAgainQueue.push(customer)
  }

  processCustomersFromReturnLaterQueueAgainQueue() {
    const isReturnLaterQueueAgainQueueEmpty: boolean = this.returnLaterQueueAgainQueue.length === 0
    if (isReturnLaterQueueAgainQueueEmpty) return

    this.returnLaterQueueAgainQueue.sort((a, b) => (a.qaDelayTime! - b.qaDelayTime!))

    const customer: Customer | any = this.returnLaterQueueAgainQueue.shift()

    setTimeout(() => {
      mainQueueManager.appendCustomerToMainQueue(customer)
    }, customer.qaDelayTime)
  }
}

export const returnLaterQueueAgainManager = new ReturnLaterQueueAgainManager()
