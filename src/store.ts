import { create } from 'zustand'
import { SolutionChoice } from './enums/solutionChoice'

interface AppState {
  solutionChoice: SolutionChoice;
  setSolutionChoice: (choice: SolutionChoice) => void
  speedMultiplier: number
  setSpeedMultiplier: (multiplier: number) => void
}

export const useStore = create<AppState>((set) => ({
  solutionChoice: SolutionChoice.NONE,
  setSolutionChoice: (choice: SolutionChoice) => set(() => ({ solutionChoice: choice })),
  speedMultiplier: 20,
  setSpeedMultiplier: (multiplier: number) => set(() => ({ speedMultiplier: multiplier })),
}))
