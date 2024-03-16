export enum StateFromArrivalProb {
  MAIN_QUEUE = 0.479,
  ATMS = 0.308,
  ATM_COINS = 0.039,
  VTMS = 0.067,
  RETURNING_LATER_QN = 0.107
}

export enum StateFromQueueProb {
  APP_BOOTHS = 0.257,
  COUNTERS = 0.510,
  ATMS = 0.140,
  ATM_COINS = 0.023,
  VTMS = 0.070
}

export enum QueueManagerEventStateProb {
  QUEUE_MANAGER_DIRECTS = 0.767,
  QUEUE_MANAGER_REQUIRES_ASSISTANCE = 0.163,
  QUEUE_MANAGER_SOLVES_ISSUE = 0.047,
  CUSTOMER_MISSING_DOCUMENTS = 0.023
}

export enum MissingDocumentsEventStateProb {
  RETURNING_LATER_QA = 0.700,
  EXIT = 0.300
}

export enum QueueNumberEventStateProb {
  MISSED_QUEUE = 0.200,
  COUNTERS = 0.800
}

export enum MissingQueueEventStateProb {
  RETURNING_LATER_QN = 0.500,
  EXIT = 0.500
}
