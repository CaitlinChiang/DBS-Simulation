import { Demographic } from '../enums/demographics'
import { State } from '../enums/states'

export type Customer = {
  id: number
  demographic: Demographic
  state: State
  waiting: Boolean
}
