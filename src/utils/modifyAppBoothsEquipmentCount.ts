import { SolutionChoice } from '../enums/solutionChoice'
import { useGlobal } from '../hooks/useGlobal'

export const modifyAppBoothsEquipmentCount = (equipmentCount: number): number => {
  const { solutionChoice } = useGlobal()

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL) return equipmentCount + 1
  return equipmentCount
}
