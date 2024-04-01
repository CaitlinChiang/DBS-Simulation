import { StationEquipmentAverageUsageTime } from '../enums/station'
import { SolutionChoice } from '../enums/solutionChoice'
import { useStore } from '../store/store'

export const modifyVTMEquipmentAverageUsageTime = (): number => {
  const { solutionChoice } = useStore.getState()

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL) return 201
  return StationEquipmentAverageUsageTime.VTMS
}
