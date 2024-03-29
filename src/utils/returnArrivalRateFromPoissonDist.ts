import { SolutionChoice } from '../enums/solutionChoice'
import { useGlobal } from '../hooks/useGlobal'

const returnNormalDistribution = (x: number, mu: number, sigma: number): number => {
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));
}

const modifyArrivalRate = (arrivalRate: number): number => {
  const { solutionChoice } = useGlobal()

  switch (solutionChoice) {
    case SolutionChoice.SHARED_DATABASE:
      return arrivalRate * 0.833
    case SolutionChoice.ERROR_PREVENTION:
      return arrivalRate * 0.917
  }

  return arrivalRate
}

export const returnArrivalRateBasedFromPoissonDist = (hour: number): number => {
  const peakRate = 0.012
  const mu = 15 // peak hour as in 3 o'clock
  const sigma = 4 // standard deviation

  const peakValue = returnNormalDistribution(mu, mu, sigma)
  const scaleFactor = peakRate / peakValue
  const rate = returnNormalDistribution(hour, mu, sigma) * scaleFactor
  const modifiedRate = modifyArrivalRate(rate)

  return modifiedRate
}
