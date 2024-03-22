import { Demographic } from '../enums/demographic'

class AverageDemographicDwellTimeManager {
  private demographicDwellTimeData: Record<Demographic, { totalDwellTime: number, count: number }>

  constructor() {
    this.demographicDwellTimeData = {
      [Demographic.LOCAL_ELDERLY]: { totalDwellTime: 0, count: 0 },
      [Demographic.LOCAL_ADULT]: { totalDwellTime: 0, count: 0 },
      [Demographic.FOREIGNER]: { totalDwellTime: 0, count: 0 }
    }
  }

  updateDemographicDwellTime(demographic: Demographic, dwellTime: number) {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]

    demographicDwellTime.totalDwellTime += dwellTime
    demographicDwellTime.count += 1
  }

  calculateAverageDwellTime(demographic: Demographic): number {
    const demographicDwellTime = this.demographicDwellTimeData[demographic]
    const { count, totalDwellTime } = demographicDwellTime

    if (count === 0) return 0
    return totalDwellTime / count
  }

  getAverageDwellTimeByDemographic(): { demographic: Demographic, averageDwellTime: number }[] {
    return [
      { demographic: Demographic.LOCAL_ELDERLY, averageDwellTime: this.calculateAverageDwellTime(Demographic.LOCAL_ELDERLY) },
      { demographic: Demographic.LOCAL_ADULT, averageDwellTime: this.calculateAverageDwellTime(Demographic.LOCAL_ADULT) },
      { demographic: Demographic.FOREIGNER, averageDwellTime: this.calculateAverageDwellTime(Demographic.FOREIGNER) }
    ]
  }
}

export const averageDemographicDwellTimeManager = new AverageDemographicDwellTimeManager()
