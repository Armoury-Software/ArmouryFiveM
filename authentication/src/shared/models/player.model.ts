export interface PlayerBase {
  hoursPlayed: number;
  id: number;
}

export interface PlayerMonitored extends PlayerBase {
  lastHoursPlayedCheck: Date;
}

export interface Player extends PlayerBase {
  adminLevel: number;
  bank: number;
  cash: number;
  email: string;
  name: string;
  phone: number;
}