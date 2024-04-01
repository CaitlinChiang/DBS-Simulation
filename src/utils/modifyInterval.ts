import { useStore } from '../store'

export const modifyInterval = (intervalInSeconds: number): number => {
  const { speedMultiplier } = useStore.getState()

  const intervalInMilliseconds: number = intervalInSeconds * 1000
  const intervalWithSpeedMultiplier: number = intervalInMilliseconds / speedMultiplier
  const roundedModifiedInterval: number = Math.max(0, Math.round(intervalWithSpeedMultiplier))
  
  return roundedModifiedInterval
}
