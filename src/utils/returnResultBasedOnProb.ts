export const returnResultBasedOnProb = <T>(enumObj: { [s: string]: T }): any => {
  // CONVERT THE ENUM TO AN ARRAY OF [KEY, PROBABILITY] PAIRS
  const entries = Object.entries(enumObj).filter(([key]) => isNaN(Number(key))) as [string, T][]
  
  // EXTRACT AND WORK WITH PROBABILITIES
  const probabilities = entries.map(([_, value]) => Number(value)).filter(value => !isNaN(value))

  // GENERATE A RANDOM NUMBER BETWEEN 0 AND 1
  const random = Math.random()
  let sum = 0

  // DETERMINE WHICH ENUM KEY CORRESPONDS TO THE RANDOM NUMBER
  for (let i = 0; i < probabilities.length; i++) {
    sum += probabilities[i]
    if (random <= sum) return entries[i][0]
  }
}
