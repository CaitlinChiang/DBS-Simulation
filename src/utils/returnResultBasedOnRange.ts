export const returnResultBasedOnRange = (range: number[]): number => {
  const min = range[0]
  const max = range[1]

  return Math.floor(Math.random() * (max - min + 1)) + min
}
