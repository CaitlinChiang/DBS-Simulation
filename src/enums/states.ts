export enum State {
  MAIN_QUEUE = 'MAIN_QUEUE',
  QUEUE_MANAGER_DISCUSSION = 'QUEUE_MANAGER_DISCUSSION',
  APP_BOOTHS = 'APP_BOOTHS',
  COUNTERS = 'COUNTERS',
  ATMS = 'ATMS',
  ATM_COINS = 'ATM_COINS',
  VTMS = 'VTMS',
  RETURN_LATER_QN = 'RETURN_LATER_QN',
  RETURN_LATER_QA = 'RETURN_LATER_QA',
  EXIT = 'EXIT'
}

export enum EventState {
  QUEUE_MANAGER_DIRECTS = 'QUEUE_MANAGER_DIRECTS',
  QUEUE_MANAGER_REQUIRES_ASSISTANCE = 'QUEUE_MANAGER_REQUIRES_ASSISTANCE',
  CUSTOMER_MISSING_DOCUMENTS = 'CUSTOMER_MISSING_DOCUMENTS',
  MISSED_QUEUE = 'MISSED_QUEUE'
}
