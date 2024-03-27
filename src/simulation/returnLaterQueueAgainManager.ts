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
    const delay =  Math.round(returnResultBasedOnRange(RETURN_LATER_QUEUE_AGAIN_RANGE) / 100)
    customer.qaDelayTime = Date.now() + delay

    this.returnLaterQueueAgainQueue.push(customer)
    this.returnLaterQueueAgainQueue.sort((a, b) => a.qaDelayTime - b.qaDelayTime);
  }

  getReturnLaterQueueAgainQueueLength() {
    return this.returnLaterQueueAgainQueue.length
  }

  processCustomersFromReturnLaterQueueAgainQueue() {
    const isReturnLaterQueueAgainQueueEmpty: boolean = this.returnLaterQueueAgainQueue.length === 0
    if (isReturnLaterQueueAgainQueueEmpty) return

    // this.returnLaterQueueAgainQueue.sort((a, b) => (a.qaDelayTime! - b.qaDelayTime!))
    const now = Date.now();
    const nextCustomer = this.returnLaterQueueAgainQueue[0]
    // const customer: Customer | any = this.returnLaterQueueAgainQueue.shift()

    if (nextCustomer.qaDelayTime <= now) {
      // Time to process this customer
      mainQueueManager.appendCustomerToMainQueue(nextCustomer);
      this.returnLaterQueueAgainQueue.shift(); // Remove the processed customer from the queue
    }

    // setTimeout(() => {
    //   mainQueueManager.appendCustomerToMainQueue(customer)
    // }, customer.qaDelayTime)
  }

  // Simulation
  startQueueAgainLoop() {
    const intervalId = setInterval(() => {
      this.processCustomersFromReturnLaterQueueAgainQueue();
      // this.handleQueueManagerDiscussion()
    }, 100); // Adjust time as necessary
  
    // Return a cleanup function
    return () => clearInterval(intervalId);
  }
}

export const returnLaterQueueAgainManager = new ReturnLaterQueueAgainManager()
