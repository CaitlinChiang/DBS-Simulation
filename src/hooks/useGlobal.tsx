import { createContext, useContext, useState, ReactNode } from 'react'
import { GlobalContextType } from '../types/globalContext'
import { SolutionChoice } from '../enums/solutionChoice'

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [solutionChoice, setSolutionChoice] = useState<SolutionChoice>(SolutionChoice.NONE)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1)

  return (
    <GlobalContext.Provider value={{ solutionChoice, setSolutionChoice, speedMultiplier, setSpeedMultiplier }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobal = () => {
  const context = useContext(GlobalContext)
  if (context === undefined) throw new Error('useGlobal must be used within a GlobalProvider')
  return context
}
