import { create } from 'zustand'
import { DemographicArrivalProbType } from './types/demographicArrivalProb'
import { SolutionChoice } from './enums/solutionChoice'

interface AppState {
  solutionChoice: SolutionChoice;
  setSolutionChoice: (choice: SolutionChoice) => void
  speedMultiplier: number
  setSpeedMultiplier: (multiplier: number) => void
  isDataCollectionHours: boolean
  setIsDataCollectionHours: (conditionResult: boolean) => void
  demographicArrivalProb: DemographicArrivalProbType
  setDemographicArrivalProb: (prob: DemographicArrivalProbType) => void
}

export const useStore = create<AppState>((set) => ({
  solutionChoice: SolutionChoice.NONE,
  setSolutionChoice: (choice: SolutionChoice) => set(() => ({ solutionChoice: choice })),
  speedMultiplier: 10000,
  setSpeedMultiplier: (multiplier: number) => set(() => ({ speedMultiplier: multiplier })),
  isDataCollectionHours: false,
  setIsDataCollectionHours: (conditionResult: boolean) => set(() => ({ isDataCollectionHours: conditionResult })),
  demographicArrivalProb: {
    LOCAL_ELDERLY: 0.500,
    LOCAL_ADULT: 0.450,
    FOREIGNER: 0.050
  },
  setDemographicArrivalProb: (prob: DemographicArrivalProbType) => set(() => ({ demographicArrivalProb: prob }))
}))
