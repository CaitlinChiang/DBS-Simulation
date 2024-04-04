export enum Station {
  APP_BOOTHS = 'APP_BOOTHS',
  COUNTERS = 'COUNTERS',
  ATMS = 'ATMS',
  ATM_COINS = 'ATM_COINS',
  VTMS = 'VTMS'
}

export enum StationEquipmentAverageUsageTime {
  APP_BOOTHS = 360,
  COUNTERS = 5000,
  ATMS = 300,
  ATM_COINS = 660,
  VTMS = 516
}

export enum StationEquipmentCount {
  APP_BOOTHS = 2,
  COUNTERS = 11,
  ATMS = 6,
  ATM_COINS = 1,
  VTMS = 3
}

export enum StationEquipmentStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT'
}
