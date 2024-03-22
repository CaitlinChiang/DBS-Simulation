import { Demographic } from '../enums/demographic'
import { State, StateFromArrival } from '../enums/states'
import { Station } from '../enums/station'

export type Customer = {
  id: string
  demographic: Demographic
  state: StateFromArrival | State | Station
  dwellTime: number
}
