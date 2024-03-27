import { useSimulationSpeed } from '../components/hooks/useSimulationSpeed'

export const convertToAdjustedInterval = (intervalInSeconds: number): number => {
  const { speedMultiplier } = useSimulationSpeed()
  const adjustedInterval = intervalInSeconds * 1000 / speedMultiplier

  return Math.max(1, Math.round(adjustedInterval))
};
