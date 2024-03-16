import { Customer } from '../types/customer'
import { randomizeDemographic, randomizeStateFromArrival } from './randomizeDecisions'

export const generateCustomer = () => {
  const newCustomer: Customer = {
    id: (new Date()).toISOString(),
    demographic: randomizeDemographic(),
    state: randomizeStateFromArrival(),
    dwellTime: 0
  }

  return newCustomer
}
