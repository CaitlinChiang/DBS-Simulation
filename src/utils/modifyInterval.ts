import { useStore } from '../store/store'

export const modifyInterval = (intervalInSeconds: number): number => {
  const speedMultiplier = useStore.getState().speedMultiplier

  const modifiedInterval = (intervalInSeconds * 1000) / speedMultiplier
  return Math.max(0, Math.round(modifiedInterval))
}
