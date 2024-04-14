import { Customer } from '../types/customer'
import { MainQueueManagerInfo } from '../types/managerInfo'
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
import { useStore } from '../store'

class MainQueueManager {
  private mainQueue: Customer[] = []
  private isQueueManagerAvailable: boolean = true
  private queueManagerDiscussionEndTime: number = 0
  private queueManagerAssistanceEndTime: number = 0

  getMainQueueManagerInfo(): MainQueueManagerInfo {
    return {
      queueLength: this.mainQueue.length,
      queue: this.mainQueue,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      queueManagerDiscussionEndTime: this.queueManagerDiscussionEndTime,
      queueManagerAssistanceEndTime: this.queueManagerAssistanceEndTime,
    }
  }

  resetMainQueueManager(): void {
    this.mainQueue = []
    this.isQueueManagerAvailable = true
    this.queueManagerDiscussionEndTime = 0
    this.queueManagerAssistanceEndTime = 0
  }

  appendCustomerToMainQueue(customer: Customer): void {
    this.handleCustomerActionFromStartOfMainQueue(customer)
  }

  handleCustomerActionFromStartOfMainQueue(customer: Customer): void {
    const customerFirstActionFromMainQueue: State = returnResultBasedOnProb(StateFromMainQueueProb)

    switch (customerFirstActionFromMainQueue) {
      case State.QUEUE_MANAGER_DISCUSSION:
        customer.state = State.QUEUE_MANAGER_DISCUSSION
        this.mainQueue.push(customer)
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  async updateQueueManagerInfo(): Promise<void> {
    const isQueueManagerAvailable: boolean = this.queueManagerDiscussionEndTime === 0 && this.queueManagerAssistanceEndTime === 0
    this.isQueueManagerAvailable = isQueueManagerAvailable
  }

  async isSystemAbleToProcessNextCustomer(): Promise<boolean> {
    const isMainQueueNotEmpty: boolean = this.mainQueue.length > 0

    if (isMainQueueNotEmpty && this.isQueueManagerAvailable) return true
    return false
  }

  async setDiscussionEndTimeForQueueManager(customer: Customer): Promise<void> {
    const averageTimeSpentInQueueManagerDiscussion: number = returnResultBasedOnDist(QUEUE_MANAGER_DISCUSSION_DIST)
    this.queueManagerDiscussionEndTime = Date.now() + calculateTotalStationTime(averageTimeSpentInQueueManagerDiscussion, customer)
  }

  async waitForDiscussionEndTime(): Promise<void> {
    const promise = new Promise<void>(resolve => {
      const checkTimeInterval = setInterval(() => {
        if (Date.now() >= this.queueManagerDiscussionEndTime) {
          clearInterval(checkTimeInterval)
          resolve()
        }
      }, modifyInterval(1000))
    })
    return promise
  }

  async handleQueueManagerDiscussion(): Promise<void> {
    const isSystemAbleToProcessNextCustomer: boolean = await this.isSystemAbleToProcessNextCustomer()
    if (!isSystemAbleToProcessNextCustomer) return

    const queueManagerActionFromDiscussion: State | EventState = returnAppropriateStateForQueueManagerDiscussionProb()
    const customerToProcess: Customer | any = this.mainQueue.shift()

    await this.setDiscussionEndTimeForQueueManager(customerToProcess)
    await this.waitForDiscussionEndTime()
    this.queueManagerDiscussionEndTime = 0

    switch (queueManagerActionFromDiscussion) {
      case EventState.QUEUE_MANAGER_DIRECTS:
        this.handleQueueManagerDirectsToStation(customerToProcess)
        break
      case EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE:
        this.handleQueueMangerRequiresAssistance(customerToProcess)
        break
      case EventState.CUSTOMER_MISSING_DOCUMENTS:
        const { isOpeningHours } = useStore.getState()

        if (isOpeningHours) this.handleCustomerMissingDocuments(customerToProcess)
        break
      case State.EXIT: // SOLVES CUSTOMER ISSUE SUCCESSFULLY
        updateCustomerDwellTimeAndExitSimulation(customerToProcess)
        break
    }
  }

  async setAssistanceEndTimeForQueueManager(customer: Customer): Promise<void> {
    const averageTimeSpentInQueueManagerAssistance: number = returnResultBasedOnDist(QUEUE_MANAGER_ASSISTANCE_DIST)
    this.queueManagerAssistanceEndTime = Date.now() + calculateTotalStationTime(averageTimeSpentInQueueManagerAssistance, customer)
  }

  async waitForAssistanceEndTime(): Promise<void> {
    const promise = new Promise<void>(resolve => {
      const checkTimeInterval = setInterval(() => {
        if (Date.now() >= this.queueManagerAssistanceEndTime) {
          clearInterval(checkTimeInterval)
          resolve()
        }
      }, modifyInterval(1000))
    })
    return promise
  }

  async handleQueueMangerRequiresAssistance(customer: Customer): Promise<void> {
    const queueManagerActionFromRequiresAssistance: State | EventState = returnResultBasedOnProb(StateFromQueueManagerRequiresAssistanceProb)

    await this.setAssistanceEndTimeForQueueManager(customer)
    await this.waitForAssistanceEndTime()
    this.queueManagerAssistanceEndTime = 0

    switch (queueManagerActionFromRequiresAssistance) {
      case EventState.QUEUE_MANAGER_DIRECTS:
        this.handleQueueManagerDirectsToStation(customer)
        break
      case State.EXIT: // SOLVES CUSTOMER ISSUE SUCCESSFULLY
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  handleQueueManagerDirectsToStation(customer: Customer): void {
    const station: Station = returnResultBasedOnProb(StateFromQueueManagerDirectsProb)
    stationManager.appendCustomerToStationQueue(station, customer)
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

  async startSubsystemSimulation() {
    while (true) {
      await this.updateQueueManagerInfo()

      if (this.mainQueue.length > 0 && this.isQueueManagerAvailable) {
        await this.handleQueueManagerDiscussion()
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }
}

export const mainQueueManager = new MainQueueManager()
