import { create } from 'zustand'
import { DemographicArrivalProbType } from './types/demographicArrivalProb'
import { SolutionChoice } from './enums/solutionChoice'

interface AppState {
  solutionChoice: SolutionChoice;
  setSolutionChoice: (choice: SolutionChoice) => void
  speedMultiplier: number
  setSpeedMultiplier: (multiplier: number) => void
  isOpeningHours: boolean
  setIsOpeningHours: (conditionResult: boolean) => void
  isDataCollectionHours: boolean
  setIsDataCollectionHours: (conditionResult: boolean) => void
  demographicArrivalProb: DemographicArrivalProbType
  setDemographicArrivalProb: (prob: DemographicArrivalProbType) => void
}

export const useStore = create<AppState>((set) => ({
  solutionChoice: SolutionChoice.NONE,
  setSolutionChoice: (choice: SolutionChoice) => set(() => ({ solutionChoice: choice })),
  speedMultiplier: 1000,
  setSpeedMultiplier: (multiplier: number) => set(() => ({ speedMultiplier: multiplier })),
  isOpeningHours: true,
  setIsOpeningHours: (conditionResult: boolean) => set(() => ({ isOpeningHours: conditionResult })),
  isDataCollectionHours: false,
  setIsDataCollectionHours: (conditionResult: boolean) => set(() => ({ isDataCollectionHours: conditionResult })),
  demographicArrivalProb: {
    LOCAL_ELDERLY: 0.500,
    LOCAL_ADULT: 0.450,
    FOREIGNER: 0.050
  },
  setDemographicArrivalProb: (prob: DemographicArrivalProbType) => set(() => ({ demographicArrivalProb: prob }))
}))
