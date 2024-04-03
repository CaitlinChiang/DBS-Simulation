import * as XLSX from 'xlsx'
import { DemographicAverageDwellTimeInfo } from '../types/managerInfo'
import { Demographic } from '../enums/demographic'

export const generateSimulationDataInExcel = (data: DemographicAverageDwellTimeInfo[][]): void => {
  const wb = XLSX.utils.book_new()

  Object.keys(data).forEach(day => {
    const dayData = data[parseInt(day)]
    const headers = ['Simulation Hour', Demographic.LOCAL_ELDERLY, Demographic.LOCAL_ADULT, Demographic.FOREIGNER, 'Average of All Demographics']
    const wsData = [headers]

    for (let hour = 0; hour < 24; hour++) {
      const hourString: any = hour.toString().padStart(2, '0')
      const hourlyData: any = dayData[hourString] || { [Demographic.LOCAL_ELDERLY]: 0, [Demographic.LOCAL_ADULT]: 0, [Demographic.FOREIGNER]: 0 }
      const averageDwellTime: string = (
        (hourlyData[Demographic.LOCAL_ELDERLY] + hourlyData[Demographic.LOCAL_ADULT] + hourlyData[Demographic.FOREIGNER]) / 3
      ).toFixed(2)

      wsData.push([
        hourString,
        hourlyData[Demographic.LOCAL_ELDERLY],
        hourlyData[Demographic.LOCAL_ADULT],
        hourlyData[Demographic.FOREIGNER],
        averageDwellTime
      ])
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData)
    XLSX.utils.book_append_sheet(wb, ws, `Day ${day}`)
  })

  XLSX.writeFile(wb, 'SimulationData.xlsx')
}
