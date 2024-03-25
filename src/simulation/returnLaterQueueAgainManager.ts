import { Customer } from '../types/customer'
import { State } from '../enums/states'

class ReturnLaterQueueAgainManager {
  private returnLaterQueueAgainQueue: Customer[] = []

  constructor() {}

  appendCustomerToReturnLaterQueueAgainQueue(customer: Customer) {
    customer.state = State.RETURN_LATER_QA
    this.returnLaterQueueAgainQueue.push(customer)
  }
}

export const returnLaterQueueAgainManager = new ReturnLaterQueueAgainManager()
