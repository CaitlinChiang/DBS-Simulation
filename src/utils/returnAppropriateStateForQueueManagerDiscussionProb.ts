import { State, EventState } from '../enums/states'
import { StateFromQueueManagerDiscussionProb, StateFromQueueManagerDiscussionProbSolutionStaffEducation, StateFromQueueManagerDiscussionProbSolutionErrorPrevention } from '../enums/probabilities'
import { SolutionChoice } from '../enums/solutionChoice'
import { returnResultBasedOnProb } from './returnResultBasedOnProb'
import { useGlobal } from '../hooks/useGlobal'

export const returnAppropriateStateForQueueManagerDiscussionProb = (): State | EventState => {
  const { solutionChoice } = useGlobal()

  switch (solutionChoice) {
    case SolutionChoice.STAFF_EDUCATION:
      return returnResultBasedOnProb(StateFromQueueManagerDiscussionProbSolutionStaffEducation)
    case SolutionChoice.ERROR_PREVENTION:
      return returnResultBasedOnProb(StateFromQueueManagerDiscussionProbSolutionErrorPrevention)
  }

  return returnResultBasedOnProb(StateFromQueueManagerDiscussionProb)
}
