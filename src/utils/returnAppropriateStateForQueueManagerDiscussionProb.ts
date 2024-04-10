import { State, EventState } from '../enums/states'
import { StateFromQueueManagerDiscussionProb, StateFromQueueManagerDiscussionProbSolutionStaffEducation, StateFromQueueManagerDiscussionProbSolutionErrorPrevention, StateFromQueueManagerDiscussionProbAll } from '../enums/probabilities'
import { SolutionChoice } from '../enums/solutionChoice'
import { returnResultBasedOnProb } from './returnResultBasedOnProb'
import { useStore } from '../store'

export const returnAppropriateStateForQueueManagerDiscussionProb = (): State | EventState => {
  const { solutionChoice } = useStore.getState()

  switch (solutionChoice) {
    case SolutionChoice.STAFF_EDUCATION:
      return returnResultBasedOnProb(StateFromQueueManagerDiscussionProbSolutionStaffEducation)
    case SolutionChoice.ERROR_PREVENTION:
      return returnResultBasedOnProb(StateFromQueueManagerDiscussionProbSolutionErrorPrevention)
    case SolutionChoice.ALL:
      return returnResultBasedOnProb(StateFromQueueManagerDiscussionProbAll)
    }

  return returnResultBasedOnProb(StateFromQueueManagerDiscussionProb)
}
