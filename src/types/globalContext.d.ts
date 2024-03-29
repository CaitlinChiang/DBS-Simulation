import React, { createContext, useContext, useState, ReactNode } from 'react'
import { SolutionChoice } from '../enums/solutionChoice'

export type GlobalContextType = {
  solutionChoice: SolutionChoice
  setSolutionChoice: React.Dispatch<React.SetStateAction<SolutionChoice>>
  speedMultiplier: number
  setSpeedMultiplier: React.Dispatch<React.SetStateAction<number>>
}
