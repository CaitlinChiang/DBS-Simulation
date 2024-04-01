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
  private queueManagerDiscussionEndTime: number = 0
  private queueManagerAssistanceEndTime: number = 0

  getMainQueueLengthAndQueueManagerInfo(): MainQueueLengthAndQueueManagerInfo {
    return {
      mainQueueLength: this.mainQueue.length,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      isQueueManagerDiscussing: this.queueManagerDiscussionEndTime > 0,
      isQueueManagerAssisting: this.queueManagerAssistanceEndTime > 0,
      queueManagerDiscussionEndTime: this.queueManagerDiscussionEndTime,
      queueManagerAssistanceEndTime: this.queueManagerAssistanceEndTime,
    }
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
        this.handleQueueManagerDiscussion()
        break
      case State.EXIT:
        updateCustomerDwellTimeAndExitSimulation(customer)
        break
    }
  }

  async updateQueueManagerInfo(): Promise<void> {
    const isQueueManagerAvailable: boolean = this.queueManagerDiscussionEndTime === 0 && this.queueManagerAssistanceEndTime === 0

    if (isQueueManagerAvailable) {
      this.isQueueManagerAvailable = true
    } else {
      this.isQueueManagerAvailable = false
    }
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
    return new Promise(resolve => {
      const checkTimeInterval = setInterval(() => {
        if (Date.now() >= this.queueManagerDiscussionEndTime) {
          clearInterval(checkTimeInterval)
          
          resolve()
        }
      }, modifyInterval(1000))
    })
  }

  async handleQueueManagerDiscussion(): Promise<void> {
    const isSystemAbleToProcessNextCustomer: boolean = await this.isSystemAbleToProcessNextCustomer()
    if (!isSystemAbleToProcessNextCustomer) return

    console.log({
      from: 'after system check',
      mainQueueLength: this.mainQueue.length,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      isQueueManagerDiscussing: this.queueManagerDiscussionEndTime > 0,
      isQueueManagerAssisting: this.queueManagerAssistanceEndTime > 0,
      queueManagerDiscussionEndTime: this.queueManagerDiscussionEndTime,
      queueManagerAssistanceEndTime: this.queueManagerAssistanceEndTime
    })

    const queueManagerActionFromDiscussion: State | EventState = returnAppropriateStateForQueueManagerDiscussionProb()
    const customerToProcess: Customer | any = this.mainQueue.shift()

    await this.setDiscussionEndTimeForQueueManager(customerToProcess)
    await this.waitForDiscussionEndTime()
    this.queueManagerDiscussionEndTime = 0

    console.log({
      from: 'after discussion check',
      mainQueueLength: this.mainQueue.length,
      isQueueManagerAvailable: this.isQueueManagerAvailable,
      isQueueManagerDiscussing: this.queueManagerDiscussionEndTime > 0,
      isQueueManagerAssisting: this.queueManagerAssistanceEndTime > 0,
      queueManagerDiscussionEndTime: this.queueManagerDiscussionEndTime,
      queueManagerAssistanceEndTime: this.queueManagerAssistanceEndTime
    })

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
      case State.EXIT: // Solves Customer Issue Successfully
        updateCustomerDwellTimeAndExitSimulation(customerToProcess)
        break
    }
  }

  async setAssistanceEndTimeForQueueManager(customer: Customer): Promise<void> {
    const averageTimeSpentInQueueManagerAssistance: number = returnResultBasedOnDist(QUEUE_MANAGER_ASSISTANCE_DIST)
    this.queueManagerAssistanceEndTime = Date.now() + calculateTotalStationTime(averageTimeSpentInQueueManagerAssistance, customer)
  }

  async waitForAssistanceEndTime(): Promise<void> {
    return new Promise(resolve => {
      const checkTimeInterval = setInterval(() => {
        if (Date.now() >= this.queueManagerAssistanceEndTime) {
          clearInterval(checkTimeInterval)
          resolve()
        }
      }, modifyInterval(1000))
    })
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
      case State.EXIT: // Solves Customer Issue Successfully
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

  // startSubsystemSimulation() {
  //   const intervalId = setInterval(() => {
  //     this.handleQueueManagerDiscussion()
  //   }, modifyInterval(1))
  
  //   return () => clearInterval(intervalId)
  // }

  startSubsystemSimulation() {
    let keepRunning = true;
  
    const run = async () => {
      while (keepRunning) {
        await this.handleQueueManagerDiscussion()
        await new Promise(resolve => setTimeout(resolve, modifyInterval(100)));
      }
    };
  
    run(); // Start the loop immediately
  
    // Return a function to stop the simulation
    return () => { keepRunning = false; };
  }
}

export const mainQueueManager = new MainQueueManager()
