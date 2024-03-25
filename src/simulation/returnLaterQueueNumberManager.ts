import { Customer } from '../types/customer'
import { State } from '../enums/states'

class ReturnLaterQueueNumberManager {
  private returnLaterQueueNumberQueue: Customer[] = []

  constructor() {}

  appendCustomerToReturnLaterQueueNumberQueue(customer: Customer) {
    customer.state = State.RETURN_LATER_QN
    this.returnLaterQueueNumberQueue.push(customer)
  }
}

export const returnLaterQueueNumberManager = new ReturnLaterQueueNumberManager()
