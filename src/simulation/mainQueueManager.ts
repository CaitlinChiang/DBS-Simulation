import { Customer } from '../types/customer'
import { State, EventState } from '../enums/states'
import { StateFromMainQueueProb, StateFromQueueManagerDiscussionResultProb, StateFromQueueManagerDirectProb, StateFromQueueManagerRequiresAssistanceProb, StateFromMissingDocumentsProb } from '../enums/probabilities'
import { QUEUE_MANAGER_DISCUSSION_DIST, QUEUE_MANAGER_ASSISTANCE_DIST } from '../enums/distributions'
import { Station } from '../enums/station'
import { calculateTotalStationTime } from '../utils/calculateTime'
import { returnResultBasedOnDist } from '../utils/returnResultBasedOnDist'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'
import { returnLaterQueueAgainManager } from './returnLaterQueueAgainManager'
import { stationManager } from './stationManager'

class MainQueueManager {
  private mainQueue: Customer[] = []
  private isQueueManagerAvailable: boolean = true
  private queueManagerDiscussionTimer: number = 0
  private queueManagerAssistanceTimer: number = 0

  constructor() {}

  appendCustomerToMainQueue(customer: Customer) {
    this.handleCustomerActionFromStartOfMainQueue(customer)
  }

  getMainQueueLengthAndQueueManagerInfo() {
    return {
      mainQueueLength: this.mainQueue.length,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      queueManagerDiscussionTimer: this.queueManagerDiscussionTimer,
      isQueueManagerDiscussing: this.queueManagerDiscussionTimer > 0,
      queueManagerAssistanceTimer: this.queueManagerAssistanceTimer,
      isQueueManagerAssisting: this.queueManagerAssistanceTimer > 0
    }
  }

  handleCustomerActionFromStartOfMainQueue(customer: Customer) {
    const customerFirstActionFromMainQueue: State = returnResultBasedOnProb(StateFromMainQueueProb)

    switch (customerFirstActionFromMainQueue) {
      case State.QUEUE_MANAGER_DISCUSSION:
        this.handleQueueManagerDiscussion(customer)
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  updateQueueManagerInfo() {
    if (this.queueManagerDiscussionTimer > 0) this.queueManagerDiscussionTimer--
    if (this.queueManagerAssistanceTimer > 0) this.queueManagerAssistanceTimer--

    const isQueueManagerTimersBothZero: boolean = this.queueManagerDiscussionTimer === 0 && this.queueManagerAssistanceTimer === 0
    if (isQueueManagerTimersBothZero) this.isQueueManagerAvailable = true
  }

  isSystemAbleToProcessNextCustomer() {
    const isMainQueueNotEmpty: boolean = this.mainQueue.length > 0
    if (isMainQueueNotEmpty && this.isQueueManagerAvailable) return true
  }

  startTimerForQueueManager(customerToProcess: Customer, isDiscussionTimer?: boolean, isAssistanceTimer?: boolean): Promise<void> {
    return new Promise((resolve) => {
      if (isDiscussionTimer) {
        const averageTimeSpentInQueueManagerDiscussion: number = returnResultBasedOnDist(QUEUE_MANAGER_DISCUSSION_DIST)
        this.queueManagerDiscussionTimer = Math.round(calculateTotalStationTime(averageTimeSpentInQueueManagerDiscussion, customerToProcess) / 100)

        setTimeout(() => {
          this.queueManagerDiscussionTimer = 0
          resolve()
        }, this.queueManagerDiscussionTimer)
      }
      
      if (isAssistanceTimer) {
        const averageTimeSpentInQueueManagerAssistance: number = returnResultBasedOnDist(QUEUE_MANAGER_ASSISTANCE_DIST)
        this.queueManagerAssistanceTimer = calculateTotalStationTime(averageTimeSpentInQueueManagerAssistance, customerToProcess)

        setTimeout(() => {
          this.queueManagerAssistanceTimer = 0
          resolve()
        }, this.queueManagerAssistanceTimer)
      }
    })
  }

  handleQueueManagerDiscussion(customer: Customer) {
    customer.state = State.QUEUE_MANAGER_DISCUSSION
    this.mainQueue.push(customer)

    if (!this.isSystemAbleToProcessNextCustomer) return

    const queueManagerActionFromDiscussion: State | EventState = returnResultBasedOnProb(StateFromQueueManagerDiscussionResultProb)
    const customerToProcess: Customer | any = this.mainQueue.shift()

    this.startTimerForQueueManager(customerToProcess, true, false).then(() => {
      switch (queueManagerActionFromDiscussion) {
        case EventState.QUEUE_MANAGER_DIRECTS:
          this.handleQueueManagerDirectToStation(customerToProcess)
          break
        case EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE:
          this.handleQueueMangerRequiresAssistance(customerToProcess)
          break
        case EventState.CUSTOMER_MISSING_DOCUMENTS:
          this.handleCustomerMissingDocuments(customerToProcess)
          break
        case State.EXIT: // SOLVES CUSTOMER ISSUE SUCCESSFULLY
          updateCustomerDwellTimeAndExitSimulation(customerToProcess)
          break
      }
    })
  }

  handleQueueManagerDirectToStation(customer: Customer) {
    const station: Station = returnResultBasedOnProb(StateFromQueueManagerDirectProb)
    stationManager.appendCustomerToStationQueue(station, customer)
  }

  handleQueueMangerRequiresAssistance(customer: Customer) {
    const queueManagerActionFromRequiresAssistance: State | EventState = returnResultBasedOnProb(StateFromQueueManagerRequiresAssistanceProb)

    this.startTimerForQueueManager(customer, false, true).then(() => {
      switch (queueManagerActionFromRequiresAssistance) {
        case EventState.QUEUE_MANAGER_DIRECTS:
          this.handleQueueManagerDirectToStation(customer)
          break
        case State.EXIT: // SOLVES CUSTOMER ISSUE SUCCESSFULLY
          updateCustomerDwellTimeAndExitSimulation(customer)
          break
      }
    })
  }

  handleCustomerMissingDocuments(customer: Customer) {
    const customerMissingDocumentAction: State = returnResultBasedOnProb(StateFromMissingDocumentsProb)

    switch (customerMissingDocumentAction) {
      case State.RETURN_LATER_QA:
        returnLaterQueueAgainManager.appendCustomerToReturnLaterQueueAgainQueue(customer)
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  // Repeatedly running simulation
  startMainQueueLoop() {
    const intervalId = setInterval(() => {
      this.updateQueueManagerInfo();
      // this.handleQueueManagerDiscussion()
    }, 100); // Adjust time as necessary
  
    // Return a cleanup function
    return () => clearInterval(intervalId);
  }
}

export const mainQueueManager = new MainQueueManager()
