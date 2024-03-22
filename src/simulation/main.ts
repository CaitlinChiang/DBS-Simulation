import { ARRIVAL_RATE } from '../enums/rates'
import { generateCustomerFromArrivalRate, appendCustomerToArrivalStateQueue } from './generateCustomerFromArrivalRate'

generateCustomerFromArrivalRate(ARRIVAL_RATE, appendCustomerToArrivalStateQueue)
