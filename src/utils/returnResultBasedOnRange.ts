export const returnResultBasedOnRange = (range: number[]): number => {
  const min: number = range[0]
  const max: number = range[1]
  const randomNumberFromRange: number = Math.random() * (max - min + 1)
  const roundedResult: number = Math.floor(randomNumberFromRange) + min

  return roundedResult
}
