import { SolutionChoice } from '../enums/solutionChoice'
import { useStore } from '../store'

export const modifyAppBoothsEquipmentCount = (equipmentCount: number): number => {
  const { solutionChoice } = useStore.getState()

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL || solutionChoice === SolutionChoice.ALL) {
    return equipmentCount + 1
  }
  return equipmentCount
}
