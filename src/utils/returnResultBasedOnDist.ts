export const returnResultBasedOnDist = (distribution: number[]): number => {
  const mean = distribution.reduce((acc, val) => acc + val, 0) / distribution.length    
  const standardDeviation = Math.sqrt(distribution.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / distribution.length)
  
  // Assign a probability to each number based on its distance from the mean
  const probabilities = distribution.map(num => {
    const distanceFromMean = Math.abs(num - mean)
    return Math.exp(-Math.pow(distanceFromMean / standardDeviation, 2))
  })
  
  // Normalize probabilities to sum up to 1
  const totalProbability = probabilities.reduce((acc, val) => acc + val, 0)
  const normalizedProbabilities = probabilities.map(prob => prob / totalProbability)
  
  // Select a random number based on the assigned probabilities
  const randomNum = Math.random()
  let sum = 0

  for (let i = 0; i < normalizedProbabilities.length; i++) {
    sum += normalizedProbabilities[i]
    if (randomNum < sum) return distribution[i]
  }
  
  // Fallback to the last number in case of rounding errors
  return distribution[distribution.length - 1]
}
