import { StationEquipmentAverageUsageTime } from '../enums/station'
import { SolutionChoice } from '../enums/solutionChoice'
import { useGlobal } from '../hooks/useGlobal'

export const modifyVTMEquipmentAverageUsageTime = (): number => {
  const { solutionChoice } = useGlobal()

  if (solutionChoice === SolutionChoice.VTM_VERIFICATION_REMOVAL) return 201
  return StationEquipmentAverageUsageTime.VTMS
}
