import { State, EventState } from '../enums/states'
import { StateFromArrivalProb, StateFromQueueProb, QueueManagerEventStateProb, MissingDocumentsEventStateProb, QueueNumberEventStateProb, MissingQueueEventStateProb } from '../enums/probabilities'
import { decideNextActionBasedOnProb } from './returnResultBasedOnProb'


export const randomizeQueueManagerDecision = (): EventState => decideNextActionBasedOnProb(QueueManagerEventStateProb)
export const randomizeStateFromManagerDirection = (): State => decideNextActionBasedOnProb(StateFromQueueProb)
export const randomizeMissingDocumentsNextActions = (): State => decideNextActionBasedOnProb(MissingDocumentsEventStateProb)
export const randomizeQueueNumberNextActions = (): State | EventState => decideNextActionBasedOnProb(QueueNumberEventStateProb)
export const randomizeMissingQueueNextActions = (): State => decideNextActionBasedOnProb(MissingQueueEventStateProb)
