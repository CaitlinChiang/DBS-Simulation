export enum Demographic {
  LOCAL_ELDERLY = 'LOCAL_ELDERLY',
  LOCAL_ADULT = 'LOCAL_ADULT',
  FOREIGNER = 'FOREIGNER'
}

export enum DemographicAdditionalServiceTime {
  LOCAL_ELDERLY = 480,
  LOCAL_ADULT = 0,
  FOREIGNER = 240
}

export enum DemographicArrivalProb {
  LOCAL_ELDERLY = 0.500,
  LOCAL_ADULT = 0.450,
  FOREIGNER = 0.050
}
