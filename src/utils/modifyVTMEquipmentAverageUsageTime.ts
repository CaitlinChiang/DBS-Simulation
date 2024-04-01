import { StationEquipmentAverageUsageTime } from '../enums/station'
import { SolutionChoice } from '../enums/solutionChoice'
import { useStore } from '../store'

export const modifyVTMEquipmentAverageUsageTime = (): number => {
  const { solutionChoice } = useStore.getState()

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL) {
    return 201 // PRESUMED NUMBER OF SECONDS IT TAKES IF THE SECOND VTM VERIFICATION IS REMOVED
  }
  return StationEquipmentAverageUsageTime.VTMS
}
