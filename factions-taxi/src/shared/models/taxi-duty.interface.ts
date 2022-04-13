export interface TaxiDutyData {
  taximeterOpen: boolean;
  fare: number;
  currentRidePay: number;
  lastDistanceCheckTimestamp: number;
  lastDistanceCheckPosition: number[];
  riders: number[];
}
