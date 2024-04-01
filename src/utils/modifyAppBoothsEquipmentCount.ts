import { SolutionChoice } from '../enums/solutionChoice'
import { useStore } from '../store/store'

export const modifyAppBoothsEquipmentCount = (equipmentCount: number): number => {
  const solutionChoice = useStore.getState().solutionChoice

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL) return equipmentCount + 1
  return equipmentCount
}
