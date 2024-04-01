export const returnResultBasedOnDist = (distribution: number[]): number => {
  const mean: number = distribution.reduce((acc, val) => acc + val, 0) / distribution.length    
  const standardDeviation: number = Math.sqrt(distribution.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / distribution.length)
  
  // ASSIGN A PROBABILITY TO EACH NUMBER BASED ON ITS DISTANCE FROM THE MEAN
  const probabilities: number[] = distribution.map(num => {
    const distanceFromMean = Math.abs(num - mean)
    return Math.exp(-Math.pow(distanceFromMean / standardDeviation, 2))
  })
  
  // NORMALIZE PROBABILITIES TO SUM UP TO 1
  const totalProbability: number = probabilities.reduce((acc, val) => acc + val, 0)
  const normalizedProbabilities: number[] = probabilities.map(prob => prob / totalProbability)
  
  // SELECT A RANDOM NUMBER BASED ON THE ASSIGNED PROBABILITIES
  const randomNum: number = Math.random()
  let sum: number = 0

  for (let i = 0; i < normalizedProbabilities.length; i++) {
    sum += normalizedProbabilities[i]
    if (randomNum < sum) return distribution[i]
  }
  
  // FALLBACK TO THE LAST NUMBER IN CASE OF ROUNDING ERRORS
  return distribution[distribution.length - 1]
}
