export enum StateFromArrivalProb {
  MAIN_QUEUE = 0.479,
  ATMS = 0.308,
  ATM_COINS = 0.039,
  VTMS = 0.067,
  RETURN_LATER_QN = 0.107
}

export enum StateFromMainQueueProb {
  QUEUE_MANAGER_DISCUSSION = 0.950,
  EXIT = 0.050
}

export enum StateFromQueueManagerDiscussionResultProb {
  QUEUE_MANAGER_DIRECTS = 0.767,
  QUEUE_MANAGER_REQUIRES_ASSISTANCE = 0.163,
  CUSTOMER_MISSING_DOCUMENTS = 0.023,
  EXIT = 0.047,
}

export enum StateFromQueueManagerDirectProb {
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

export enum StateFromMissingDocumentsProb {
  RETURNING_LATER_QA = 0.700,
  EXIT = 0.300
}

export enum StateFromReturnLaterQNProb {
  MISSED_QUEUE = 0.200,
  COUNTERS = 0.800
}

export enum StateFromMissingQNProb {
  RETURNING_LATER_QN = 0.500,
  EXIT = 0.500
}
