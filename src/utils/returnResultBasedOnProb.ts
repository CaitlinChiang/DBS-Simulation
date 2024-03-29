export const returnResultBasedOnProb = <T>(enumObj: { [s: string]: T }): any => {
  // Convert the enum to an array of [key, probability] pairs
  const entries = Object.entries(enumObj).filter(([key]) => isNaN(Number(key))) as [string, T][]
  
  // Extract and work with probabilities
  const probabilities = entries.map(([_, value]) => Number(value)).filter(value => !isNaN(value))

  // Generate a random number between 0 and 1
  const random = Math.random()
  let sum = 0

  // Determine which enum key corresponds to the random number
  for (let i = 0; i < probabilities.length; i++) {
    sum += probabilities[i]
    if (random <= sum) return entries[i][0]
  }
}
