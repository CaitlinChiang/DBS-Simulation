import { create } from 'zustand'
import { SolutionChoice } from './enums/solutionChoice'

interface AppState {
  solutionChoice: SolutionChoice;
  setSolutionChoice: (choice: SolutionChoice) => void
  speedMultiplier: number
  setSpeedMultiplier: (multiplier: number) => void
  isDataCollectionHours: boolean
  setIsDataCollectionHours: (conditionResult: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  solutionChoice: SolutionChoice.NONE,
  setSolutionChoice: (choice: SolutionChoice) => set(() => ({ solutionChoice: choice })),
  speedMultiplier: 30,
  setSpeedMultiplier: (multiplier: number) => set(() => ({ speedMultiplier: multiplier })),
  isDataCollectionHours: false,
  setIsDataCollectionHours: (conditionResult: boolean) => set(() => ({ isDataCollectionHours: conditionResult }))
}))
