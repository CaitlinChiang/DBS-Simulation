export enum StateFromArrivalOpeningHoursProb {
  MAIN_QUEUE = 0.479,
  ATMS = 0.308,
  ATM_COINS = 0.039,
  VTMS = 0.067,
  RETURN_LATER_QN = 0.107
}
export enum StateFromArrivalClosingHoursProb {
  VTMS = 1.000
}

export enum StateFromMainQueueProb {
  QUEUE_MANAGER_DISCUSSION = 0.950,
  EXIT = 0.050
}

export enum StateFromQueueManagerDiscussionProb {
  QUEUE_MANAGER_DIRECTS = 0.767,
  QUEUE_MANAGER_REQUIRES_ASSISTANCE = 0.163,
  CUSTOMER_MISSING_DOCUMENTS = 0.023,
  EXIT = 0.047
}
export enum StateFromQueueManagerDiscussionProbSolutionStaffEducation {
  QUEUE_MANAGER_DIRECTS = 0.921,
  CUSTOMER_MISSING_DOCUMENTS = 0.023,
  EXIT = 0.056
}
export enum StateFromQueueManagerDiscussionProbSolutionErrorPrevention {
  QUEUE_MANAGER_DIRECTS = 0.785,
  QUEUE_MANAGER_REQUIRES_ASSISTANCE = 0.167,
  EXIT = 0.048
}

export enum StateFromQueueManagerDirectsProb {
  APP_BOOTHS = 0.257,
  COUNTERS = 0.510,
  ATMS = 0.140,
  ATM_COINS = 0.023,
  VTMS = 0.070
}

export enum StateFromQueueManagerRequiresAssistanceProb {
  QUEUE_MANAGER_DIRECTS = 0.200,
  EXIT = 0.800
}

export enum StateFromCustomerMissingDocumentsProb {
  RETURN_LATER_QA = 0.700,
  EXIT = 0.300
}

export enum StateFromReturnLaterQNProb {
  COUNTERS = 0.800,
  MISSED_QUEUE = 0.200
}

export enum StateFromMissedQueueProb {
  RETURN_LATER_QN = 0.500,
  EXIT = 0.500
}
