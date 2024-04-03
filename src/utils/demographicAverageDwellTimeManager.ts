import { DemographicAverageDwellTimeInfo } from '../types/managerInfo'
import { Demographic } from '../enums/demographic'

class DemographicAverageDwellTimeManager {
  private demographicDwellTimeData: Record<Demographic, { totalDwellTime: number, customerCount: number }>

  constructor() {
    this.demographicDwellTimeData = {
      [Demographic.LOCAL_ELDERLY]: { totalDwellTime: 0, customerCount: 0 },
      [Demographic.LOCAL_ADULT]: { totalDwellTime: 0, customerCount: 0 },
      [Demographic.FOREIGNER]: { totalDwellTime: 0, customerCount: 0 }
    }
  }

  calculateAverageDwellTime(demographic: Demographic): number {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]
    const { totalDwellTime, customerCount } = demographicDwellTime

    if (customerCount === 0) return 0
    return totalDwellTime / customerCount
  }

  getDemographicAverageDwellTimeInfo(): DemographicAverageDwellTimeInfo[] {
    return [
      { demographic: Demographic.LOCAL_ELDERLY, averageDwellTime: this.calculateAverageDwellTime(Demographic.LOCAL_ELDERLY) },
      { demographic: Demographic.LOCAL_ADULT, averageDwellTime: this.calculateAverageDwellTime(Demographic.LOCAL_ADULT) },
      { demographic: Demographic.FOREIGNER, averageDwellTime: this.calculateAverageDwellTime(Demographic.FOREIGNER) }
    ]
  }

  resetDemographicDwellTimeData(): void {
    this.demographicDwellTimeData = {
      [Demographic.LOCAL_ELDERLY]: { totalDwellTime: 0, customerCount: 0 },
      [Demographic.LOCAL_ADULT]: { totalDwellTime: 0, customerCount: 0 },
      [Demographic.FOREIGNER]: { totalDwellTime: 0, customerCount: 0 }
    }
  }

  updateDemographicDwellTimeData(demographic: Demographic, dwellTime: number): void {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]

    demographicDwellTime.totalDwellTime += dwellTime
    demographicDwellTime.customerCount += 1
  }
}

export const demographicAverageDwellTimeManager = new DemographicAverageDwellTimeManager()
