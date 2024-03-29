import { Customer } from '../types/customer'
import { MainQueueLengthAndQueueManagerInfo } from '../types/managerInfo'
import { State, EventState } from '../enums/states'
import { StateFromMainQueueProb, StateFromQueueManagerDirectsProb, StateFromQueueManagerRequiresAssistanceProb, StateFromCustomerMissingDocumentsProb } from '../enums/probabilities'
import { QUEUE_MANAGER_DISCUSSION_DIST, QUEUE_MANAGER_ASSISTANCE_DIST } from '../enums/distributions'
import { Station } from '../enums/station'
import { calculateTotalStationTime } from '../utils/calculateTime'
import { modifyInterval } from '../utils/modifyInterval'
import { returnAppropriateStateForQueueManagerDiscussionProb } from '../utils/returnAppropriateStateForQueueManagerDiscussionProb'
import { returnResultBasedOnDist } from '../utils/returnResultBasedOnDist'
import { returnResultBasedOnProb } from '../utils/returnResultBasedOnProb'
import { updateCustomerDwellTimeAndExitSimulation } from '../utils/updateCustomerDwellTimeAndExitSimulation'
import { returnLaterQueueAgainManager } from './returnLaterQueueAgainManager'
import { stationManager } from './stationManager'

class MainQueueManager {
  constructor() {}

  private mainQueue: Customer[] = []
  private isQueueManagerAvailable: boolean = true
  private queueManagerDiscussionTimer: number = 0
  private queueManagerAssistanceTimer: number = 0

  getMainQueueLengthAndQueueManagerInfo(): MainQueueLengthAndQueueManagerInfo {
    return {
      mainQueueLength: this.mainQueue.length,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      isQueueManagerDiscussing: this.queueManagerDiscussionTimer > 0,
      isQueueManagerAssisting: this.queueManagerAssistanceTimer > 0,
      queueManagerDiscussionTimer: this.queueManagerDiscussionTimer,
      queueManagerAssistanceTimer: this.queueManagerAssistanceTimer,
    }
  }

  appendCustomerToMainQueue(customer: Customer): void {
    this.handleCustomerActionFromStartOfMainQueue(customer)
  }

  handleCustomerActionFromStartOfMainQueue(customer: Customer): void {
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

  updateQueueManagerInfo(): void {
    if (this.queueManagerDiscussionTimer > 0) this.queueManagerDiscussionTimer--
    if (this.queueManagerAssistanceTimer > 0) this.queueManagerAssistanceTimer--

    const isQueueManagerTimersBothZero: boolean = this.queueManagerDiscussionTimer === 0 && this.queueManagerAssistanceTimer === 0
    if (isQueueManagerTimersBothZero) this.isQueueManagerAvailable = true
  }

  isSystemAbleToProcessNextCustomer(): boolean {
    const isMainQueueNotEmpty: boolean = this.mainQueue.length > 0

    if (isMainQueueNotEmpty && this.isQueueManagerAvailable) return true
    return false
  }

  startDiscussionTimerForQueueManager(customer: Customer): Promise<void> {
    return new Promise((resolve) => {
      const averageTimeSpentInQueueManagerDiscussion: number = returnResultBasedOnDist(QUEUE_MANAGER_DISCUSSION_DIST)
      this.queueManagerDiscussionTimer = calculateTotalStationTime(averageTimeSpentInQueueManagerDiscussion, customer)

      setTimeout(() => {
        this.queueManagerDiscussionTimer = 0
        resolve()
      }, this.queueManagerDiscussionTimer)
    })
  }

  handleQueueManagerDiscussion(customer: Customer): void {
    customer.state = State.QUEUE_MANAGER_DISCUSSION
    this.mainQueue.push(customer)

    if (!this.isSystemAbleToProcessNextCustomer) return

    const queueManagerActionFromDiscussion: State | EventState = returnAppropriateStateForQueueManagerDiscussionProb()
    const customerToProcess: Customer | any = this.mainQueue.shift()

    this.startDiscussionTimerForQueueManager(customerToProcess).then(() => {
      switch (queueManagerActionFromDiscussion) {
        case EventState.QUEUE_MANAGER_DIRECTS:
          this.handleQueueManagerDirectsToStation(customerToProcess)
          break
        case EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE:
          this.handleQueueMangerRequiresAssistance(customerToProcess)
          break
        case EventState.CUSTOMER_MISSING_DOCUMENTS:
          this.handleCustomerMissingDocuments(customerToProcess)
          break
        case State.EXIT: // solves customer issue successfully
          updateCustomerDwellTimeAndExitSimulation(customerToProcess)
          break
      }
    })
  }

  handleQueueManagerDirectsToStation(customer: Customer): void {
    const station: Station = returnResultBasedOnProb(StateFromQueueManagerDirectsProb)
    stationManager.appendCustomerToStationQueue(station, customer)
  }

  startAssistanceTimerForQueueManager(customer: Customer): Promise<void> {
    return new Promise((resolve) => {
      const averageTimeSpentInQueueManagerAssistance: number = returnResultBasedOnDist(QUEUE_MANAGER_ASSISTANCE_DIST)
      this.queueManagerAssistanceTimer = calculateTotalStationTime(averageTimeSpentInQueueManagerAssistance, customer)

      setTimeout(() => {
        this.queueManagerAssistanceTimer = 0
        resolve()
      }, this.queueManagerAssistanceTimer)
    })
  }

  handleQueueMangerRequiresAssistance(customer: Customer): void {
    const queueManagerActionFromRequiresAssistance: State | EventState = returnResultBasedOnProb(StateFromQueueManagerRequiresAssistanceProb)

    this.startAssistanceTimerForQueueManager(customer).then(() => {
      switch (queueManagerActionFromRequiresAssistance) {
        case EventState.QUEUE_MANAGER_DIRECTS:
          this.handleQueueManagerDirectsToStation(customer)
          break
        case State.EXIT: // solves customer issue successfully
          updateCustomerDwellTimeAndExitSimulation(customer)
          break
      }
    })
  }

  handleCustomerMissingDocuments(customer: Customer): void {
    const customerActionFromMissingDocuments: State = returnResultBasedOnProb(StateFromCustomerMissingDocumentsProb)

    switch (customerActionFromMissingDocuments) {
      case State.RETURN_LATER_QA:
        returnLaterQueueAgainManager.appendCustomerToReturnLaterQueueAgainQueue(customer)
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  startSubsystemSimulation() {
    const intervalId = setInterval(() => {
      this.updateQueueManagerInfo()
    }, modifyInterval(1000))
  
    return () => clearInterval(intervalId)
  }
}

export const mainQueueManager = new MainQueueManager()
