import React, { createContext, useContext, useState } from 'react';

// Defines the shape of the context data
interface SimulationSpeedContextType {
  speedMultiplier: number;
  setSpeedMultiplier: (value: number) => void;
}

// Create the context with a default value
const SimulationSpeedContext = createContext<SimulationSpeedContextType | undefined>(undefined);

// Provider component that allows consuming components to subscribe to context changes
export const SimulationSpeedProvider: React.FC = ({ children }) => {
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // Default speed multiplier is 1

  return (
    <SimulationSpeedContext.Provider value={{ speedMultiplier, setSpeedMultiplier }}>
      {children}
    </SimulationSpeedContext.Provider>
  );
};

// Custom hook to use the simulation speed context
export const useSimulationSpeed = () => {
  const context = useContext(SimulationSpeedContext);
  if (context === undefined) {
    throw new Error('useSimulationSpeed must be used within a SimulationSpeedProvider');
  }
  return context;
};
