export interface TruckerDeliveryPoint {
  pos: number[];
  type: TRUCKER_DELIVERY_TYPE;
}

export enum TRUCKER_DELIVERY_TYPE {
  CARGO = 0,
  ELECTRICITY,
  OIL,
}

export enum TRUCKER_PAGES {
  MAIN = 0,
  LEGAL = 1,
  ILLEGAL = 2,
}

export interface Trucker {
  distance: number;
  type: string;
}
