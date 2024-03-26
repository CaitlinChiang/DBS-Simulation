import { Demographic } from '../enums/demographic'
import { State } from '../enums/states'
import { Station } from '../enums/station'

export type Customer = {
  id: string
  demographic: Demographic
  state: State | Station
  dwellTime: number
  qaDelayTime?: number
}
