import { useGlobal } from '../hooks/useGlobal'

export const modifyInterval = (intervalInSeconds: number): number => {
  const { speedMultiplier } = useGlobal()

  const modifiedInterval = (intervalInSeconds * 1000) / speedMultiplier
  return Math.max(1, Math.round(modifiedInterval))
}
