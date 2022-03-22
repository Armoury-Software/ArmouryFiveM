export interface CarrierDeliveryPoint {
  pos: number[];
  heading?: number;
}

export interface Carrier {
  packages: number;
  distance: number;
}
